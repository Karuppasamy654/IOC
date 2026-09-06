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
  User as UserIcon, 
  Sparkles, 
  RefreshCw,
  Layers,
  LogOut,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemoScenario: () => void;
  isDemoRunning: boolean;
  readinessScore: number | null;
  targetCompany: string;
  studentName: string;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunDemoScenario,
  isDemoRunning,
  readinessScore,
  targetCompany,
  studentName,
  isAuthenticated,
  onOpenAuth,
  onLogout
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'practice', label: 'Practice', icon: CheckSquare },
    { id: 'assessment', label: 'Mock Assessment', icon: Award },
    { id: 'progress', label: 'Progress & Memory', icon: BarChart3 },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'codepractice', label: 'Code Practice', icon: Code2 },
    { id: 'profile', label: 'Profile & Setup', icon: UserIcon },
    { id: 'traces', label: 'Agent Activity', icon: Sparkles, evaluator: true }
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav px-4 sm:px-6 py-3 border-b border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold border border-white/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  PlacementEvolve<span className="text-indigo-400">.AI</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full subtle-badge-indigo">
                  Adaptive AI Coach
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Self-Adaptive Multi-Agent Preparation Platform</p>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs">
            <span className="text-slate-400 font-medium">Target:</span>
            <span className="font-bold subtle-badge-indigo px-2 py-0.5 rounded-lg">
              {targetCompany || 'Amazon'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl subtle-badge-emerald text-xs">
            <span className="text-emerald-300 font-medium">Readiness:</span>
            <span className="font-extrabold text-emerald-200 text-sm">
              {readinessScore !== null && readinessScore !== undefined ? `${readinessScore}%` : 'Unassessed'}
            </span>
          </div>

          <button
            onClick={onRunDemoScenario}
            disabled={isDemoRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 border border-indigo-400/30"
            title="Execute Autonomous 8-Agent Adaptive Loop"
          >
            {isDemoRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isDemoRunning ? 'Executing Agent Loop...' : 'Trigger Adaptive Agent Loop'}</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <span className="text-xs font-bold text-slate-200">{studentName || 'Student'}</span>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition border border-transparent hover:border-rose-500/30"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 glass-panel hover:bg-slate-800 text-white text-xs font-semibold rounded-xl border border-white/15 shadow-md transition"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 pt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none border-t border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/50 shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
              } ${tab.evaluator ? 'ml-auto border border-purple-500/40 text-purple-300 bg-purple-950/40 hover:bg-purple-900/50' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
