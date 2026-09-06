import React, { useState } from 'react';
import { Compass, Clock, History, ArrowRight, BookOpen, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdaptivePlan } from '../types';

interface AdaptivePlanViewProps {
  currentPlan: AdaptivePlan | null;
  planHistory: AdaptivePlan[];
  onTriggerReplan: () => void;
  isReplanning: boolean;
}

export const AdaptivePlanView: React.FC<AdaptivePlanViewProps> = ({
  currentPlan,
  planHistory,
  onTriggerReplan,
  isReplanning
}) => {
  const [selectedPlanVersion, setSelectedPlanVersion] = useState<number | null>(null);

  const activeVersion = currentPlan?.version || 1;
  const displayedPlan = selectedPlanVersion
    ? planHistory.find((p) => p.version === selectedPlanVersion) || currentPlan
    : currentPlan;

  // 30-Day Roadmap Breakdown structure
  const roadmapWeeks = [
    {
      week: 'Week 1: Core Fundamentals & Primary High-Yield Topics',
      days: 'Days 1 – 7',
      focus: 'Data Structures & DBMS Core',
      status: 'Completed',
      topics: [
        { name: 'DSA Fundamentals — Arrays, Queues & Stacks', type: 'Concept + MCQs', companyPattern: 'High Frequency' },
        { name: 'DBMS Core — Normalization & ER Diagrams', type: 'Output Prediction', companyPattern: 'Company Pattern' },
        { name: 'C++ Output Tracing & Pointers', type: 'Technical MCQs', companyPattern: 'Syntax Flaw Target' }
      ]
    },
    {
      week: 'Week 2: Advanced Data Structures & Operating Systems',
      days: 'Days 8 – 14',
      focus: 'Graphs, Trees & OS Process Management',
      status: 'Active (Current)',
      topics: [
        { name: 'Trees & Graph Traversal (BFS/DFS Invariants)', type: 'Output + Guided Practice', companyPattern: 'Company Pattern' },
        { name: 'OS Process Synchronization & Deadlocks', type: 'Conceptual MCQs', companyPattern: 'High Priority' },
        { name: 'SQL Joins & Nested Aggregations', type: 'SQL Output Questions', companyPattern: 'Company Pattern' }
      ]
    },
    {
      week: 'Week 3: OOP Invariants, Networks & Complex Practice',
      days: 'Days 15 – 21',
      focus: 'OOP Principles, Computer Networks & DP Invariants',
      status: 'Upcoming',
      topics: [
        { name: 'OOP Principles — Inheritance, Virtual Tables & Memory', type: 'Output Tracing', companyPattern: 'Company Pattern' },
        { name: 'Computer Networks — TCP/IP & HTTP Headers', type: 'Technical MCQs', companyPattern: 'Medium Frequency' },
        { name: 'Company Assessment Style Practice Set #1', type: 'Mock Technical OA', companyPattern: 'Full Simulation' }
      ]
    },
    {
      week: 'Week 4: Final Revision, Weak Area Focus & Mock OAs',
      days: 'Days 22 – 30',
      focus: 'Targeted Reassessment & Full Mock Assessments',
      status: 'Upcoming',
      topics: [
        { name: 'Targeted Reassessment on Diagnosed Weak Topics', type: 'Adaptive Practice', companyPattern: 'Custom AI Interventions' },
        { name: 'Comprehensive Placement Mock Assessment #1 & #2', type: 'Timed Placement Test', companyPattern: 'Company OA Replica' },
        { name: 'Final Formula & Algorithm Invariant Revision', type: 'Speed Revision', companyPattern: 'High Yield' }
      ]
    }
  ];

  // Adaptation Decision Rationale Data for active version
  const adaptationRationale = {
    observation: displayedPlan?.observation || 'Assessment #1 score reached 45% in Operating Systems with repeated deadlock condition errors, while Graph BFS score improved to 68%.',
    decision: displayedPlan?.decision || 'Increase Operating Systems study allocation from Low to High priority; shift Graph BFS from High to Medium maintenance.',
    action: displayedPlan?.action || 'Generated Plan v2 adding 45 minutes of OS Process Synchronization conceptual MCQs and Deadlock output tracing.',
    reason: displayedPlan?.reason || 'Target company assessment pattern allocates 25% weight to OS synchronization, making this the highest yield score recovery target.',
    outcome: displayedPlan?.outcome || 'Expected +14% score recovery in OS within 3 days.'
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 border border-white/15 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
              Personalized 30-Day Roadmap
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald">
              Plan v{activeVersion} Active
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Placement Preparation Roadmap & Schedule</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Dynamically adapted by Agent 8 (Adaptive Planner) based on your target company assessment style and diagnosed performance gaps.
          </p>
        </div>

        <button
          onClick={onTriggerReplan}
          disabled={isReplanning}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 border border-indigo-400/30"
        >
          {isReplanning ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{isReplanning ? 'Re-evaluating Performance...' : 'Trigger Adaptive Replan'}</span>
        </button>
      </div>

      {/* 2. Plan Version Switcher */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <History className="w-4 h-4 text-indigo-400" /> Plan Version History:
          </span>
          {planHistory.map((p) => {
            const isSelected =
              (selectedPlanVersion === null && p.version === activeVersion) || selectedPlanVersion === p.version;
            return (
              <button
                key={p.id || p.version}
                onClick={() => setSelectedPlanVersion(p.version)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                    : 'glass-panel text-slate-300 hover:bg-slate-800 border border-white/10'
                }`}
              >
                Plan v{p.version} {p.version === activeVersion && '(Active)'}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing: <span className="font-bold text-white">Plan v{displayedPlan?.version || activeVersion}</span>
        </span>
      </div>

      {/* 3. Decision Rationale Explanation (Structured Format) */}
      <div className="glass-card p-5 border-l-4 border-l-indigo-500 space-y-3 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Adaptive Planner Decision Explanation (Plan v{displayedPlan?.version || activeVersion})
            </h3>
          </div>
          <span className="text-[10px] font-bold subtle-badge-indigo px-2 py-0.5 rounded">
            Closed-Loop Agent Decision
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Observation</span>
            <p className="font-semibold text-slate-200 leading-snug">{adaptationRationale.observation}</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <span className="font-bold text-indigo-400 uppercase text-[10px] block">Decision</span>
            <p className="font-semibold text-slate-200 leading-snug">{adaptationRationale.decision}</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 uppercase text-[10px] block">Action</span>
            <p className="font-semibold text-slate-200 leading-snug">{adaptationRationale.action}</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <span className="font-bold text-amber-400 uppercase text-[10px] block">Reason</span>
            <p className="font-semibold text-slate-200 leading-snug">{adaptationRationale.reason}</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <span className="font-bold text-blue-400 uppercase text-[10px] block">Expected Outcome</span>
            <p className="font-semibold text-slate-200 leading-snug">{adaptationRationale.outcome}</p>
          </div>
        </div>
      </div>

      {/* 4. Priority Shift Comparison Matrix */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Topic Priority Adaptation Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-white">Graphs (BFS/DFS)</span>
              <span className="subtle-badge-emerald px-1.5 py-0.5 rounded">High ➔ Medium</span>
            </div>
            <p className="text-[11px] text-slate-300">Reassessment score reached 68%. Shifted to maintenance practice.</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-white">Operating Systems</span>
              <span className="subtle-badge-rose px-1.5 py-0.5 rounded">Low ➔ High Priority</span>
            </div>
            <p className="text-[11px] text-slate-300">Assessment score 45% with deadlock flaws. Allocated +45 mins daily.</p>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-white">SQL Output Questions</span>
              <span className="subtle-badge-amber px-1.5 py-0.5 rounded">Medium ➔ High</span>
            </div>
            <p className="text-[11px] text-slate-300">Target company assessment pattern assigns 20% weight to SQL queries.</p>
          </div>
        </div>
      </div>

      {/* 5. 30-Day Placement Roadmap Breakdown */}
      <div className="glass-card p-6 space-y-6">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">30-Day Dynamic Placement Roadmap</h3>
            <p className="text-xs text-slate-400">Curriculum topics organized by preparation week and company relevance</p>
          </div>
          <span className="text-xs font-bold subtle-badge-indigo px-3 py-1 rounded-xl">
            Total 30 Days Schedule
          </span>
        </div>

        <div className="space-y-6">
          {roadmapWeeks.map((week, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center justify-between glass-panel px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs sm:text-sm">{week.week}</span>
                  <span className="text-xs text-slate-400 font-mono">({week.days})</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    week.status === 'Completed'
                      ? 'subtle-badge-emerald'
                      : week.status === 'Active (Current)'
                      ? 'subtle-badge-indigo'
                      : 'subtle-badge-slate'
                  }`}
                >
                  {week.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-2">
                {week.topics.map((t, tidx) => (
                  <div key={tidx} className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-1.5 hover:border-indigo-400/40 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{t.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="glass-panel px-2 py-0.5 rounded border border-white/5">{t.type}</span>
                      <span className="font-semibold text-indigo-300">{t.companyPattern}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
