import React from 'react';
import { Cpu, TrendingUp, CheckCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { StrategyRecord } from '../types';

interface StrategyEffectivenessMatrixProps {
  strategies: StrategyRecord[];
}

export const StrategyEffectivenessMatrix: React.FC<StrategyEffectivenessMatrixProps> = ({ strategies }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Persistent Strategy Memory Engine</h2>
              <p className="text-xs text-slate-400">
                Reinforcement layer tracking empirical yields of learning interventions across student cohorts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Continuous Vector Retrieval Active</span>
        </div>
      </div>

      {/* Core Concept Explanation Card */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
        <span className="font-bold text-indigo-300 uppercase tracking-wider block">
          Key Agentic Innovation: Autonomous Strategy Adaptation
        </span>
        <p>
          The system does not arbitrarily guess study interventions. When a weakness is diagnosed, Agent 7 retrieves the highest-yielding strategy stored in memory based on statistical track records. When the student reassesses, the resulting delta is fed back into memory to continuously refine future scheduling.
        </p>
      </div>

      {/* Strategy Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Empirical Strategy Yield Table</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Ranked by Average Improvement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">Strategy Name</th>
                <th className="py-3 px-4">Target Topic</th>
                <th className="py-3 px-4">Weakness Type</th>
                <th className="py-3 px-4">Pre &rarr; Post</th>
                <th className="py-3 px-4">Improvement</th>
                <th className="py-3 px-4">Success Rate</th>
                <th className="py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {strategies.map((s) => {
                const isHighly = s.effectiveness_rating === 'Highly Effective';
                const isModerate = s.effectiveness_rating === 'Moderate';

                return (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-all">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{s.strategy_name}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{s.context}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{s.topic}</td>
                    <td className="py-3 px-4 text-slate-400">{s.weakness_type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {s.average_before_score}% &rarr; {s.average_after_score}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold font-mono ${isHighly ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'}`}>
                        +{s.average_improvement}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {Math.round(s.success_rate * 100)}% (N={s.sample_count})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          isHighly
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isModerate
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {s.effectiveness_rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
