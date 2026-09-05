import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Code2, Sparkles, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, CodeExecutionResult } from '../types';
import { executeCode } from '../services/api';

interface CodePracticeArenaProps {
  questions: Question[];
  onExecutionComplete?: (result: CodeExecutionResult, code: string) => void;
}

export const CodePracticeArena: React.FC<CodePracticeArenaProps> = ({
  questions,
  onExecutionComplete
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [inputVal, setInputVal] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];

  useEffect(() => {
    if (activeQuestion?.starter_code && activeQuestion.starter_code[language]) {
      setCode(activeQuestion.starter_code[language]);
    } else if (activeQuestion?.starter_code && activeQuestion.starter_code['python']) {
      setCode(activeQuestion.starter_code['python']);
    } else {
      setCode('# Simple Code Compiler & Concept Tester\ndef bfs_traversal(V, adj):\n    # Write your logic\n    pass\n');
    }
    setExecutionResult(null);
  }, [selectedQuestionIndex, language, activeQuestion]);

  const handleRunCode = async () => {
    if (!activeQuestion) return;
    setIsRunning(true);
    try {
      const res = await executeCode(code, language, activeQuestion.id);
      setExecutionResult(res);
      if (res.status === 'accepted') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      if (onExecutionComplete) {
        onExecutionComplete(res, code);
      }
    } catch (err) {
      console.error('Error executing code:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadFlawedCode = () => {
    setCode(
      "from collections import deque\n" +
      "def bfs_traversal(V: int, adj: list[list[int]]) -> list[int]:\n" +
      "    queue = deque([0])\n" +
      "    result = []\n" +
      "    # Visited tracking omitted (triggers flaw detection)\n" +
      "    while queue and len(result) < V:\n" +
      "        node = queue.popleft()\n" +
      "        result.append(node)\n" +
      "        for neighbor in adj[node]:\n" +
      "            queue.append(neighbor)\n" +
      "    return result\n"
    );
  };

  const handleLoadOptimalCode = () => {
    setCode(
      "from collections import deque\n" +
      "def bfs_traversal(V: int, adj: list[list[int]]) -> list[int]:\n" +
      "    visited = [False] * V\n" +
      "    queue = deque([0])\n" +
      "    visited[0] = True\n" +
      "    result = []\n" +
      "    while queue:\n" +
      "        node = queue.popleft()\n" +
      "        result.append(node)\n" +
      "        for neighbor in adj[node]:\n" +
      "            if not visited[neighbor]:\n" +
      "                visited[neighbor] = True\n" +
      "                queue.append(neighbor)\n" +
      "    return result\n"
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Supporting Utility
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Simple Multi-Language Code Practice Compiler
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Code Practice Compiler</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
            A clean supporting environment for testing code syntax, basic programming logic, and algorithm experimentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadFlawedCode}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
          >
            Insert Flawed Code (Demo Bug)
          </button>
          <button
            onClick={handleLoadOptimalCode}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
          >
            Insert Optimal Solution
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Practice Topic Description */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {activeQuestion?.topic || 'DSA Graphs'} &bull; {activeQuestion?.difficulty || 'Medium'}
            </span>
            <span className="text-xs text-slate-500 font-mono">Concept Sandbox</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{activeQuestion?.title || 'Breadth First Search (BFS) Traversal'}</h3>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {activeQuestion?.description || 'Write a small program to test graph traversal and visited state handling.'}
          </p>

          <div className="space-y-2 pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Custom Test Input</label>
            <textarea
              rows={3}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="V = 5, adj = [[1, 2], [0, 3], [0, 4], [1], [2]]"
              className="w-full p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Results */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Code Practice Editor</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-800 font-semibold bg-slate-50"
              >
                <option value="python">Python 3.11</option>
                <option value="cpp">C++ 20</option>
                <option value="java">Java 17</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="sql">SQL</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="w-full p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed resize-y border border-slate-800"
            placeholder="Write your basic code here..."
            spellCheck={false}
          />

          {/* Execution Output & Status */}
          {executionResult && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-4 rounded-xl border ${
                  executionResult.status === 'accepted'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {executionResult.status === 'accepted' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-sm font-bold capitalize">
                      {executionResult.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-600">
                    Runtime: {executionResult.runtime_ms}ms
                  </span>
                </div>

                {/* Flaw Detection */}
                {executionResult.flaw_detected && (
                  <div className="mt-3 pt-3 border-t border-rose-200 text-xs">
                    <div className="flex items-center gap-1 text-rose-700 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flaw Detected: {executionResult.flaw_detected.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-slate-700">
                      Evaluator telemetry detected that visited state tracking was omitted, causing infinite loops on cyclic graphs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
