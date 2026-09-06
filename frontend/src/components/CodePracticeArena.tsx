import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Code2, Sparkles, Terminal, RefreshCw } from 'lucide-react';
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
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];

  useEffect(() => {
    if (activeQuestion?.starter_code && activeQuestion.starter_code[language]) {
      setCode(activeQuestion.starter_code[language]);
    } else if (activeQuestion?.starter_code && activeQuestion.starter_code['python']) {
      setCode(activeQuestion.starter_code['python']);
    } else {
      setCode(
        'from collections import deque\n' +
        'def bfs_traversal(V: int, adj: list[list[int]]) -> list[int]:\n' +
        '    # Write your BFS algorithm here\n' +
        '    pass\n'
      );
    }
    setExecutionResult(null);
  }, [selectedQuestionIndex, language, activeQuestion]);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const qId = activeQuestion ? activeQuestion.id : "dsa-graph-bfs-01";
      const res = await executeCode(code, language, qId);
      setExecutionResult(res);
      if (res.status === 'ACCEPTED' || res.status === 'accepted') {
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
      "    # Flaw: Visited array omitted, causes duplicate expansions / loops!\n" +
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
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/60 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo">
              Interactive Coding Environment
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald">
              Subprocess Sandbox Execution
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Real Code Practice Arena</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5 max-w-2xl">
            Execute code against automated test cases in an isolated subprocess. Submissions are processed by the Evaluation & Weakness Diagnosis Agents.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadFlawedCode}
            className="px-3.5 py-2 text-xs font-bold rounded-xl subtle-badge-rose hover:bg-rose-500/30 transition-all border border-rose-500/30"
          >
            Load Flawed BFS (Missing Visited)
          </button>
          <button
            onClick={handleLoadOptimalCode}
            className="px-3.5 py-2 text-xs font-bold rounded-xl subtle-badge-emerald hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
          >
            Load Optimal Solution
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Problem Description */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold subtle-badge-indigo">
              {activeQuestion?.topic || 'Graphs'} &bull; {activeQuestion?.difficulty || 'Medium'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Sandbox Active</span>
          </div>

          <h3 className="text-lg font-bold text-white">{activeQuestion?.title || 'BFS Traversal on Graphs'}</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {activeQuestion?.description || 'Given a directed/undirected graph with V vertices and an adjacency list adj, return a BFS traversal starting from vertex 0.'}
          </p>

          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <h4 className="text-xs font-bold text-slate-200">Sample Test Cases:</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-3.5 rounded-xl glass-panel border border-white/10">
                <span className="text-slate-400 block font-sans text-[10px]">Input: V = 5, adj = [[1, 2, 3], [], [4], [], []]</span>
                <span className="text-indigo-300 font-bold">Expected: [0, 1, 2, 3, 4]</span>
              </div>
              <div className="p-3.5 rounded-xl glass-panel border border-white/10">
                <span className="text-slate-400 block font-sans text-[10px]">Input: V = 4, adj = [[1, 2], [0, 2], [0, 1, 3], [2]]</span>
                <span className="text-indigo-300 font-bold">Expected: [0, 1, 2, 3]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Subprocess Output */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Python 3 Sandbox</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 border border-indigo-400/30"
              >
                {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <Play className="w-3.5 h-3.5 fill-current text-white" />}
                <span>{isRunning ? 'Running in Sandbox...' : 'Run & Evaluate'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="w-full p-4 rounded-xl bg-slate-950/80 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none leading-relaxed resize-y border border-white/15 backdrop-blur-md shadow-inner"
            spellCheck={false}
          />

          {/* Execution Result Panel */}
          {executionResult && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-4 rounded-2xl border backdrop-blur-md ${
                  executionResult.status === 'ACCEPTED' || executionResult.status === 'accepted'
                    ? 'subtle-badge-emerald border-emerald-500/30'
                    : 'subtle-badge-rose border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(executionResult.status === 'ACCEPTED' || executionResult.status === 'accepted') ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-sm font-bold uppercase tracking-wider text-white">
                      {executionResult.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                    <span>Passed: {executionResult.passed} / {executionResult.total}</span>
                    <span>Runtime: {executionResult.runtime_ms}ms</span>
                  </div>
                </div>

                {executionResult.compile_error && (
                  <div className="mt-3 p-3 glass-panel rounded-xl border border-rose-500/30 font-mono text-xs text-rose-300">
                    <span className="font-bold block text-rose-400">Compiler Error:</span>
                    {executionResult.compile_error}
                  </div>
                )}

                {executionResult.runtime_error && (
                  <div className="mt-3 p-3 glass-panel rounded-xl border border-rose-500/30 font-mono text-xs text-rose-300">
                    <span className="font-bold block text-rose-400">Runtime Exception:</span>
                    {executionResult.runtime_error}
                  </div>
                )}

                {executionResult.flaw_detected && (
                  <div className="mt-3 pt-3 border-t border-rose-500/30 text-xs">
                    <div className="flex items-center gap-1 text-rose-300 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Flaw Detected: {executionResult.flaw_detected.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-slate-300">
                      Diagnosis: Visited state tracking was omitted prior to queue push. This flaw has been recorded in your Mistake Memory.
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
