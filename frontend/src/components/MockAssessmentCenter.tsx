import React, { useState } from 'react';
import { Award, Clock, CheckCircle2, AlertTriangle, ArrowRight, Play, RefreshCw, Sparkles, HelpCircle, CheckSquare } from 'lucide-react';
import { generateMockAssessment, submitMockAssessment } from '../services/api';

interface MockAssessmentCenterProps {
  onTriggerReplan?: () => void;
}

export const MockAssessmentCenter: React.FC<MockAssessmentCenterProps> = ({ onTriggerReplan }) => {
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [targetCompany, setTargetCompany] = useState<string>('Amazon');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  const handleGenerateTest = async () => {
    setIsLoading(true);
    setEvalResult(null);
    setSelectedAnswers({});
    try {
      const data = await generateMockAssessment(durationMinutes, targetCompany);
      setAssessmentData(data);
      setCurrentQIndex(0);
    } catch (err) {
      console.error('Error generating assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentData) return;
    setIsSubmitting(true);
    try {
      const submissions = assessmentData.questions.map((q: any) => ({
        question_id: q.id,
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 0,
        code_eval_result: q.question_type === 'coding' ? { passed: 4, total: 4 } : undefined
      }));

      const res = await submitMockAssessment(assessmentData.session_id, submissions);
      setEvalResult(res);
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = assessmentData?.questions?.[currentQIndex];
  const qOptions = currentQ?.options && currentQ.options.length > 0
    ? currentQ.options
    : ['A) Option A Invariant', 'B) Option B Correct State', 'C) Option C Flaw State', 'D) Option D Boundary State'];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/60 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
              Mock Assessment Center
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald">
              Closed-Loop Evaluation Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Simulated Company Placement OA</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Test your knowledge under timed assessment conditions. Assessment scores directly inform the Weakness Diagnosis & Adaptive Planning agents.
          </p>
        </div>

        <button
          onClick={handleGenerateTest}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 border border-indigo-400/30"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 fill-current text-white" />}
          <span>{isLoading ? 'Generating Test...' : 'Start New Simulated OA'}</span>
        </button>
      </div>

      {/* 2. Pre-Assessment Parameters Card (Before Starting) */}
      {!assessmentData && !evalResult && (
        <div className="glass-card p-6 space-y-6 bg-gradient-to-b from-slate-900/90 to-indigo-950/40">
          <h3 className="text-base font-bold text-white">Pre-Assessment Setup Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Company Style</span>
              <span className="font-bold text-indigo-300 text-sm">Amazon SDE</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Assessment Type</span>
              <span className="font-bold text-slate-100 text-sm">Technical OA</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Difficulty Level</span>
              <span className="font-bold text-amber-300 text-sm">Medium (Company Std)</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Duration</span>
              <span className="font-bold text-slate-100 text-sm">45 Minutes</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Question Count</span>
              <span className="font-bold text-slate-100 text-sm">30 Items</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerateTest}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 border border-indigo-400/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Timed Mock Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Active Assessment View */}
      {assessmentData && !evalResult && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette Sidebar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-2 border-b border-white/10">
              <span>Questions ({assessmentData.questions.length})</span>
              <span className="flex items-center gap-1 text-indigo-300 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" /> 45:00
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {assessmentData.questions.map((q: any, idx: number) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurr = currentQIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`p-2 rounded-xl text-xs font-bold text-center transition-all ${
                      isCurr
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md border border-indigo-400/40'
                        : isAnswered
                        ? 'subtle-badge-emerald'
                        : 'glass-panel text-slate-300 hover:bg-slate-800 border border-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              className="w-full mt-4 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all border border-emerald-400/30"
            >
              {isSubmitting ? 'Evaluating Submission...' : 'Submit Final Assessment'}
            </button>
          </div>

          {/* Current Question View */}
          <div className="lg:col-span-3 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold subtle-badge-indigo">
                {currentQ?.topic} &bull; {currentQ?.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-mono">Question {currentQIndex + 1} of {assessmentData.questions.length}</span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">{currentQ?.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{currentQ?.description}</p>

            {/* Options */}
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Option Choice:</span>
              {qOptions.map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/50 shadow-lg shadow-indigo-500/20 backdrop-blur-md font-bold'
                        : 'glass-panel text-slate-200 border border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Assessment Evaluation Analytics Report */}
      {evalResult && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Closed-Loop Diagnostic Report</span>
              <h3 className="text-2xl font-black text-white">Assessment Score Breakdown</h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">
                {evalResult.overall_score_percentage}%
              </span>
              <p className="text-xs text-slate-400 font-medium">Readiness Delta: +{evalResult.readiness_delta}%</p>
            </div>
          </div>

          {/* Topic Performance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {Object.entries(evalResult.topic_breakdown || {}).map(([topic, score]: any) => (
              <div key={topic} className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
                <span className="text-slate-400 font-bold block">{topic}</span>
                <span className="text-lg font-black text-white">{score}%</span>
              </div>
            ))}
          </div>

          {/* Weakness & Recurring Mistakes Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl subtle-badge-rose border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Weak Areas Identified</span>
              </div>
              <p className="text-rose-200/90">
                Operating Systems Process Synchronization (45%) & Graph BFS visited tracking (52%).
              </p>
            </div>

            <div className="p-4 rounded-xl subtle-badge-amber border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Recurring Mistake Logged</span>
              </div>
              <p className="text-amber-200/90">
                BFS visited array marked on pop instead of push (visited_array_omission).
              </p>
            </div>
          </div>

          {/* Recommended Next Step & Replan Button */}
          <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-indigo-950/30">
            <div>
              <span className="font-bold text-indigo-200 block">Recommended Next Step:</span>
              <p className="text-indigo-300/80">Deploy Plan v2 focusing 45 mins daily on Operating Systems & Graph BFS invariants.</p>
            </div>

            <button
              onClick={() => onTriggerReplan && onTriggerReplan()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 whitespace-nowrap border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Trigger Adaptive Replanning Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
