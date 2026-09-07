import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { AdaptivePlanView } from './components/AdaptivePlanView';
import { CalendarView } from './components/CalendarView';
import { PracticeQuestionView } from './components/PracticeQuestionView';
import { MockAssessmentCenter } from './components/MockAssessmentCenter';
import { ProgressMemoryView } from './components/ProgressMemoryView';
import { SuggestionsView } from './components/SuggestionsView';
import { CodePracticeArena } from './components/CodePracticeArena';
import { StudentProfileView } from './components/StudentProfileView';
import { AgentExecutionTraceView } from './components/AgentExecutionTraceView';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';

import {
  fetchProfile,
  updateProfile,
  fetchCompetencies,
  fetchReadiness,
  fetchWeaknesses,
  fetchCurrentPlan,
  fetchPlanHistory,
  fetchStrategyEffectiveness,
  fetchQuestions,
  fetchAgentTraces,
  triggerAgentCycle,
  getCurrentUser,
  removeToken,
  getToken
} from './services/api';

import {
  StudentProfile,
  Competency,
  ReadinessData,
  WeaknessItem,
  AdaptivePlan,
  StrategyRecord,
  Question,
  AgentTrace
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<AdaptivePlan | null>(null);
  const [planHistory, setPlanHistory] = useState<AdaptivePlan[]>([]);
  const [strategies, setStrategies] = useState<StrategyRecord[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isRefreshingTraces, setIsRefreshingTraces] = useState<boolean>(false);
  const [assessmentConfig, setAssessmentConfig] = useState<any>(null);

  const handleNavigate = (tab: string, config?: any) => {
    if (tab === 'assessment' && config) {
      setAssessmentConfig(config);
    }
    setActiveTab(tab);
  };

  const checkAuthAndLoad = async () => {
    try {
      const token = getToken();
      if (token) {
        const u = await getCurrentUser();
        if (u) {
          setUser(u);
        }
      }
      await loadAllData();
    } catch (err) {
      console.error('Error during initial auth check:', err);
    }
  };

  const loadAllData = async () => {
    try {
      const [profData, readData, compData, weakData, planData, histData, stratData, qData, traceData] = await Promise.all([
        fetchProfile(),
        fetchReadiness(),
        fetchCompetencies(),
        fetchWeaknesses(),
        fetchCurrentPlan(),
        fetchPlanHistory(),
        fetchStrategyEffectiveness(),
        fetchQuestions(),
        fetchAgentTraces()
      ]);

      setProfile(profData);
      setReadiness(readData);
      setCompetencies(Array.isArray(compData) ? compData : []);
      setWeaknesses(Array.isArray(weakData) ? weakData : []);
      setCurrentPlan(planData);
      setPlanHistory(Array.isArray(histData) ? histData : []);
      setStrategies(Array.isArray(stratData) ? stratData : []);
      setQuestions(Array.isArray(qData) ? qData : []);
      setTraces(Array.isArray(traceData) ? traceData : []);
    } catch (err) {
      console.error('Error loading placement app data:', err);
    }
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData);
    await loadAllData();
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setProfile(null);
    setReadiness(null);
    setCompetencies([]);
    setWeaknesses([]);
    setCurrentPlan(null);
    setPlanHistory([]);
  };

  const handleSaveProfile = async (updated: Partial<StudentProfile>) => {
    try {
      const res = await updateProfile(updated);
      setProfile(res);
      await loadAllData();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleRunDemoScenario = async () => {
    setIsDemoRunning(true);
    try {
      // Token is sent automatically via authFetch; user_id is resolved server-side from JWT.
      // We still pass profile data so the graph gets correct context.
      await triggerAgentCycle({
        user_id: user?.id || user?.user_id || undefined,
        branch: profile?.branch || 'Computer Science & Engineering',
        graduation_year: profile?.graduation_year || 2026,
        cgpa: profile?.cgpa || 8.2,
        target_role: profile?.target_role || 'Software Development Engineer (SDE)',
        target_company: profile?.target_company || 'Amazon',
        available_hours_per_day: profile?.available_hours_per_day || 3.0,
        preparation_deadline_days: profile?.preparation_deadline_days || 30,
        skills: profile?.skills || ['Python', 'DSA', 'DBMS', 'OS']
      });

      await loadAllData();
      setActiveTab('roadmap');
    } catch (err) {
      console.error('Error executing agent cycle:', err);
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleRefreshTraces = async () => {
    setIsRefreshingTraces(true);
    try {
      const traceData = await fetchAgentTraces();
      setTraces(traceData);
    } catch (err) {
      console.error('Error refreshing traces:', err);
    } finally {
      setIsRefreshingTraces(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRunDemoScenario={handleRunDemoScenario}
          isDemoRunning={isDemoRunning}
          readinessScore={readiness?.overall_readiness ?? null}
          targetCompany={profile?.target_company || 'Amazon'}
          studentName={user?.name || profile?.name || 'Student'}
          isAuthenticated={!!user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Onboarding Wizard Toggle Banner if unprofiled */}
          {user && (!profile || !profile.target_company) && !showWizard && (
            <div className="mb-6 p-4 glass-card border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 bg-indigo-950/40 backdrop-blur-md">
              <div>
                <h4 className="text-sm font-bold text-indigo-200">Complete Your Placement Onboarding</h4>
                <p className="text-xs text-indigo-300/80 mt-0.5">Setup your target company, technical familiarity ratings, and daily commitment hours.</p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Launch Onboarding Wizard
              </button>
            </div>
          )}

          {showWizard && (
            <div className="mb-8">
              <OnboardingWizard
                initialProfile={profile}
                onComplete={() => {
                  setShowWizard(false);
                  loadAllData();
                }}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardOverview
              profile={profile}
              readiness={readiness}
              competencies={competencies}
              weaknesses={weaknesses}
              currentPlan={currentPlan}
              onNavigate={handleNavigate}
              onRunDemo={handleRunDemoScenario}
              isDemoRunning={isDemoRunning}
            />
          )}

          {activeTab === 'roadmap' && (
            <AdaptivePlanView
              currentPlan={currentPlan}
              planHistory={planHistory}
              onTriggerReplan={handleRunDemoScenario}
              isReplanning={isDemoRunning}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              currentPlan={currentPlan}
              profile={profile}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeQuestionView
              onTriggerAgentCycle={handleRunDemoScenario}
            />
          )}

          {activeTab === 'assessment' && (
            <MockAssessmentCenter
              onTriggerReplan={handleRunDemoScenario}
              initialConfig={assessmentConfig}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressMemoryView
              competencies={competencies}
              weaknesses={weaknesses}
              strategies={strategies}
            />
          )}

          {activeTab === 'suggestions' && (
            <SuggestionsView
              profile={profile}
              weaknesses={weaknesses}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'codepractice' && (
            <CodePracticeArena
              questions={questions}
              onExecutionComplete={() => loadAllData()}
            />
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWizard(!showWizard)}
                  className="px-4 py-2 glass-panel hover:bg-slate-800/80 text-slate-200 text-xs font-semibold rounded-xl border border-white/10"
                >
                  {showWizard ? 'Hide Onboarding Wizard' : 'Open Onboarding Wizard'}
                </button>
              </div>
              <StudentProfileView
                profile={profile || {
                  user_id: user?.id || 1,
                  name: user?.name || 'Student',
                  email: user?.email || '',
                  branch: 'Computer Science',
                  graduation_year: 2026,
                  cgpa: 8.0,
                  skills: ['Python', 'DSA'],
                  preferred_subjects: ['DSA', 'Operating Systems', 'DBMS'],
                  target_role: 'Software Development Engineer (SDE)',
                  target_company: 'Amazon',
                  preparation_deadline_days: 30,
                  available_hours_per_day: 3.0,
                  learning_style: 'Mixed',
                  readiness_score: readiness?.overall_readiness || null
                }}
                onSaveProfile={handleSaveProfile}
                onTriggerAgentCycle={handleRunDemoScenario}
              />
            </div>
          )}

          {activeTab === 'traces' && (
            <AgentExecutionTraceView
              traces={traces}
              onRefresh={handleRefreshTraces}
              isRefreshing={isRefreshingTraces}
            />
          )}

          {activeTab === 'benchmark' && <ResearchBenchmarkView />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>PlacementEvolve AI &bull; Self-Adaptive Agentic Placement Preparation Platform</span>
        <span className="font-mono text-[11px] text-slate-400">8 Autonomous Agents &bull; LangGraph Workflow &bull; 4-Tier Memory &bull; Subprocess Sandbox</span>
      </footer>
    </div>
  );
};

export default App;
