import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Sparkles, CheckCircle, Code2, AlertTriangle } from 'lucide-react';
import { WeaknessItem } from '../types';
import { searchResources } from '../services/api';

interface WeaknessInterventionHubProps {
  weaknesses: WeaknessItem[];
}

export const WeaknessInterventionHub: React.FC<WeaknessInterventionHubProps> = ({ weaknesses }) => {
  const [searchTopic, setSearchTopic] = useState<string>('Graphs');
  const [resources, setResources] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async (topic: string) => {
    setIsSearching(true);
    setSearchTopic(topic);
    try {
      const data = await searchResources(topic, 'implementation_weakness');
      setResources(data);
    } catch (err) {
      console.error('Error searching resources:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Weakness Diagnosis & Intervention Hub</h2>
              <p className="text-xs text-slate-400">
                Agent 6 (Weakness Diagnosis) & Agent 7 (Resource/Intervention) active scaffolding center.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosed Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weaknesses.map((w, idx) => {
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl border-rose-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{w.topic}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {w.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-400">Concept Mastery:</span>
                    <span className="font-bold text-emerald-400">{w.concept_mastery}% (Good)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-400">Implementation:</span>
                    <span className="font-bold text-rose-400">{w.implementation_mastery}% (Weak)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-400">Time Score:</span>
                    <span className="font-bold text-amber-400">{w.time_management}%</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <span className="text-indigo-400 font-bold block">Autonomous Diagnosis:</span>
                  <span className="text-slate-200">{w.primary_weakness}</span>
                </div>
              </div>

              <button
                onClick={() => handleSearch(w.topic)}
                className="w-full mt-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search Tool Remediation for {w.topic}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Resource Search Tool Results */}
      {resources.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Tool 2 (Learning Resource Search) Recommendations for {searchTopic}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Curated High-Yield Index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((res: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px]">
                      {res.resource_type}
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px]">
                      {res.relevance_score}% Match
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">{res.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{res.summary}</p>

                  {/* Key Takeaways */}
                  {res.key_takeaways && (
                    <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                      {res.key_takeaways.map((tk: string, tkIdx: number) => (
                        <div key={tkIdx} className="flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tk}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Code Snippet */}
                  {res.interactive_code_snippet && (
                    <div className="mt-3 p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      <pre>{res.interactive_code_snippet}</pre>
                    </div>
                  )}
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full py-1.5 text-xs text-center rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Open Interactive Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
