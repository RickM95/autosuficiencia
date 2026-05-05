import { AICore } from './AICore.js';

const core = new AICore(false);

let queue = [];
let isProcessing = false;
let latestVersion = 0;
let abortController = new AbortController();
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;
const BACKOFF_BASE = 500;

core.on('onThinking', (msg) => postMessage({ type: 'onThinking', payload: msg }));
core.on('onResponse', (data) => postMessage({ type: 'onResponse', payload: data }));
core.on('onError', (err) => postMessage({ type: 'onError', payload: err }));
core.on('onDataUpdate', (data) => postMessage({ type: 'onDataUpdate', payload: data }));
core.on('onDebug', (data) => postMessage({ type: 'onDebug', payload: data }));
core.on('onResponseChunk', (chunk) => postMessage({ type: 'onResponseChunk', payload: chunk }));

async function backoff(attempt) {
  const delay = BACKOFF_BASE * Math.pow(2, Math.min(attempt, 3));
  await new Promise(r => setTimeout(r, delay));
}

async function handleJob(job) {
  if (job.action === 'PROCESS_MESSAGE') {
    const { userMessage, formData, budgetData, userContext, version } = job.payload;
    if (version < latestVersion) {
      postMessage({ type: 'onDebug', payload: { phase: 'queue_drop', version, latestVersion } });
      return;
    }

    const response = await core.processMessage(userMessage, formData, budgetData, userContext);
    postMessage({ type: 'onVersionedResponse', payload: { version, response } });

  } else if (job.action === 'SYNC_STATE') {
    const { formData, budgetData, userContext, version } = job.payload;
    if (version) latestVersion = version;
    if (core.memory && formData) core.memory.extractFactsFromForm(formData);
    postMessage({ type: 'onDebug', payload: { phase: 'state_synced', version: latestVersion } });

  } else if (job.action === 'INIT') {
    const result = await core.initialize();
    postMessage({ type: 'INIT_COMPLETE', payload: result });

  } else if (job.action === 'IMPORT_DOCUMENT') {
    const result = await core.importDocument(job.payload.file);
    postMessage({ type: 'DOCUMENT_IMPORTED', payload: { success: result, name: job.payload.file.name } });

  } else if (job.action === 'CLEAR_MEMORY') {
    core.memory.reset();
    postMessage({ type: 'MEMORY_CLEARED' });

  } else if (job.action === 'SET_MODE') {
    const { mode, context } = job.payload;
    if (mode) {
      core.memory.enterMode(mode, context);
    } else {
      core.memory.exitMode();
    }
    postMessage({ type: 'onDebug', payload: { phase: 'mode_set', mode } });

  } else if (job.action === 'ABORT') {
    abortController.abort();
    abortController = new AbortController();
    queue = [];
    isProcessing = false;
    postMessage({ type: 'onDebug', payload: { phase: 'aborted' } });
  }
}

async function processNext() {
  if (isProcessing) return;
  if (queue.length === 0) return;

  isProcessing = true;
  const job = queue.shift();

  try {
    await handleJob(job);
    consecutiveErrors = 0;
  } catch (err) {
    consecutiveErrors++;
    postMessage({ type: 'onError', payload: err.message });
    postMessage({ type: 'onDebug', payload: { phase: 'job_error', action: job.action, error: err.message, consecutiveErrors } });

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      postMessage({ type: 'onError', payload: 'CRITICAL: Too many consecutive errors. Applying backoff.' });
      consecutiveErrors = 0;
      await backoff(3);
    } else if (consecutiveErrors > 0) {
      await backoff(consecutiveErrors);
    }
  } finally {
    isProcessing = false;
    processNext();
  }
}

function enqueue(job) {
  queue.push(job);
  if (queue.length > 20) {
    queue.shift();
    postMessage({ type: 'onDebug', payload: { phase: 'queue_overflow', dropped: true } });
  }
  if (!isProcessing) processNext();
}

self.onmessage = (e) => {
  enqueue(e.data);
};
