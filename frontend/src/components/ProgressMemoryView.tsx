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
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Evaluator Transparency Layer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Persistent Multi-Tier Memory Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Placement Progress & Student Memory</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            View your competency matrix alongside the AI's persistent memory of your learning experiences, recurring code mistakes, and high-yield intervention strategies.
          </p>
        </div>

        {/* Sub-tab Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'matrix' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Competency Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('memory')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'memory' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Memory
          </button>
          <button
            onClick={() => setActiveSubTab('strategies')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'strategies' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Strategy Memory
          </button>
        </div>
      </div>

      {/* 2. Subtab 1: Competency Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Subject Competency & Gap Analysis Matrix</h3>
            <span className="text-xs text-slate-500 font-medium">8 Core Placement Subjects</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="p-3">Topic / Domain</th>
                  <th className="p-3">Mastery Score</th>
                  <th className="p-3">Concept Mastery</th>
                  <th className="p-3">Implementation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Target Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competencies.map((comp) => {
                  const score = comp.mastery_score;
                  const isLow = score < 50;
                  const isHigh = score >= 75;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{comp.topic}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{score}%</span>
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                isLow ? 'bg-rose-500' : isHigh ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{comp.concept_mastery}%</td>
                      <td className="p-3 font-semibold text-slate-700">{comp.implementation_mastery}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isHigh
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-600">
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
            <div className="saas-card p-5 border-l-4 border-l-emerald-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Strong Topics</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mr-1.5 mb-1">
                  DBMS (78%)
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  SQL Queries (85%)
                </span>
              </div>
            </div>

            {/* Weak Topics */}
            <div className="saas-card p-5 border-l-4 border-l-rose-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                <span>Weak Topics</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 mr-1.5 mb-1">
                  Graphs BFS/DFS (52%)
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  OS Deadlocks (45%)
                </span>
              </div>
            </div>

            {/* Recurring Mistake */}
            <div className="saas-card p-5 border-l-4 border-l-amber-500 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Recurring Mistake</span>
                <History className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                BFS visited-array marked on pop instead of push (`visited_array_omission`)
              </p>
              <span className="text-[10px] text-amber-700 font-semibold block">Logged 2x in Mistake Memory</span>
            </div>

            {/* Effective Strategy */}
            <div className="saas-card p-5 border-l-4 border-l-indigo-600 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>Effective Strategy</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Visual Explanation + Guided Learning
              </p>
              <span className="text-[10px] text-emerald-700 font-bold block">+29.0% Score Yield</span>
            </div>
          </div>

          {/* Detailed Memory Tiers Breakdown */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Multi-Tier Memory State</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-900 border-b border-slate-200 pb-2">
                  <span>Tier A: Student Profile Memory</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Stable</span>
                </div>
                <p className="text-slate-700">Stores student goals, target company (Amazon SDE), available prep time (30 days / 3 hrs/day), and academic background.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-900 border-b border-slate-200 pb-2">
                  <span>Tier B: Episodic Experience Memory</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Outcome Log</span>
                </div>
                <p className="text-slate-700">Tracks before-and-after scores across intervention sessions (e.g., Graphs score improved from 35% to 68% after visual breakdown).</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-900 border-b border-slate-200 pb-2">
                  <span>Tier D: Mistake Pattern Memory</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">Error Track</span>
                </div>
                <p className="text-slate-700">Stores code execution flaw signatures like `visited_array_omission` to trigger specific remediation content.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Subtab 3: Strategy Effectiveness Matrix */}
      {activeSubTab === 'strategies' && (
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pedagogical Strategy Yield & Win Rates</h3>
              <p className="text-xs text-slate-500">Tier C Strategy Memory measuring empirical score improvements across student cohorts</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
              Vector Cosine Retriever Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strat) => (
              <div key={strat.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{strat.strategy_name}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +{strat.average_improvement}% Score Gain
                  </span>
                </div>

                <p className="text-xs text-slate-600">{strat.context}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <span className="text-slate-500 block">Topic</span>
                    <span className="font-bold text-slate-800">{strat.topic}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <span className="text-slate-500 block">Win Rate</span>
                    <span className="font-bold text-emerald-700">{strat.success_rate}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <span className="text-slate-500 block">Samples</span>
                    <span className="font-bold text-slate-800">{strat.sample_count}</span>
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
