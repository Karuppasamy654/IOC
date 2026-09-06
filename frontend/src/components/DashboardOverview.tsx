import React from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  BookOpen,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ReadinessData, Competency, StudentProfile, AdaptivePlan, WeaknessItem } from '../types';

interface DashboardOverviewProps {
  profile: StudentProfile | null;
  readiness: ReadinessData | null;
  competencies: Competency[];
  weaknesses: WeaknessItem[];
  currentPlan: AdaptivePlan | null;
  onNavigate: (tab: string) => void;
  onRunDemo: () => void;
  isDemoRunning: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  readiness,
  competencies,
  weaknesses,
  currentPlan,
  onNavigate,
  onRunDemo,
  isDemoRunning
}) => {
  const studentName = profile?.name || 'Student';
  const targetCompany = profile?.target_company || 'Amazon';
  const targetRole = profile?.target_role || 'Software Development Engineer (SDE)';
  const readinessVal = readiness?.overall_readiness;
  const isAssessed = readinessVal !== null && readinessVal !== undefined;
  const daysLeft = profile?.preparation_deadline_days || 30;
  const dailyHours = profile?.available_hours_per_day || 3.0;

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Status */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 border border-white/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
                🎯 Target: {targetCompany} ({targetRole})
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAssessed ? 'subtle-badge-emerald' : 'subtle-badge-amber'
              }`}>
                {isAssessed ? 'Active Adaptive Cycle' : 'Assessment Pending'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-white bg-clip-text text-transparent">{studentName}</span> 👋
            </h2>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              {isAssessed
                ? `Your placement readiness for ${targetCompany} is currently calculated at ${readinessVal}%.`
                : `Complete your baseline assessment to unlock your personalized placement readiness profile for ${targetCompany}.`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('assessment')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 active:scale-95 border border-indigo-400/30"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{isAssessed ? 'Retake Diagnostic Test' : 'Take Baseline Assessment'}</span>
            </button>
            <button
              onClick={() => onNavigate('codepractice')}
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-white/15 transition-all"
            >
              Code Practice Arena
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Questions Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Q1: Where am I? (Overall Readiness) */}
        <div className="glass-card p-5 border-l-4 border-l-indigo-500 flex flex-col justify-between saas-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Where am I?</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-3">
            {isAssessed ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{readinessVal}%</span>
                  <span className="text-xs text-slate-400 font-medium">Target: 85%</span>
                </div>
                <div className="w-full bg-slate-900/80 rounded-full h-2 mt-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, readinessVal)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="py-2">
                <span className="text-xs font-bold subtle-badge-amber px-2.5 py-1 rounded-lg">
                  Unassessed
                </span>
                <p className="text-xs text-slate-400 mt-2">Take baseline assessment to generate score.</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {isAssessed ? `Gap: -${Math.max(0, 85 - readinessVal)}% to target` : 'Requires 1 diagnostic session'}
          </p>
        </div>

        {/* Q2: What should I study? */}
        <div className="glass-card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between saas-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What should I study?</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-base font-bold text-white leading-snug">
              {weaknesses[0]?.topic || 'Graphs & Operating Systems'}
            </div>
            <p className="text-xs text-amber-300 font-medium mt-1">
              {weaknesses[0]?.primary_weakness || 'BFS Traversal & Visited Array State'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Start Practice Drill &rarr;</span>
          </button>
        </div>

        {/* Q3: Why? (Evidence-based explanation) */}
        <div className="glass-card p-5 border-l-4 border-l-blue-500 flex flex-col justify-between saas-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Why?</span>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="my-3">
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {weaknesses[0]
                ? `Measured implementation score on ${weaknesses[0].topic} is ${weaknesses[0].implementation_mastery}%, below ${targetCompany}'s 75% threshold.`
                : `${targetCompany} diagnostic test pattern weights Graphs (20%) and Operating Systems (15%) highest.`}
            </p>
          </div>
          <p className="text-[11px] text-blue-300 font-semibold">Empirical evidence diagnosis</p>
        </div>

        {/* Q4: What changed? (Adaptive Plan v1 vs v2) */}
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between saas-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What changed?</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-sm font-bold text-white">
              Plan Version v{currentPlan?.version || 1}
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {currentPlan?.adaptation_reason || 'Initial schedule generated based on baseline target.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('roadmap')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Plan Adaptations &rarr;</span>
          </button>
        </div>
      </div>

      {/* 3. Skill Overview & AI Intervention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Skill Competency Breakdown */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Calculated Skill Competencies</h3>
              <p className="text-xs text-slate-400">Real performance calculated from user answers & code submissions</p>
            </div>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Full Progress Memory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {competencies.length === 0 ? (
            <div className="p-8 text-center glass-panel border border-dashed border-white/20 rounded-2xl">
              <Award className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Assessment Completed Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Complete your baseline assessment to generate your calculated skill profile across Graphs, Operating Systems, DBMS, SQL, and CS core.
              </p>
              <button
                onClick={() => onNavigate('assessment')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25"
              >
                Start Baseline Diagnostic Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencies.slice(0, 6).map((comp) => {
                const score = comp.mastery_score;
                const isLow = score < 50;
                const isHigh = score >= 75;

                return (
                  <div key={comp.id} className="p-4 rounded-xl glass-panel border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{comp.topic}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          isLow
                            ? 'subtle-badge-rose'
                            : isHigh
                            ? 'subtle-badge-emerald'
                            : 'subtle-badge-amber'
                        }`}
                      >
                        {score}% ({comp.status})
                      </span>
                    </div>

                    <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-2 rounded-full ${
                          isLow ? 'bg-rose-500' : isHigh ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Concept: {comp.concept_mastery}%</span>
                      <span>Implementation: {comp.implementation_mastery}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Intervention Recommendation Card */}
        <div className="glass-card p-6 flex flex-col justify-between border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-indigo-950/40">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Intervention Recommendation</span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold subtle-badge-indigo px-2 py-0.5 rounded">
                  {targetCompany} Targeted
                </span>
                <span className="text-[10px] text-rose-400 font-bold">High Priority</span>
              </div>

              <h4 className="text-sm font-bold text-white">
                {weaknesses[0] ? `Intervention: ${weaknesses[0].topic} Drill` : 'Diagnostic Practice Drill'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {weaknesses[0]
                  ? `Weakness detected: ${weaknesses[0].primary_weakness} in ${weaknesses[0].topic}. Recommended intervention: ${weaknesses[0].recommended_action}.`
                  : 'Start by executing practice drills or taking a baseline assessment to let the 8 agents generate your custom intervention.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">What to do next?</span>
            <button
              onClick={() => onNavigate(weaknesses.length > 0 ? 'codepractice' : 'assessment')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1"
            >
              <span>{weaknesses.length > 0 ? 'Start Coding Sandbox' : 'Take Baseline Test'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
