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
  Cpu,
  Target,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight
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
  const studentName = profile?.name || 'Rahul Sharma';
  const targetCompany = profile?.target_company || 'Amazon';
  const targetRole = profile?.placement_target || 'Software Development Engineer (SDE)';
  const readinessVal = readiness?.overall_readiness || 64;
  const daysLeft = profile?.preparation_deadline_days || 18;
  const dailyHours = profile?.available_hours_per_day || 3;

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Status */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                🎯 Target: {targetCompany} ({targetRole})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Active Adaptive Cycle
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Good Afternoon, {studentName} 👋
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Your placement preparation for <span className="font-bold text-indigo-700">{targetCompany}</span> is <span className="font-bold text-emerald-700">{readinessVal}%</span> complete.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('practice')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Today's Company MCQs</span>
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all"
            >
              Take Mock Test
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Main Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Placement Readiness */}
        <div className="saas-card p-5 border-l-4 border-l-indigo-600 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Readiness</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{readinessVal}%</span>
              <span className="text-xs text-slate-500 font-medium">Target: 85%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, readinessVal)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Gap: <span className="font-bold text-amber-600">-{Math.max(0, 85 - readinessVal)}%</span> to reach company benchmark
          </p>
        </div>

        {/* Card 2: Days Remaining */}
        <div className="saas-card p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Remaining</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{daysLeft} Days</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Available Commitment: <span className="font-bold text-slate-700">{dailyHours} hrs/day</span>
            </p>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <span>Adaptive Schedule Active</span>
          </p>
        </div>

        {/* Card 3: Today's Progress */}
        <div className="saas-card p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Progress</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">3 / 4</span>
              <span className="text-xs text-slate-500 font-medium">Sessions Done</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-3/4" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">1 Session Remaining Today</p>
        </div>

        {/* Card 4: Current Priority */}
        <div className="saas-card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Priority</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-3">
            <div className="text-base font-bold text-slate-900 leading-snug">
              {weaknesses[0]?.topic || 'Operating Systems'}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              {weaknesses[0]?.primary_weakness || 'Process Synchronization & BFS Invariants'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Review Priority Topic &rarr;</span>
          </button>
        </div>
      </div>

      {/* 3. Skill Overview & Top AI Suggestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Skill Competency Matrix */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Placement Skill Overview</h3>
              <p className="text-xs text-slate-500">Subject performance mapped against {targetCompany} assessment requirements</p>
            </div>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Detailed Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competencies.slice(0, 6).map((comp) => {
              const score = comp.mastery_score;
              const isLow = score < 50;
              const isHigh = score >= 75;

              return (
                <div key={comp.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{comp.topic}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isLow
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isHigh
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {score}% ({comp.status})
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        isLow ? 'bg-rose-500' : isHigh ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Concept: {comp.concept_mastery}%</span>
                    <span>Implementation: {comp.implementation_mastery}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top AI Suggestion Highlight */}
        <div className="saas-card p-6 flex flex-col justify-between bg-gradient-to-br from-indigo-50/50 via-white to-white border-indigo-200">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Top AI Recommendation</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {targetCompany} Pattern Context
                </span>
                <span className="text-[10px] text-rose-600 font-bold">High Yield Target</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {weaknesses[0] ? `Focus on ${weaknesses[0].topic} ${weaknesses[0].primary_weakness}` : 'Master DBMS Normalization & SQL Output MCQs'}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {weaknesses[0]
                  ? `Your overall ${weaknesses[0].topic} implementation score remains at ${weaknesses[0].implementation_mastery}%. ${targetCompany} technical OA frequently features output tracing on this exact pattern.`
                  : `${targetCompany} technical assessments heavily weight SQL query outputs and DBMS concepts. Completing 10 medium MCQs will boost your readiness score by +6%.`}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Memory-Guided Action</span>
            <button
              onClick={() => onNavigate('practice')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1"
            >
              <span>Practice MCQs Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Today's Plan & Upcoming Schedule */}
      <div className="saas-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Placement Schedule (Plan v{currentPlan?.version || 1})</h3>
            <p className="text-xs text-slate-500">
              {currentPlan?.adaptation_reason || `Tailored for ${targetCompany} placement pattern & diagnosed weak topics`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Full Calendar View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentPlan?.schedule_blocks?.slice(0, 4).map((block, i) => {
            const isCompleted = i < 3;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-600 opacity-90'
                    : 'bg-white border-indigo-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-indigo-700">{block.time}</span>
                  {isCompleted ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Next Priority
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900">{block.topic}</div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{block.activity}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
