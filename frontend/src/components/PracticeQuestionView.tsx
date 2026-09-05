import React, { useState } from 'react';
import { Question } from '../types';
import { CheckSquare, HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Filter, Code2, BookOpen, Layers } from 'lucide-react';

interface PracticeQuestionViewProps {
  onTriggerAgentCycle: () => void;
}

export const PracticeQuestionView: React.FC<PracticeQuestionViewProps> = ({ onTriggerAgentCycle }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('Amazon');
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Difficulties');
  const [selectedType, setSelectedType] = useState<string>('All Question Types');

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [outputAnswer, setOutputAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const practiceQuestions: Question[] = [
    {
      id: 'mcq-dsa-bfs-01',
      company: 'Amazon',
      topic: 'Graphs',
      subtopic: 'BFS Traversal & Shortest Path',
      title: 'Queue & Visited State Synchronization in Graph BFS',
      difficulty: 'Medium',
      question_type: 'Technical MCQ',
      distinction_tag: 'Company Previous Pattern',
      description: 'Consider an undirected graph traversal using Breadth-First Search (BFS). In standard BFS implementation for finding shortest paths, when MUST a vertex `u` be marked as `visited = true` to prevent redundant vertex processing and TLE in large graphs?',
      options: [
        'A) Immediately when vertex u is popped (dequeued) from the BFS queue.',
        'B) Immediately when vertex u is pushed (enqueued) into the BFS queue.',
        'C) After visiting all adjacent neighbors of u.',
        'D) Visited array is unnecessary for undirected graphs.'
      ],
      correct_option_index: 1,
      explanation: 'Marking a node as visited IMMEDIATELY when it is pushed (enqueued) into the BFS queue guarantees that no node is added to the queue more than once. If marked when popped, duplicate copies of the same node enter the queue, causing O(V^2) or O(2^V) space explosion.'
    },
    {
      id: 'mcq-cpp-output-01',
      company: 'Amazon',
      topic: 'C++',
      subtopic: 'Output Prediction & Pointers',
      title: 'Predict Output of Pointer Arithmetic & Virtual Function Call',
      difficulty: 'Medium',
      question_type: 'Output Prediction',
      distinction_tag: 'Company-Style Generated',
      description: 'Predict the exact printed output of the following C++ code snippet:',
      code_snippet: `#include <iostream>
using namespace std;

class Base {
public:
    virtual void print() { cout << "Base "; }
};

class Derived : public Base {
public:
    void print() override { cout << "Derived "; }
};

int main() {
    Base* b = new Derived();
    b->print();
    Derived* d = (Derived*)b;
    d->print();
    return 0;
}`,
      options: [
        'A) Base Base',
        'B) Derived Derived',
        'C) Base Derived',
        'D) Derived Base'
      ],
      correct_option_index: 1,
      explanation: 'Both calls output "Derived Derived". Because `print()` is a virtual function in Base and overridden in Derived, dynamic binding via the vtable resolves the call to Derived::print() regardless of pointer static type.'
    },
    {
      id: 'mcq-dbms-sql-01',
      company: 'Amazon',
      topic: 'DBMS & SQL',
      subtopic: 'SQL Subqueries & HAVING Clause',
      title: 'SQL Query Output for Second Highest Salary',
      difficulty: 'Medium',
      question_type: 'SQL Output',
      distinction_tag: 'Company Previous Pattern',
      description: 'Predict the output result of this SQL query executed against an Employee table with salaries [10000, 20000, 20000, 30000]:',
      code_snippet: `SELECT MAX(salary) FROM Employee 
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
      options: [
        'A) 30000',
        'B) 20000',
        'C) 10000',
        'D) NULL'
      ],
      correct_option_index: 1,
      explanation: 'The inner query `SELECT MAX(salary)` returns 30000. The outer query finds the maximum salary strictly less than 30000, which is 20000.'
    },
    {
      id: 'mcq-os-deadlock-01',
      company: 'Amazon',
      topic: 'Operating Systems',
      subtopic: 'Process Synchronization & Deadlock',
      title: 'Necessary Conditions for Coffman Deadlock State',
      difficulty: 'Easy',
      question_type: 'Conceptual MCQ',
      distinction_tag: 'General Placement',
      description: 'Which of the following is NOT one of the 4 Coffman conditions required simultaneously for a deadlock to occur in an operating system?',
      options: [
        'A) Mutual Exclusion',
        'B) Hold and Wait',
        'C) Preemption Allowed',
        'D) Circular Wait'
      ],
      correct_option_index: 2,
      explanation: 'NO PREEMPTION (resources cannot be forcibly taken from a process) is required for deadlock. If preemption is allowed, deadlocks can be broken by preemption.'
    }
  ];

  const currentQ = practiceQuestions[activeQuestionIndex] || practiceQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setOutputAnswer('');
    setActiveQuestionIndex((prev) => (prev + 1) % practiceQuestions.length);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Primary Placement Training System
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Company-Oriented MCQs & Output Questions
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Technical MCQ & Output Tracing Practice</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Train on technical MCQs, code output prediction, SQL queries, and conceptual questions tailored to your target company's assessment pattern.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            🎯 Target: {selectedCompany} Assessment
          </span>
        </div>
      </div>

      {/* 2. Top Filter Controls */}
      <div className="saas-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-indigo-700 bg-indigo-50/50"
          >
            <option value="Amazon">Amazon (SDE Style)</option>
            <option value="Google">Google (Systems & DSA)</option>
            <option value="TCS Digital">TCS Digital (Advanced CS)</option>
            <option value="Infosys SP">Infosys Specialist Programmer</option>
            <option value="Microsoft">Microsoft (Core & SQL)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Topic / Subject</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="All Topics">All Subjects</option>
            <option value="Graphs">Graphs & Trees</option>
            <option value="DBMS & SQL">DBMS & SQL</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="C++">C++ Output Tracing</option>
            <option value="OOP">OOP Invariants</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="All Difficulties">All Difficulties</option>
            <option value="Easy">Easy (Foundation)</option>
            <option value="Medium">Medium (Company Standard)</option>
            <option value="Hard">Hard (Advanced Invariants)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Question Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="All Question Types">All Types</option>
            <option value="Technical MCQ">Technical MCQ</option>
            <option value="Output Prediction">Output Prediction</option>
            <option value="SQL Output">SQL Output</option>
            <option value="Conceptual MCQ">Conceptual MCQ</option>
          </select>
        </div>
      </div>

      {/* 3. Question Practice Area */}
      <div className="saas-card p-6 space-y-6">
        {/* Question Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
              Question {activeQuestionIndex + 1} of {practiceQuestions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
              {currentQ.topic} — {currentQ.subtopic}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                currentQ.difficulty === 'Hard'
                  ? 'bg-rose-100 text-rose-800'
                  : currentQ.difficulty === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentQ.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentQ.distinction_tag === 'Company Previous Pattern'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : currentQ.distinction_tag === 'Company-Style Generated'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              🏷️ {currentQ.distinction_tag}
            </span>
          </div>
        </div>

        {/* Question Body */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 leading-snug">{currentQ.title}</h3>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">{currentQ.description}</p>

          {/* Optional Code Snippet Block */}
          {currentQ.code_snippet && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{currentQ.code_snippet}</pre>
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options?.map((optionText, oidx) => {
              const isSelected = selectedOption === oidx;
              const isCorrectOption = oidx === currentQ.correct_option_index;

              let optionStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';

              if (isSubmitted) {
                if (isCorrectOption) {
                  optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-bold';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs';
              }

              return (
                <button
                  key={oidx}
                  onClick={() => handleSelectOption(oidx)}
                  disabled={isSubmitted}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <span>{optionText}</span>
                  {isSubmitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  {isSubmitted && isSelected && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Answer Submission & Explanation Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isSubmitted && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Outcome logged to Mistake Memory
            </span>
          )}
        </div>

        {/* Detailed Explanation Breakdown */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Step-by-Step Technical Explanation:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
