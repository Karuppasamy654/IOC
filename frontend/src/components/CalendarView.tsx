import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Award, RefreshCw } from 'lucide-react';
import { AdaptivePlan, CalendarSession } from '../types';

interface CalendarViewProps {
  currentPlan: AdaptivePlan | null;
  onNavigate: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentPlan, onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-07');

  const daysList = [
    { date: '2026-09-05', dayName: 'Sat', dayNum: '5', label: 'Day 1' },
    { date: '2026-09-06', dayName: 'Sun', dayNum: '6', label: 'Day 2' },
    { date: '2026-09-07', dayName: 'Mon', dayNum: '7', label: 'Today (Day 3)' },
    { date: '2026-09-08', dayName: 'Tue', dayNum: '8', label: 'Day 4' },
    { date: '2026-09-09', dayName: 'Wed', dayNum: '9', label: 'Day 5' },
    { date: '2026-09-10', dayName: 'Thu', dayNum: '10', label: 'Day 6' },
    { date: '2026-09-11', dayName: 'Fri', dayNum: '11', label: 'Day 7' }
  ];

  const calendarSessions: Record<string, CalendarSession[]> = {
    '2026-09-07': [
      {
        id: 's1',
        date: '2026-09-07',
        time_slot: '09:00 – 09:45',
        topic: 'DSA — Binary Trees & Graph BFS',
        subtopic: 'BFS Traversal & Visited States',
        session_type: 'MCQ Practice',
        difficulty: 'Medium',
        duration_minutes: 45,
        company_pattern: 'Amazon High Frequency',
        status: 'Completed'
      },
      {
        id: 's2',
        date: '2026-09-07',
        time_slot: '10:00 – 10:30',
        topic: 'DBMS — Normalization & ER Models',
        subtopic: '3NF & BCNF Functional Dependencies',
        session_type: 'Output Questions',
        difficulty: 'Medium',
        duration_minutes: 30,
        company_pattern: 'Company Assessment Style',
        status: 'Completed'
      },
      {
        id: 's3',
        date: '2026-09-07',
        time_slot: '14:00 – 14:45',
        topic: 'Operating Systems — Processes & Threads',
        subtopic: 'Process Synchronization & Mutex Invariants',
        session_type: 'Concept Revision',
        difficulty: 'Hard',
        duration_minutes: 45,
        company_pattern: 'Diagnosed Weak Topic',
        status: 'Completed'
      },
      {
        id: 's4',
        date: '2026-09-07',
        time_slot: '18:00 – 18:30',
        topic: 'C++ Output Tracing & Pointer Mechanics',
        subtopic: 'Virtual Table & Pointer Arithmetic Output Prediction',
        session_type: 'Output Questions',
        difficulty: 'Medium',
        duration_minutes: 30,
        company_pattern: 'Company Style',
        status: 'Scheduled'
      }
    ],
    '2026-09-08': [
      {
        id: 's5',
        date: '2026-09-08',
        time_slot: '09:00 – 09:45',
        topic: 'Operating Systems — Deadlock Management',
        subtopic: "Banker's Algorithm & Coffman Conditions",
        session_type: 'MCQ Practice',
        difficulty: 'Hard',
        duration_minutes: 45,
        company_pattern: 'Diagnosed Weak Area',
        status: 'Scheduled'
      },
      {
        id: 's6',
        date: '2026-09-08',
        time_slot: '10:00 – 10:30',
        topic: 'SQL — Aggregations & Group By Out',
        subtopic: 'HAVING Clauses & Window Functions',
        session_type: 'Output Questions',
        difficulty: 'Medium',
        duration_minutes: 30,
        company_pattern: 'High Weight Target',
        status: 'Scheduled'
      },
      {
        id: 's7',
        date: '2026-09-08',
        time_slot: '16:00 – 17:00',
        topic: 'Amazon Technical Placement Mock OA #1',
        subtopic: 'Full Company Assessment Simulation',
        session_type: 'Mock Assessment',
        difficulty: 'Medium',
        duration_minutes: 60,
        company_pattern: 'Company OA Replica',
        status: 'Scheduled'
      }
    ]
  };

  const currentSessions = calendarSessions[selectedDate] || calendarSessions['2026-09-07'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Roadmap-Connected Calendar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              ⚡ Dynamic Replan Connected
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Placement Study Calendar & Session Timetable</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Your calendar automatically updates when the Adaptive Planner re-allocates time based on your mock assessment scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('practice')}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Start Practice Session
          </button>
        </div>
      </div>

      {/* Replan Notification Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>⚡ Auto-updated by Adaptive Planner: OS Process Management priority increased after Assessment #1.</span>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 underline cursor-pointer" onClick={() => onNavigate('roadmap')}>
          View Plan v{currentPlan?.version || 2} Rationale
        </span>
      </div>

      {/* Date Selector Row */}
      <div className="saas-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">September 2026 — 30-Day Preparation Timeline</h3>
          <span className="text-xs font-semibold text-indigo-700">Target Company: Amazon</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysList.map((d) => {
            const isSelected = selectedDate === d.date;
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className={`text-[10px] uppercase font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {d.dayName}
                </div>
                <div className="text-lg font-black my-0.5">{d.dayNum}</div>
                <div className={`text-[10px] font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {d.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Session Timetable */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sessions for {selectedDate === '2026-09-07' ? 'Today, September 7' : 'September 8'}
            </h3>
            <p className="text-xs text-slate-500">4 Study Blocks (Total 2.5 Hours Preparation)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {currentSessions.filter((s) => s.status === 'Completed').length} / {currentSessions.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {currentSessions.map((session) => {
            const isDone = session.status === 'Completed';
            const isMock = session.session_type === 'Mock Assessment';

            return (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isMock
                    ? 'bg-indigo-50/60 border-indigo-200'
                    : isDone
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-center min-w-[110px]">
                    <span className="text-xs font-bold font-mono text-indigo-700 block">{session.time_slot}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{session.duration_minutes} mins</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{session.topic}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          session.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : session.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {session.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {session.company_pattern}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{session.subtopic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    {session.session_type}
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate(isMock ? 'assessment' : 'practice')}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      {isMock ? 'Start Mock OA' : 'Practice Session'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
