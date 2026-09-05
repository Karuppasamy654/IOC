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
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Evaluator Observability Demo
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              8 Agents Step Trace
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Agent Execution Activity & Telemetry Trace</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Step-by-step trace showing real-time agent reasoning, observations, tool calls, persistent memory lookups, and actions.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Activity Trace</span>
        </button>
      </div>

      {/* Traces List */}
      <div className="space-y-4">
        {traces.length === 0 ? (
          <div className="saas-card p-8 text-center text-slate-500 text-xs font-medium">
            No active execution trace logs found. Click "1-Click Adaptive Demo" in the navigation bar to trigger a live multi-agent loop!
          </div>
        ) : (
          traces.map((trace, idx) => {
            const stepNum = trace.step_number || idx + 1;

            return (
              <div key={trace.id || idx} className="saas-card p-5 space-y-3 bg-white border border-slate-200">
                {/* Header line */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 font-mono text-xs font-bold text-white">
                      Step {stepNum}
                    </span>
                    <span className="text-sm font-black text-slate-900">{trace.agent_name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-medium">
                      Confidence: <span className="text-emerald-700 font-bold">{Math.round(trace.confidence * 100)}%</span>
                    </span>
                    {trace.timestamp && (
                      <span className="text-slate-400 font-mono text-[11px]">{trace.timestamp.slice(11, 19)}</span>
                    )}
                  </div>
                </div>

                {/* Observation & Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Observation</span>
                    <p className="text-slate-800 font-medium leading-snug">{trace.observation}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Evidence Collected</span>
                    <ul className="space-y-0.5 text-slate-700 font-medium">
                      {trace.evidence?.map((ev, evIdx) => (
                        <li key={evIdx} className="flex items-start gap-1">
                          <span className="text-indigo-600">&bull;</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Decision & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-1">
                    <span className="font-bold text-indigo-700 uppercase text-[10px] block">Decision</span>
                    <p className="text-slate-900 font-semibold leading-snug">{trace.decision}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-1">
                    <span className="font-bold text-indigo-700 uppercase text-[10px] block">Action Executed</span>
                    <p className="text-slate-900 font-semibold leading-snug">{trace.action}</p>
                  </div>
                </div>

                {/* Tool Invocations & Memory Context */}
                {(trace.tool_called || trace.memory_retrieved_summary) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {trace.tool_called && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-slate-800">
                        <span className="text-amber-800 font-bold flex items-center gap-1 mb-0.5">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Tool Call: {trace.tool_called}</span>
                        </span>
                        <p className="text-slate-700 text-[11px]">{trace.tool_result_summary}</p>
                      </div>
                    )}

                    {trace.memory_retrieved_summary && (
                      <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-slate-800">
                        <span className="text-purple-800 font-bold flex items-center gap-1 mb-0.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Persistent Memory Lookup</span>
                        </span>
                        <p className="text-slate-700 text-[11px]">{trace.memory_retrieved_summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Outcome & Next Handoff */}
                {trace.outcome_summary && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{trace.outcome_summary}</span>
                    </span>
                    {trace.next_agent && (
                      <span className="text-slate-500 font-mono text-[11px]">
                        Handoff &rarr; <span className="text-indigo-700 font-bold">{trace.next_agent}</span>
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
