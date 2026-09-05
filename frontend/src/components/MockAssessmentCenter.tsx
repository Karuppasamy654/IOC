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

  const handleGenerateTest = async () => {
    setIsLoading(true);
    setEvalResult(null);
    setSelectedAnswers({});
    try {
      const data = await generateMockAssessment(45);
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
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 1,
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

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Mock Assessment Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Closed-Loop Evaluation Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Simulated Company Placement OA</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Test your knowledge under timed assessment conditions. Assessment scores directly inform the Weakness Diagnosis & Adaptive Planning agents.
          </p>
        </div>

        <button
          onClick={handleGenerateTest}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isLoading ? 'Generating Test...' : 'Start New Simulated OA'}</span>
        </button>
      </div>

      {/* 2. Pre-Assessment Parameters Card (Before Starting) */}
      {!assessmentData && !evalResult && (
        <div className="saas-card p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-900">Pre-Assessment Setup Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Company Style</span>
              <span className="font-bold text-indigo-700 text-sm">Amazon SDE</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Assessment Type</span>
              <span className="font-bold text-slate-800 text-sm">Technical OA</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Difficulty Level</span>
              <span className="font-bold text-amber-700 text-sm">Medium (Company Std)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Duration</span>
              <span className="font-bold text-slate-800 text-sm">45 Minutes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Question Count</span>
              <span className="font-bold text-slate-800 text-sm">30 Items</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerateTest}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
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
          <div className="saas-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <span>Questions ({assessmentData.questions.length})</span>
              <span className="flex items-center gap-1 text-indigo-700 font-mono font-bold">
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
                    className={`p-2 rounded-lg text-xs font-bold text-center transition-all ${
                      isCurr
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className="w-full mt-4 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
            >
              {isSubmitting ? 'Evaluating Submission...' : 'Submit Final Assessment'}
            </button>
          </div>

          {/* Current Question View */}
          <div className="lg:col-span-3 saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentQ?.topic} &bull; {currentQ?.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono">Question {currentQIndex + 1} of {assessmentData.questions.length}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">{currentQ?.title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{currentQ?.description}</p>

            {/* Options */}
            {currentQ?.options && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Option:</span>
                {currentQ.options.map((opt: string, optIdx: number) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Assessment Evaluation Analytics Report */}
      {evalResult && (
        <div className="saas-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Closed-Loop Diagnostic Report</span>
              <h3 className="text-2xl font-black text-slate-900">Assessment Score Breakdown</h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-700">
                {evalResult.overall_score_percentage}%
              </span>
              <p className="text-xs text-slate-500 font-medium">Readiness Delta: +{evalResult.readiness_delta}%</p>
            </div>
          </div>

          {/* Topic Performance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {Object.entries(evalResult.topic_breakdown || {}).map(([topic, score]: any) => (
              <div key={topic} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">{topic}</span>
                <span className="text-lg font-black text-slate-900">{score}%</span>
              </div>
            ))}
          </div>

          {/* Weakness & Recurring Mistakes Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Weak Areas Identified</span>
              </div>
              <p className="text-slate-700">
                Operating Systems Process Synchronization (45%) & Graph BFS visited tracking (52%).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Recurring Mistake Logged</span>
              </div>
              <p className="text-slate-700">
                BFS visited array marked on pop instead of push (visited_array_omission).
              </p>
            </div>
          </div>

          {/* Recommended Next Step & Replan Button */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-900 block">Recommended Next Step:</span>
              <p className="text-indigo-800">Deploy Plan v2 focusing 45 mins daily on Operating Systems & Graph BFS invariants.</p>
            </div>

            <button
              onClick={() => onTriggerReplan && onTriggerReplan()}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
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
