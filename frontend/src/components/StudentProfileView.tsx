import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { User, Building, GraduationCap, Target, Clock, BookOpen, FileText, CheckCircle2, Save, Sparkles } from 'lucide-react';

interface StudentProfileViewProps {
  profile: StudentProfile;
  onSaveProfile: (updatedProfile: Partial<StudentProfile>) => void;
  onTriggerAgentCycle: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  onSaveProfile,
  onTriggerAgentCycle
}) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    name: profile.name || 'Rahul Sharma',
    college: profile.college || 'National Institute of Technology (NIT)',
    degree: profile.degree || 'B.Tech',
    branch: profile.branch || 'Computer Science & Engineering',
    graduation_year: profile.graduation_year || 2026,
    cgpa: profile.cgpa || 8.4,
    current_year: profile.current_year || 'Final Year (4th Year)',
    current_semester: profile.current_semester || 'Semester 7',
    placement_target: profile.placement_target || 'Software Development Engineer (SDE-1)',
    target_company: profile.target_company || 'Amazon',
    preparation_deadline_days: profile.preparation_deadline_days || 30,
    available_hours_per_day: profile.available_hours_per_day || 3,
    preferred_learning_style: profile.preferred_learning_style || 'Visual Diagrams + MCQ Output Practice',
    skills: profile.skills?.length ? profile.skills : ['C++', 'Python', 'Data Structures', 'SQL', 'OS Concepts'],
    programming_languages: profile.programming_languages?.length ? profile.programming_languages : ['C++', 'Python', 'Java'],
    subjects_studied: profile.subjects_studied?.length ? profile.subjects_studied : ['DSA', 'DBMS', 'Operating Systems', 'OOP', 'Computer Networks'],
    strengths: profile.strengths?.length ? profile.strengths : ['SQL Queries', 'DBMS Normalization', 'C++ Syntax'],
    weaknesses: profile.weaknesses?.length ? profile.weaknesses : ['Graph BFS/DFS Invariants', 'OS Process Synchronization', 'DP Transitions'],
    resume_summary: profile.resume_summary || 'Final year CSE undergraduate with projects in Web Systems and Database Optimization. Solid understanding of CS core fundamentals, seeking SDE role.',
    curriculum_summary: profile.curriculum_summary || 'Standard GATE/Placement CS Syllabus: Data Structures & Algorithms, Database Management Systems, Operating Systems, OOP in C++, Computer Networks.'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const companyOptions = [
    'Amazon', 'Google', 'Microsoft', 'TCS Digital', 'Infosys SP', 'Wipro Turbo', 'Flipkart', 'Adobe', 'Oracle', 'Cognizant GenC'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/60 border border-white/15 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
                Personal Student Setup
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Placement Target & Personal Profile</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              Configure your academic background, target company assessment style, preparation timeframe, curriculum, and resume. The multi-agent system uses this exact profile to generate your dynamic roadmap and calendar.
            </p>
          </div>

          <button
            onClick={() => onTriggerAgentCycle()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap active:scale-95 border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Adaptive Roadmap</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl subtle-badge-emerald border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Profile saved successfully! Adaptive Planner has updated your placement preparation parameters.</span>
        </div>
      )}

      {/* Profile Setup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid 1: Personal & Academic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Information */}
          <div className="glass-card p-6 space-y-4 border border-white/15">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <User className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Personal & University Information</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">College / University</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Branch / Major</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CGPA / Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Year</label>
                  <input
                    type="text"
                    value={formData.current_year}
                    onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Placement Goal & Target Company */}
          <div className="glass-card p-6 space-y-4 border border-white/15">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Target className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Target Company & Placement Parameters</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Company</label>
                <select
                  value={formData.target_company}
                  onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-bold text-indigo-300"
                >
                  {companyOptions.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c} (Company Assessment Style)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Placement Role</label>
                <input
                  type="text"
                  value={formData.placement_target}
                  onChange={(e) => setFormData({ ...formData, placement_target: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Preparation Days</label>
                  <input
                    type="number"
                    value={formData.preparation_deadline_days}
                    onChange={(e) => setFormData({ ...formData, preparation_deadline_days: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Daily Prep Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.available_hours_per_day}
                    onChange={(e) => setFormData({ ...formData, available_hours_per_day: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Preferred Learning Style</label>
                <input
                  type="text"
                  value={formData.preferred_learning_style}
                  onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid 2: Academic Curriculum & Resume Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Curriculum */}
          <div className="glass-card p-6 space-y-4 border border-white/15">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Curriculum & Subjects Studied</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Programming Languages</label>
                <input
                  type="text"
                  value={formData.programming_languages?.join(', ')}
                  onChange={(e) =>
                    setFormData({ ...formData, programming_languages: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  placeholder="C++, Python, Java, SQL"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Curriculum & Syllabus Highlights</label>
                <textarea
                  rows={4}
                  value={formData.curriculum_summary}
                  onChange={(e) => setFormData({ ...formData, curriculum_summary: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                />
              </div>
            </div>
          </div>

          {/* Resume & Self-Identified Weaknesses */}
          <div className="glass-card p-6 space-y-4 border border-white/15">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Resume Context & Perceived Weaknesses</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Resume Highlights / Abstract</label>
                <textarea
                  rows={2}
                  value={formData.resume_summary}
                  onChange={(e) => setFormData({ ...formData, resume_summary: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Self-Identified Weak Topics</label>
                <input
                  type="text"
                  value={formData.weaknesses?.join(', ')}
                  onChange={(e) =>
                    setFormData({ ...formData, weaknesses: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 focus:outline-none focus:border-indigo-400 font-medium text-white"
                  placeholder="Graph BFS/DFS Invariants, OS Process Synchronization, DP Transitions"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all active:scale-95 border border-indigo-400/30"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Update Preparation Schedule</span>
          </button>
        </div>
      </form>
    </div>
  );
};
