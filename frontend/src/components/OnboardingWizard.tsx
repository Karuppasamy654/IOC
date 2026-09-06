import React, { useState } from 'react';
import { updateProfile } from '../services/api';

interface OnboardingWizardProps {
  initialProfile?: any;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState(initialProfile?.branch || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(initialProfile?.graduation_year || 2026);
  const [cgpa, setCgpa] = useState(initialProfile?.cgpa || 8.2);

  const [techFamiliarity, setTechFamiliarity] = useState<Record<string, string>>({
    DSA: 'Intermediate',
    DBMS: 'Proficient',
    OS: 'Beginner',
    Networks: 'Intermediate',
    OOP: 'Proficient',
    SQL: 'Proficient',
    SystemDesign: 'Beginner'
  });

  const [targetCompany, setTargetCompany] = useState(initialProfile?.target_company || 'Amazon');
  const [targetRole, setTargetRole] = useState(initialProfile?.target_role || 'Software Development Engineer (SDE)');
  const [preferredJobType, setPreferredJobType] = useState('Product Based');
  const [deadlineDays, setDeadlineDays] = useState(initialProfile?.preparation_deadline_days || 30);
  const [hoursPerDay, setHoursPerDay] = useState(initialProfile?.available_hours_per_day || 3.0);

  const [learningStyle, setLearningStyle] = useState('Guided + Practice');
  const [userRequirements, setUserRequirements] = useState(
    'I want to prepare for product company placement tests. I struggle with Graph algorithms and OS Deadlocks and have 3 hours per day to study.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechChange = (subject: string, level: string) => {
    setTechFamiliarity(prev => ({ ...prev, [subject]: level }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        branch,
        graduation_year: gradYear,
        cgpa: parseFloat(String(cgpa)),
        target_company: targetCompany,
        target_role: targetRole,
        preferred_job_type: preferredJobType,
        preparation_deadline_days: parseInt(String(deadlineDays)),
        available_hours_per_day: parseFloat(String(hoursPerDay)),
        learning_style: learningStyle,
        user_requirements: userRequirements,
        tech_familiarity: techFamiliarity
      });
      onComplete();
    } catch (err) {
      console.error('Error completing onboarding wizard:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card max-w-3xl mx-auto p-6 md:p-8 my-6 border border-white/15 bg-gradient-to-b from-slate-900/90 to-indigo-950/40">
      {/* Wizard Header */}
      <div className="mb-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Student Profile Setup</span>
          <h2 className="text-2xl font-bold text-white">Personalized Placement Onboarding</h2>
        </div>
        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                s === step
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500/30'
                  : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Academic & Personal */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <h3 className="text-base font-semibold text-slate-200">01. Personal & Academic Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Branch</label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                value={gradYear}
                onChange={e => setGradYear(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current CGPA (0.0 - 10.0)</label>
              <input
                type="number"
                step="0.1"
                value={cgpa}
                onChange={e => setCgpa(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Technical Familiarity */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-semibold text-slate-200">02. Self-Reported Technical Familiarity</h3>
            <p className="text-xs text-slate-400 mt-1">Rate your confidence level across core computer science domains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'DSA', label: 'Data Structures & Algorithms' },
              { key: 'DBMS', label: 'Database Management (DBMS)' },
              { key: 'OS', label: 'Operating Systems' },
              { key: 'Networks', label: 'Computer Networks' },
              { key: 'OOP', label: 'Object Oriented Programming' },
              { key: 'SQL', label: 'SQL & Database Queries' },
              { key: 'SystemDesign', label: 'System Design Fundamentals' }
            ].map(domain => (
              <div key={domain.key} className="p-3.5 glass-panel border border-white/10 rounded-xl">
                <label className="block text-xs font-semibold text-slate-300 mb-2">{domain.label}</label>
                <div className="flex gap-1.5">
                  {['Beginner', 'Intermediate', 'Proficient'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleTechChange(domain.key, lvl)}
                      className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition ${
                        techFamiliarity[domain.key] === lvl
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                          : 'bg-slate-800/60 text-slate-300 border border-white/10 hover:bg-slate-700/60'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Target Placement & Company */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <h3 className="text-base font-semibold text-slate-200">03. Target Company & Role Personalization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Company</label>
              <select
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              >
                <option value="Amazon" className="bg-slate-900 text-white">Amazon</option>
                <option value="Google" className="bg-slate-900 text-white">Google</option>
                <option value="Microsoft" className="bg-slate-900 text-white">Microsoft</option>
                <option value="TCS Digital" className="bg-slate-900 text-white">TCS Digital</option>
                <option value="Atlassian" className="bg-slate-900 text-white">Atlassian</option>
                <option value="Other / Role-based" className="bg-slate-900 text-white">Other / Role-based</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              >
                <option value="Software Development Engineer (SDE)" className="bg-slate-900 text-white">Software Engineer (SDE)</option>
                <option value="Backend Engineer" className="bg-slate-900 text-white">Backend Engineer</option>
                <option value="Full Stack Developer" className="bg-slate-900 text-white">Full Stack Developer</option>
                <option value="Data Engineer" className="bg-slate-900 text-white">Data Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preparation Deadline (Days)</label>
              <input
                type="number"
                value={deadlineDays}
                onChange={e => setDeadlineDays(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Available Daily Study Time (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={hoursPerDay}
                onChange={e => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preferences & Requirements */}
      {step === 4 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <h3 className="text-base font-semibold text-slate-200">04. Learning Style & Specific Requirements</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Learning Modality</label>
            <div className="grid grid-cols-3 gap-2">
              {['Visual', 'Coding Drills', 'Guided + Practice'].map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setLearningStyle(style)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                    learningStyle === style
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400/50 shadow-md'
                      : 'bg-slate-800/60 text-slate-300 border-white/10 hover:bg-slate-700/60'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Free-Text Preparation Requirements</label>
            <textarea
              rows={3}
              value={userRequirements}
              onChange={e => setUserRequirements(e.target.value)}
              placeholder="e.g. I want to prepare mainly for product companies. I struggle with graphs and dynamic programming..."
              className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 glass-panel hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition border border-white/10"
          >
            ← Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinish}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Unlock Assessment'}
          </button>
        )}
      </div>
    </div>
  );
};
