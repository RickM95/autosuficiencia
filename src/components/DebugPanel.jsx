import React, { useState } from 'react';

/**
 * DebugPanel.jsx
 * A collapsible panel for inspecting Nephi's internal reasoning and state.
 */

const DebugPanel = ({ debugData }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!debugData) return null;

  const {
    intent,
    domains,
    progressState,
    decision,
    orchestrator,
    memory,
    lang
  } = debugData;

  const Section = ({ title, children }) => (
    <div className="mb-4 border-b border-white/10 pb-2 last:border-0">
      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const Stat = ({ label, value, color = "text-white/80" }) => (
    <div className="flex justify-between text-[11px]">
      <span className="text-white/40">{label}:</span>
      <span className={color}>{value}</span>
    </div>
  );

  return (
    <div className="fixed top-4 right-4 z-50 w-72 max-h-[80vh] overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl transition-all duration-300">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
        id="debug_toggle_001"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-white/90">Nephi Debug Dashboard</span>
        </div>
        <span className="text-white/40">{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-48px)] scrollbar-thin scrollbar-thumb-white/10">
          <Section title="🧠 Intent">
            <Stat label="Detected" value={intent?.intent || 'none'} color="text-green-400" />
            <Stat label="Confidence" value={`${Math.round((intent?.confidence || 0) * 100)}%`} />
            <Stat label="Continuation" value={intent?.isContinuation ? 'Yes' : 'No'} />
          </Section>

          <Section title="🧠 Domains">
            {Object.entries(domains || {}).map(([name, data]) => (
              <Stat key={name} label={name} value={data.detected ? 'DETECTED' : 'no'} color={data.detected ? 'text-blue-400' : 'text-white/20'} />
            ))}
          </Section>

          <Section title="🧠 Progress State">
            <Stat label="Debt" value={progressState?.hasDebt ? 'CAPTURED' : 'missing'} color={progressState?.hasDebt ? 'text-yellow-400' : 'text-white/20'} />
            <Stat label="Income" value={progressState?.hasIncome ? 'CAPTURED' : 'missing'} color={progressState?.hasIncome ? 'text-yellow-400' : 'text-white/20'} />
            <Stat label="Employment" value={progressState?.hasEmployment ? 'CAPTURED' : 'missing'} color={progressState?.hasEmployment ? 'text-yellow-400' : 'text-white/20'} />
            <Stat label="Goal" value={progressState?.hasGoal ? 'CAPTURED' : 'missing'} color={progressState?.hasGoal ? 'text-yellow-400' : 'text-white/20'} />
          </Section>

          <Section title="🧠 Decision Engine">
            <Stat label="Action" value={decision?.action || 'none'} />
            <Stat label="Reason" value={decision?.reason || 'default flow'} color="text-white/60 italic" />
          </Section>

          <Section title="🧠 Orchestrator">
            <Stat label="Decision Source" value={orchestrator?.source || 'unified_flow'} color="text-purple-400" />
            <Stat label="Language" value={lang || 'es'} color="text-pink-400" />
            <Stat label="External Knowledge" value={orchestrator?.hasExternalKnowledge ? 'FETCHED' : 'none'} color={orchestrator?.hasExternalKnowledge ? 'text-green-400' : 'text-white/20'} />
            <Stat label="Emotional Priority" value={orchestrator?.emotionalDistress?.isCritical ? 'CRITICAL' : 'normal'} color={orchestrator?.emotionalDistress?.isCritical ? 'text-red-400' : 'text-white/20'} />
          </Section>

          <Section title="🧠 Memory Snapshot">
            <div className="mt-2 space-y-2">
              {(memory?.lastMessages || []).slice(-3).map((msg, i) => (
                <div key={i} className="bg-white/5 p-2 rounded text-[10px] text-white/50">
                  <span className="font-bold uppercase text-[8px] text-white/30 block mb-1">{msg.role}</span>
                  {msg.content?.substring(0, 50)}...
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
