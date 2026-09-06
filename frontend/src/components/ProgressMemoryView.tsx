import React, { useState } from 'react';
import { BarChart3, Cpu, AlertTriangle, CheckCircle2, Sparkles, Database, History, TrendingUp, Zap } from 'lucide-react';
import { Competency, WeaknessItem, StrategyRecord } from '../types';

interface ProgressMemoryViewProps {
  competencies: Competency[];
  weaknesses: WeaknessItem[];
  strategies: StrategyRecord[];
}

export const ProgressMemoryView: React.FC<ProgressMemoryViewProps> = ({
  competencies,
  weaknesses,
  strategies
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'memory' | 'strategies'>('matrix');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold subtle-badge-indigo">
              Evaluator Transparency Layer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold subtle-badge-emerald">
              Persistent Multi-Tier Memory Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Placement Progress & Student Memory</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            View your competency matrix alongside the AI's persistent memory of your learning experiences, recurring code mistakes, and high-yield intervention strategies.
          </p>
        </div>

        {/* Sub-tab Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/15">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'matrix' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Competency Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('memory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'memory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Memory
          </button>
          <button
            onClick={() => setActiveSubTab('strategies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'strategies' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Strategy Memory
          </button>
        </div>
      </div>

      {/* 2. Subtab 1: Competency Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Subject Competency & Gap Analysis Matrix</h3>
            <span className="text-xs text-slate-400 font-medium">8 Core Placement Subjects</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <th className="p-3">Topic / Domain</th>
                  <th className="p-3">Mastery Score</th>
                  <th className="p-3">Concept Mastery</th>
                  <th className="p-3">Implementation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Target Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {competencies.map((comp) => {
                  const score = comp.mastery_score;
                  const isLow = score < 50;
                  const isHigh = score >= 75;

                  return (
                    <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{comp.topic}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{score}%</span>
                          <div className="w-24 bg-slate-950 rounded-full h-1.5 border border-white/10">
                            <div
                              className={`h-1.5 rounded-full ${
                                isLow ? 'bg-rose-500' : isHigh ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{comp.concept_mastery}%</td>
                      <td className="p-3 font-semibold text-slate-300">{comp.implementation_mastery}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow
                              ? 'subtle-badge-rose'
                              : isHigh
                              ? 'subtle-badge-emerald'
                              : 'subtle-badge-amber'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-400">
                        -{Math.max(0, 85 - score)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Subtab 2: Multi-Tier Student Memory Visualizer (Section 12 Spec) */}
      {activeSubTab === 'memory' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Strong Topics */}
            <div className="glass-card p-5 border-l-4 border-l-emerald-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>Strong Topics</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold subtle-badge-emerald mr-1.5 mb-1">
                  DBMS (78%)
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold subtle-badge-emerald">
                  SQL Queries (85%)
                </span>
              </div>
            </div>

            {/* Weak Topics */}
            <div className="glass-card p-5 border-l-4 border-l-rose-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <span>Weak Topics</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold subtle-badge-rose mr-1.5 mb-1">
                  Graphs BFS/DFS (52%)
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold subtle-badge-rose">
                  OS Deadlocks (45%)
                </span>
              </div>
            </div>

            {/* Recurring Mistake */}
            <div className="glass-card p-5 border-l-4 border-l-amber-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Recurring Mistake</span>
                <History className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-bold text-slate-200 leading-snug">
                BFS visited-array marked on pop instead of push (`visited_array_omission`)
              </p>
              <span className="text-[10px] text-amber-400 font-semibold block">Logged 2x in Mistake Memory</span>
            </div>

            {/* Effective Strategy */}
            <div className="glass-card p-5 border-l-4 border-l-indigo-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span>Effective Strategy</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs font-bold text-slate-200 leading-snug">
                Visual Explanation + Guided Learning
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block">+29.0% Score Yield</span>
            </div>
          </div>

          {/* Detailed Memory Tiers Breakdown */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Multi-Tier Memory State</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-300 border-b border-white/10 pb-2">
                  <span>Tier A: Student Profile Memory</span>
                  <span className="text-[10px] subtle-badge-indigo px-1.5 py-0.5 rounded">Stable</span>
                </div>
                <p className="text-slate-300">Stores student goals, target company (Amazon SDE), available prep time (30 days / 3 hrs/day), and academic background.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-300 border-b border-white/10 pb-2">
                  <span>Tier B: Episodic Experience Memory</span>
                  <span className="text-[10px] subtle-badge-emerald px-1.5 py-0.5 rounded">Outcome Log</span>
                </div>
                <p className="text-slate-300">Tracks before-and-after scores across intervention sessions (e.g., Graphs score improved from 35% to 68% after visual breakdown).</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-300 border-b border-white/10 pb-2">
                  <span>Tier D: Mistake Pattern Memory</span>
                  <span className="text-[10px] subtle-badge-rose px-1.5 py-0.5 rounded">Error Track</span>
                </div>
                <p className="text-slate-300">Stores code execution flaw signatures like `visited_array_omission` to trigger specific remediation content.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Subtab 3: Strategy Effectiveness Matrix */}
      {activeSubTab === 'strategies' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Pedagogical Strategy Yield & Win Rates</h3>
              <p className="text-xs text-slate-400">Tier C Strategy Memory measuring empirical score improvements across student cohorts</p>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/70 px-2.5 py-1 rounded border border-indigo-500/30">
              Vector Cosine Retriever Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strat) => (
              <div key={strat.id} className="p-4 rounded-xl border border-white/15 bg-slate-950/60 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{strat.strategy_name}</span>
                  <span className="text-xs font-bold subtle-badge-emerald px-2 py-0.5 rounded">
                    +{strat.average_improvement}% Score Gain
                  </span>
                </div>

                <p className="text-xs text-slate-300">{strat.context}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-slate-900 border border-white/10 text-center">
                    <span className="text-slate-400 block">Topic</span>
                    <span className="font-bold text-slate-200">{strat.topic}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-white/10 text-center">
                    <span className="text-slate-400 block">Win Rate</span>
                    <span className="font-bold text-emerald-400">{strat.success_rate}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-white/10 text-center">
                    <span className="text-slate-400 block">Samples</span>
                    <span className="font-bold text-slate-200">{strat.sample_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
