import React, { useState, useEffect } from 'react';
import { BarChart2, RefreshCw, TrendingUp, Award, Zap } from 'lucide-react';
import { BenchmarkResult } from '../types';
import { runBenchmarkExperiment } from '../services/api';

export const ResearchBenchmarkView: React.FC = () => {
  const [sampleSize, setSampleSize] = useState<number>(50);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchBenchmark = async (size: number) => {
    setIsLoading(true);
    try {
      const data = await runBenchmarkExperiment(size, 30);
      setBenchmarkData(data);
    } catch (err) {
      console.error('Error fetching benchmark:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark(50);
  }, []);

  const summary = benchmarkData?.summary;
  const staticData = summary?.static_planner;
  const adaptiveData = summary?.adaptive_planner;
  const adv = summary?.delta_advantage;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Research & Empirical Benchmark
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Mode A vs Mode B Experiment
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Empirical Research Sandbox & Evaluation</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Compare static preparation (Mode A) against PlacementEvolve self-adaptive multi-agent preparation (Mode B).
          </p>
        </div>

        {/* Experiment Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span>Cohort Size:</span>
            <select
              value={sampleSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSampleSize(val);
                fetchBenchmark(val);
              }}
              className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
            >
              <option value="20">N = 20 Students</option>
              <option value="50">N = 50 Students</option>
              <option value="100">N = 100 Students</option>
            </select>
          </div>

          <button
            onClick={() => fetchBenchmark(sampleSize)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Running Cohort...' : 'Re-run Experiment'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode A */}
          <div className="saas-card p-6 space-y-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-700">Mode A: Static Planner</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                Fixed Syllabus
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Initial Score:</span>
                <span className="font-bold text-slate-800">{staticData?.initial_score}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Final Score:</span>
                <span className="font-bold text-slate-800">{staticData?.final_score}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Total Score Gain:</span>
                <span className="font-bold text-amber-700">{staticData?.improvement}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Avg Recurring Errors:</span>
                <span className="font-bold text-rose-700">{staticData?.repeated_errors} errors</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Weakness Clearance:</span>
                <span className="font-bold text-slate-700">{staticData?.weakness_clearance_rate}</span>
              </div>
            </div>
          </div>

          {/* Mode B */}
          <div className="saas-card p-6 space-y-4 bg-white border border-indigo-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Mode B: PlacementEvolve AI</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Multi-Agent + Memory
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Initial Score:</span>
                <span className="font-bold text-slate-800">{adaptiveData?.initial_score}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Final Score:</span>
                <span className="font-black text-emerald-700 text-sm">{adaptiveData?.final_score}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Total Score Gain:</span>
                <span className="font-black text-emerald-700 text-sm">{adaptiveData?.improvement}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Avg Recurring Errors:</span>
                <span className="font-bold text-emerald-700">{adaptiveData?.repeated_errors} errors</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Weakness Clearance:</span>
                <span className="font-bold text-emerald-700">{adaptiveData?.weakness_clearance_rate}</span>
              </div>
            </div>
          </div>

          {/* Delta Advantage */}
          <div className="saas-card p-6 space-y-4 bg-gradient-to-br from-emerald-50/50 via-white to-white border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Statistical Advantage Delta</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Empirically measured performance advantages over static study planners.
              </p>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                  <span className="text-slate-500 font-bold block">Extra Score Boost:</span>
                  <span className="text-xl font-black text-emerald-700">{adv?.extra_score_gain}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                  <span className="text-slate-500 font-bold block">Error Mitigation:</span>
                  <span className="text-xl font-black text-emerald-700">-{adv?.error_reduction_pct} Errors</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                  <span className="text-slate-500 font-bold block">Statistical P-Value:</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">{adv?.p_value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
