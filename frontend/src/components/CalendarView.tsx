import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Award, RefreshCw } from 'lucide-react';
import { AdaptivePlan, CalendarSession } from '../types';

interface CalendarViewProps {
  currentPlan: AdaptivePlan | null;
  onNavigate: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentPlan, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 7)); // Sept 7, 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-07');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (8 = September)
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get total days in current month and starting day index (0=Sun, 6=Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateStr = (dayNum: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Generate sessions dynamically based on date
  const getSessionsForDate = (dateStr: string): CalendarSession[] => {
    const day = parseInt(dateStr.split('-')[2], 10);

    if (day % 4 === 1) {
      return [
        {
          id: `s-${dateStr}-1`,
          date: dateStr,
          time_slot: '09:00 – 09:45',
          topic: 'DSA — Graphs BFS & DFS Invariants',
          subtopic: 'Visited Array Synchronization',
          session_type: 'MCQ Practice',
          difficulty: 'Medium',
          duration_minutes: 45,
          company_pattern: 'Amazon High Frequency',
          status: day <= 7 ? 'Completed' : 'Scheduled'
        },
        {
          id: `s-${dateStr}-2`,
          date: dateStr,
          time_slot: '10:00 – 10:30',
          topic: 'DBMS — Normalization & ER Diagrams',
          subtopic: '3NF & BCNF Functional Dependencies',
          session_type: 'Output Questions',
          difficulty: 'Medium',
          duration_minutes: 30,
          company_pattern: 'Company Pattern',
          status: day <= 7 ? 'Completed' : 'Scheduled'
        },
        {
          id: `s-${dateStr}-3`,
          date: dateStr,
          time_slot: '14:00 – 14:45',
          topic: 'OS — Process Synchronization & Mutex',
          subtopic: 'Semaphores & Deadlock Conditions',
          session_type: 'Concept Revision',
          difficulty: 'Hard',
          duration_minutes: 45,
          company_pattern: 'Diagnosed Weak Topic',
          status: day <= 7 ? 'Completed' : 'Scheduled'
        }
      ];
    } else if (day % 4 === 2) {
      return [
        {
          id: `s-${dateStr}-4`,
          date: dateStr,
          time_slot: '09:00 – 09:45',
          topic: 'Operating Systems — Deadlock Prevention',
          subtopic: "Banker's Algorithm State Space",
          session_type: 'MCQ Practice',
          difficulty: 'Hard',
          duration_minutes: 45,
          company_pattern: 'Diagnosed Weak Area',
          status: day <= 7 ? 'Completed' : 'Scheduled'
        },
        {
          id: `s-${dateStr}-5`,
          date: dateStr,
          time_slot: '11:00 – 11:30',
          topic: 'SQL — Aggregations & Window Functions',
          subtopic: 'HAVING Clauses & DENSE_RANK()',
          session_type: 'Output Questions',
          difficulty: 'Medium',
          duration_minutes: 30,
          company_pattern: 'High Weight Target',
          status: day <= 7 ? 'Completed' : 'Scheduled'
        }
      ];
    } else if (day % 4 === 3) {
      return [
        {
          id: `s-${dateStr}-6`,
          date: dateStr,
          time_slot: '14:00 – 15:00',
          topic: 'Amazon Technical Placement Mock OA',
          subtopic: 'Full Company Assessment Simulation',
          session_type: 'Mock Assessment',
          difficulty: 'Hard',
          duration_minutes: 60,
          company_pattern: 'Company OA Replica',
          status: 'Scheduled'
        }
      ];
    } else {
      return [
        {
          id: `s-${dateStr}-7`,
          date: dateStr,
          time_slot: '10:00 – 10:45',
          topic: 'C++ Output Tracing & Pointer Mechanics',
          subtopic: 'Virtual Table & Pointer Arithmetic',
          session_type: 'Output Questions',
          difficulty: 'Medium',
          duration_minutes: 45,
          company_pattern: 'Syntax Flaw Focus',
          status: 'Scheduled'
        },
        {
          id: `s-${dateStr}-8`,
          date: dateStr,
          time_slot: '16:00 – 16:30',
          topic: 'Computer Networks — TCP 3-Way Handshake',
          subtopic: 'SYN, ACK & Packet Headers',
          session_type: 'MCQ Practice',
          difficulty: 'Easy',
          duration_minutes: 30,
          company_pattern: 'Core CS Standard',
          status: 'Scheduled'
        }
      ];
    }
  };

  const currentSessions = getSessionsForDate(selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold subtle-badge-indigo">
              Interactive Monthly Study Calendar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold subtle-badge-amber">
              ⚡ Dynamic Replan Connected
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Placement Study Calendar & Session Timetable</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Real interactive monthly calendar automatically populated with your customized daily study blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('practice')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            Start Practice Session
          </button>
        </div>
      </div>

      {/* Replan Notification Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-200 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>⚡ Auto-updated by Adaptive Planner: OS Process Management priority increased after Assessment #1.</span>
        </div>
        <span className="text-[11px] font-bold text-indigo-300 underline cursor-pointer hover:text-indigo-200" onClick={() => onNavigate('roadmap')}>
          View Plan v{currentPlan?.version || 2} Rationale
        </span>
      </div>

      {/* Actual Interactive Monthly Calendar Grid */}
      <div className="glass-card p-6 space-y-4">
        {/* Month Navigation Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black text-white tracking-tight">
              {monthName} {year}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-all border border-white/10"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 8, 7))}
              className="px-3 py-1.5 rounded-xl text-xs font-bold subtle-badge-indigo"
            >
              Today (Sept 7)
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-all border border-white/10"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Day Name Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* 31-Day Date Cells Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty padding cells for start of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-950/20 border border-white/5 opacity-30" />
          ))}

          {/* Actual Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = formatDateStr(dayNum);
            const isSelected = selectedDateStr === dateStr;
            const isToday = dateStr === '2026-09-07';
            const daySessions = getSessionsForDate(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-400 shadow-lg shadow-indigo-500/30'
                    : isToday
                    ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-900/60 border-white/10 hover:border-indigo-400/50 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-black ${isSelected ? 'text-white' : isToday ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                      Today
                    </span>
                  )}
                </div>

                {/* Session indicator dots/pill */}
                <div className="space-y-1 w-full">
                  {daySessions.slice(0, 1).map((s) => (
                    <div
                      key={s.id}
                      className={`text-[9px] truncate font-medium px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : s.session_type === 'Mock Assessment'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-950/70 text-slate-300 border border-white/10'
                      }`}
                    >
                      {s.topic.split('—')[0]}
                    </div>
                  ))}
                  {daySessions.length > 1 && (
                    <span className="text-[9px] font-bold text-indigo-300 block text-right">
                      +{daySessions.length - 1} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Session Timetable List */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Study Schedule for {selectedDateStr}
            </h3>
            <p className="text-xs text-slate-400">
              {currentSessions.length} Study Blocks Scheduled ({currentSessions.reduce((acc, s) => acc + s.duration_minutes, 0)} Mins Total)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded subtle-badge-slate">
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
                    ? 'bg-indigo-950/50 border-indigo-500/40 shadow-indigo-500/20'
                    : isDone
                    ? 'bg-slate-900/50 border-white/10'
                    : 'bg-slate-900/80 border-white/15 shadow-md'
                }`}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-center min-w-[110px]">
                    <span className="text-xs font-bold font-mono text-indigo-400 block">{session.time_slot}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{session.duration_minutes} mins</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{session.topic}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          session.difficulty === 'Hard'
                            ? 'subtle-badge-rose'
                            : session.difficulty === 'Medium'
                            ? 'subtle-badge-amber'
                            : 'subtle-badge-emerald'
                        }`}
                      >
                        {session.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold subtle-badge-indigo">
                        {session.company_pattern}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{session.subtopic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded subtle-badge-slate">
                    {session.session_type}
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-bold subtle-badge-emerald px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate(isMock ? 'assessment' : 'practice')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
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
