import { ConversationMemory, PythonBridge, KnowledgeBase, DocumentImporter, ReasoningEngine, assembleResponse } from './index.js';

export class AICore {
  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.memory = new ConversationMemory();
    this.kb = new KnowledgeBase();
    this.py = new PythonBridge();
    this.importer = new DocumentImporter(this.kb, this.py);
    this.engine = new ReasoningEngine(this.memory, this.debugMode);

    this.listeners = {
      onResponse: [],
      onError: [],
      onThinking: [],
      onDataUpdate: [],
      onDebug: [],
      onResponseChunk: []
    };

    this._isInitializing = false;
    this._isInitialized = false;
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners[event] = [];
    } else {
      for (let key in this.listeners) {
        this.listeners[key] = [];
      }
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.warn('[AICore] listener error:', e); }
      });
    }
  }

  async initialize() {
    if (this._isInitialized) return { status: 'ready', stats: await this.kb.getStats() };
    if (this._isInitializing) throw new Error('Initialization already in progress');

    this._isInitializing = true;
    const startTime = performance.now();
    try {
      this.emit('onThinking', 'Initializing Knowledge Base...');
      await this.engine.init();
      const stats = await this.kb.getStats();
      this._isInitialized = true;
      this.emit('onThinking', 'System Ready');

      this.emit('onDebug', {
        phase: 'initialization',
        duration: performance.now() - startTime,
        status: 'success'
      });

      return { status: 'ready', stats };
    } catch (error) {
      this.emit('onError', error.message);
      this.emit('onDebug', { phase: 'initialization', error: error.message });
      return { status: 'error', message: error.message };
    } finally {
      this._isInitializing = false;
    }
  }

  async importDocument(file) {
    try {
      this.emit('onThinking', `Importing ${file.name}...`);
      await this.importer.importFromFile(file, (pct, msg) => {
        this.emit('onThinking', msg || `Processing: ${pct}%`);
      });
      const stats = await this.kb.getStats();
      this.emit('onDataUpdate', { type: 'kb_stats', stats });
      return true;
    } catch (error) {
      this.emit('onError', `Failed to import: ${error.message}`);
      return false;
    }
  }

  async processMessage(userMessage, formData, budgetData, userContext) {
    const startTime = performance.now();
    try {
      this.emit('onThinking', 'Analyzing...');

      const analysis = await this.engine.processMessage(formData, budgetData, userMessage);

      const formUpdates = analysis.progressState?.capturedFields || [];
      if (formUpdates.length > 0) {
        this.emit('onDataUpdate', { type: 'form_update', fields: formUpdates });
      }

      const lang = this.memory.language || 'es';
      const reply = assembleResponse(
        analysis.stage, analysis, userContext || {}, budgetData || [], this.memory, userMessage, lang
      );

      if (this.debugMode && reply.length > 100) {
        const chunkSize = Math.ceil(reply.length / 3);
        for (let i = 0; i < reply.length; i += chunkSize) {
          this.emit('onResponseChunk', reply.slice(i, i + chunkSize));
        }
      }

      this.emit('onResponse', {
        role: 'assistant',
        content: reply,
        debug: {
          intent: analysis.intents[0],
          domains: analysis.domains,
          decision: analysis.decision
        }
      });

      this.emit('onDebug', {
        phase: 'processMessage',
        duration: performance.now() - startTime,
        replyLength: reply.length,
        intent: analysis.intents[0],
        mode: this.memory.activeMode
      });

      return reply;
    } catch (error) {
      this.emit('onError', `Processing error: ${error.message}`);
      this.emit('onDebug', { phase: 'processMessage', error: error.message });
      throw error;
    }
  }
}
