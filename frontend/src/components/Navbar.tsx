import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  BarChart3, 
  Lightbulb, 
  Code2, 
  User, 
  Sparkles, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemoScenario: () => void;
  isDemoRunning: boolean;
  readinessScore: number;
  targetCompany: string;
  studentName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunDemoScenario,
  isDemoRunning,
  readinessScore,
  targetCompany,
  studentName
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'practice', label: 'Practice', icon: CheckSquare, badge: 'MCQ + Output' },
    { id: 'assessment', label: 'Mock Assessment', icon: Award },
    { id: 'progress', label: 'Progress & Memory', icon: BarChart3 },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'codepractice', label: 'Code Practice', icon: Code2 },
    { id: 'profile', label: 'Profile & Setup', icon: User },
    { id: 'traces', label: 'Agent Activity', icon: Cpu, evaluator: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Target Company Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-sm text-white font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  PlacementEvolve<span className="text-indigo-600">.AI</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Self-Adaptive Agentic AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Personalized Placement Preparation System</p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-700">
              🎯 {targetCompany || 'Amazon SDE'}
            </span>
          </div>
        </div>

        {/* Target Company Badge & Controls */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Target:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
              {targetCompany || 'Amazon (SDE)'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-medium">Readiness:</span>
            <span className="font-extrabold text-emerald-800 text-sm">{readinessScore}%</span>
          </div>

          <button
            onClick={onRunDemoScenario}
            disabled={isDemoRunning}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Demonstrate 1-Click Multi-Agent Execution & Adaptive Replanning"
          >
            {isDemoRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isDemoRunning ? 'Executing Agent Loop...' : '1-Click Adaptive Demo'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 pt-1 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none border-t border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${tab.evaluator ? 'ml-auto border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
