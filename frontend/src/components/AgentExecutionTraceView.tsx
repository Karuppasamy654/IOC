import React from 'react';
import { Cpu, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';
import { AgentTrace } from '../types';

interface AgentExecutionTraceViewProps {
  traces: AgentTrace[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AgentExecutionTraceView: React.FC<AgentExecutionTraceViewProps> = ({
  traces,
  onRefresh,
  isRefreshing
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/60 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
              Evaluator Observability Demo
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald">
              8 Agents Step Trace
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Agent Execution Activity & Telemetry Trace</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Step-by-step trace showing real-time agent reasoning, observations, tool calls, persistent memory lookups, and actions.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel hover:bg-slate-800 text-slate-200 border border-white/15 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Activity Trace</span>
        </button>
      </div>

      {/* Traces List */}
      <div className="space-y-4">
        {traces.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-xs font-medium border border-white/10">
            No active execution trace logs found. Click "Trigger Adaptive Agent Loop" in the navigation bar to execute a live multi-agent cycle!
          </div>
        ) : (
          traces.map((trace, idx) => {
            const stepNum = trace.step_number || idx + 1;

            return (
              <div key={trace.id || idx} className="glass-card p-5 space-y-3.5 border border-white/15 saas-card-hover">
                {/* Header line */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-mono text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                      Step {stepNum}
                    </span>
                    <span className="text-sm font-black text-white">{trace.agent_name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-medium">
                      Confidence: <span className="text-emerald-400 font-bold">{Math.round(trace.confidence * 100)}%</span>
                    </span>
                    {trace.timestamp && (
                      <span className="text-slate-500 font-mono text-[11px]">{trace.timestamp.slice(11, 19)}</span>
                    )}
                  </div>
                </div>

                {/* Observation & Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Observation</span>
                    <p className="text-slate-200 font-medium leading-snug">{trace.observation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Evidence Collected</span>
                    <ul className="space-y-1 text-slate-300 font-medium">
                      {trace.evidence?.map((ev, evIdx) => (
                        <li key={evIdx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">&bull;</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Decision & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl glass-panel border border-indigo-500/30 bg-indigo-950/30 space-y-1">
                    <span className="font-bold text-indigo-300 uppercase text-[10px] block">Decision</span>
                    <p className="text-white font-semibold leading-snug">{trace.decision}</p>
                  </div>

                  <div className="p-3.5 rounded-xl glass-panel border border-indigo-500/30 bg-indigo-950/30 space-y-1">
                    <span className="font-bold text-indigo-300 uppercase text-[10px] block">Action Executed</span>
                    <p className="text-white font-semibold leading-snug">{trace.action}</p>
                  </div>
                </div>

                {/* Tool Invocations & Memory Context */}
                {(trace.tool_called || trace.memory_retrieved_summary) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {trace.tool_called && (
                      <div className="p-3 rounded-xl subtle-badge-amber border border-amber-500/30 text-slate-200">
                        <span className="text-amber-300 font-bold flex items-center gap-1.5 mb-1">
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tool Call: {trace.tool_called}</span>
                        </span>
                        <p className="text-slate-300 text-[11px]">{trace.tool_result_summary}</p>
                      </div>
                    )}

                    {trace.memory_retrieved_summary && (
                      <div className="p-3 rounded-xl subtle-badge-purple border border-purple-500/30 text-slate-200">
                        <span className="text-purple-300 font-bold flex items-center gap-1.5 mb-1">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          <span>Persistent Memory Lookup</span>
                        </span>
                        <p className="text-slate-300 text-[11px]">{trace.memory_retrieved_summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Outcome & Next Handoff */}
                {trace.outcome_summary && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{trace.outcome_summary}</span>
                    </span>
                    {trace.next_agent && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        Handoff &rarr; <span className="text-indigo-300 font-bold">{trace.next_agent}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
