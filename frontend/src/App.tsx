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
  triggerAgentCycle
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
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<AdaptivePlan | null>(null);
  const [planHistory, setPlanHistory] = useState<AdaptivePlan[]>([]);
  const [strategies, setStrategies] = useState<StrategyRecord[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isRefreshingTraces, setIsRefreshingTraces] = useState<boolean>(false);

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
      setCompetencies(compData);
      setWeaknesses(weakData);
      setCurrentPlan(planData);
      setPlanHistory(histData);
      setStrategies(stratData);
      setQuestions(qData);
      setTraces(traceData);
    } catch (err) {
      console.error('Error loading placement app data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveProfile = async (updated: Partial<StudentProfile>) => {
    try {
      const res = await updateProfile(updated, 1);
      setProfile(res);
      await loadAllData();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleRunDemoScenario = async () => {
    setIsDemoRunning(true);
    try {
      await triggerAgentCycle({
        user_id: 1,
        branch: profile?.branch || 'Computer Science & Engineering',
        graduation_year: profile?.graduation_year || 2026,
        cgpa: profile?.cgpa || 8.4,
        target_role: profile?.placement_target || 'Software Development Engineer (SDE)',
        target_company: profile?.target_company || 'Amazon',
        available_hours_per_day: profile?.available_hours_per_day || 3.0,
        preparation_deadline_days: profile?.preparation_deadline_days || 30,
        skills: profile?.skills || ['Python', 'C++', 'DSA', 'DBMS', 'OS']
      });

      await loadAllData();
      setActiveTab('roadmap');
    } catch (err) {
      console.error('Error executing demo scenario:', err);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRunDemoScenario={handleRunDemoScenario}
          isDemoRunning={isDemoRunning}
          readinessScore={readiness?.overall_readiness || 64}
          targetCompany={profile?.target_company || 'Amazon'}
          studentName={profile?.name || 'Rahul Sharma'}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              profile={profile}
              readiness={readiness}
              competencies={competencies}
              weaknesses={weaknesses}
              currentPlan={currentPlan}
              onNavigate={setActiveTab}
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
              onNavigate={setActiveTab}
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
            <StudentProfileView
              profile={profile || {
                user_id: 1,
                name: 'Rahul Sharma',
                college: 'NIT',
                degree: 'B.Tech',
                branch: 'CSE',
                graduation_year: 2026,
                cgpa: 8.4,
                current_year: '4th Year',
                current_semester: 'Sem 7',
                skills: ['C++', 'Python'],
                programming_languages: ['C++', 'Python'],
                subjects_studied: ['DSA', 'DBMS', 'OS'],
                strengths: ['SQL'],
                weaknesses: ['Graphs'],
                placement_target: 'SDE-1',
                target_company: 'Amazon',
                preparation_deadline_days: 30,
                available_hours_per_day: 3,
                preferred_learning_style: 'Visual + MCQ',
                resume_summary: 'CSE Student',
                curriculum_summary: 'Standard GATE/Placement CS Syllabus',
                readiness_score: 64
              }}
              onSaveProfile={handleSaveProfile}
              onTriggerAgentCycle={handleRunDemoScenario}
            />
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

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>PlacementEvolve AI &bull; Self-Adaptive Agentic Placement Preparation System</span>
        <span className="font-mono text-[11px]">8 Autonomous Agents &bull; 3 Real Tools &bull; Multi-Tier Vector Memory</span>
      </footer>
    </div>
  );
};

export default App;
