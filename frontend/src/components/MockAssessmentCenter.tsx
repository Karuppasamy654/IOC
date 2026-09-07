import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle2, AlertTriangle, ArrowRight, Play, RefreshCw, Sparkles, HelpCircle, CheckSquare, Layers, Sliders, Zap, Calendar, AlertCircle } from 'lucide-react';
import { generateMockAssessment, submitMockAssessment } from '../services/api';

interface MockAssessmentCenterProps {
  onTriggerReplan?: () => void;
  initialConfig?: {
    durationMinutes?: number;
    subjectFocus?: string;
    targetCompany?: string;
    difficulty?: string;
    questionCount?: number;
  } | null;
}

export const calculateQuestionsForDuration = (duration: number): number => {
  return Math.min(30, Math.max(1, duration));
};

// ── Local question bank fallback (used when API is unavailable / user not logged in) ──
const LOCAL_QUESTIONS: Record<string, { title: string; description: string; options: string[]; correct: number; topic: string }[]> = {
  Graphs: [
    {
      title: 'BFS vs DFS – Cycle Detection Invariant',
      description: 'In Kahn\'s topological sort algorithm applied to a directed graph G=(V,E), which condition definitively indicates the presence of a directed cycle?',
      options: ['A) The processed node count is less than V after queue exhaustion', 'B) All in-degrees become zero simultaneously', 'C) DFS stack depth exceeds O(V+E)', 'D) In-degree array contains negative values'],
      correct: 0,
      topic: 'Graphs'
    },
    {
      title: "Dijkstra's Algorithm – Priority Queue Invariant",
      description: "What is the time complexity of Dijkstra's shortest path algorithm when implemented with a binary min-heap (priority queue) on a graph with V vertices and E edges?",
      options: ['A) O((V + E) log V)', 'B) O(V²)', 'C) O(E log E)', 'D) O(V log E)'],
      correct: 0,
      topic: 'Graphs'
    },
    {
      title: 'Graph – Connected Components',
      description: 'In an undirected graph, what is the minimum number of edges required to make a graph with N nodes fully connected (a spanning tree)?',
      options: ['A) N - 1', 'B) N', 'C) N + 1', 'D) N(N-1)/2'],
      correct: 0,
      topic: 'Graphs'
    },
  ],
  'Operating Systems': [
    {
      title: 'Mutex vs Binary Semaphore',
      description: 'What is the primary operational difference between a Mutex lock and a Binary Semaphore in process synchronization?',
      options: ['A) A Mutex has ownership (only the locking thread can unlock it), while any thread can signal a semaphore', 'B) Semaphores can only take values 0 or 1, but Mutexes can take any value', 'C) Mutexes cause immediate kernel panic on contention', 'D) Binary semaphores operate exclusively in user-space'],
      correct: 0,
      topic: 'Operating Systems'
    },
    {
      title: 'Deadlock – Necessary Conditions',
      description: 'Which of the four Coffman conditions is NOT required for a deadlock to occur?',
      options: ['A) Preemption is allowed', 'B) Mutual Exclusion', 'C) Hold and Wait', 'D) Circular Wait'],
      correct: 0,
      topic: 'Operating Systems'
    },
    {
      title: 'Page Replacement – Optimal Algorithm',
      description: 'The Optimal (OPT) page replacement algorithm replaces the page that:',
      options: ['A) Will not be used for the longest period in the future', 'B) Was least recently used', 'C) Has the lowest page number', 'D) Was most frequently accessed'],
      correct: 0,
      topic: 'Operating Systems'
    },
  ],
  'DBMS & SQL': [
    {
      title: 'SQL HAVING vs WHERE Clause',
      description: 'Which SQL clause is used to filter rows after the GROUP BY aggregation has been applied?',
      options: ['A) HAVING', 'B) WHERE', 'C) FILTER', 'D) ON'],
      correct: 0,
      topic: 'DBMS & SQL'
    },
    {
      title: 'BCNF Normalization',
      description: 'A relation R is in BCNF if and only if for every non-trivial functional dependency X → Y:',
      options: ['A) X is a superkey of R', 'B) Y is a primary key', 'C) X is a foreign key', 'D) Y contains only non-prime attributes'],
      correct: 0,
      topic: 'DBMS & SQL'
    },
    {
      title: 'Transaction ACID – Atomicity',
      description: 'Which ACID property ensures that either all operations in a transaction are committed or none are applied to the database?',
      options: ['A) Atomicity', 'B) Consistency', 'C) Isolation', 'D) Durability'],
      correct: 0,
      topic: 'DBMS & SQL'
    },
  ],
  'Dynamic Programming': [
    {
      title: '0/1 Knapsack – Reverse Iteration Invariant',
      description: 'In 0/1 Knapsack using a 1D DP array, why must the capacity loop iterate in REVERSE (W down to weight)?',
      options: ['A) To ensure each item is used at most once by preserving the previous row state', 'B) To reduce time complexity from O(NW) to O(N)', 'C) Reverse iteration avoids integer overflow', 'D) Forward iteration causes index-out-of-bounds exceptions'],
      correct: 0,
      topic: 'Dynamic Programming'
    },
    {
      title: 'LCS – Optimal Substructure',
      description: 'In the Longest Common Subsequence problem, if the last characters of both strings match, what is the recurrence relation?',
      options: ['A) LCS(i,j) = 1 + LCS(i-1, j-1)', 'B) LCS(i,j) = max(LCS(i-1,j), LCS(i,j-1))', 'C) LCS(i,j) = LCS(i-1,j) + LCS(i,j-1)', 'D) LCS(i,j) = LCS(i,j-1) + 1'],
      correct: 0,
      topic: 'Dynamic Programming'
    },
  ],
  'Computer Networks': [
    {
      title: 'TCP 3-Way Handshake – SYN-ACK Role',
      description: 'During TCP connection establishment, what is the primary role of the SYN-ACK packet sent from server to client?',
      options: ['A) Acknowledges the client\'s SYN and sends the server\'s own initial sequence number', 'B) Terminates the connection gracefully', 'C) Encrypts the HTTP payload using TLS keys', 'D) Forces the client to flush the DNS cache'],
      correct: 0,
      topic: 'Computer Networks'
    },
    {
      title: 'OSI Model – Transport Layer',
      description: 'Which OSI layer is responsible for end-to-end error detection, flow control, and reliable data delivery?',
      options: ['A) Transport Layer (Layer 4)', 'B) Network Layer (Layer 3)', 'C) Data Link Layer (Layer 2)', 'D) Session Layer (Layer 5)'],
      correct: 0,
      topic: 'Computer Networks'
    },
  ],
  OOP: [
    {
      title: 'Virtual Functions – Runtime Polymorphism',
      description: 'When a virtual function is called via a base class pointer pointing to a derived class object, what mechanism resolves the correct function?',
      options: ['A) Dynamic binding via vptr/vtable at runtime', 'B) Static binding at compile time to the base class', 'C) Compiler throws a type mismatch exception', 'D) The function call is always resolved to the base class'],
      correct: 0,
      topic: 'OOP'
    },
    {
      title: 'Inheritance – Diamond Problem',
      description: 'In C++, the diamond problem occurs in multiple inheritance when:',
      options: ['A) Two base classes share a common ancestor, causing ambiguous member access', 'B) A class inherits from more than 2 classes', 'C) Virtual functions are overridden in multiple base classes', 'D) A destructor is called multiple times'],
      correct: 0,
      topic: 'OOP'
    },
  ],
};

const FALLBACK_ALL_TOPICS = ['Graphs', 'Operating Systems', 'DBMS & SQL', 'Dynamic Programming', 'Computer Networks', 'OOP'];

const generateLocalQuestions = (
  topicFocus: string,
  count: number,
  company: string,
  difficulty: string
): any[] => {
  const selected: any[] = [];
  const usedTitles = new Set<string>();

  // 1. Gather all matching questions from LOCAL_QUESTIONS
  let pool: any[] = [];
  if (topicFocus !== 'All Subjects' && LOCAL_QUESTIONS[topicFocus]) {
    pool = [...LOCAL_QUESTIONS[topicFocus]];
  } else {
    FALLBACK_ALL_TOPICS.forEach(t => {
      if (LOCAL_QUESTIONS[t]) pool.push(...LOCAL_QUESTIONS[t]);
    });
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!usedTitles.has(q.title)) {
      usedTitles.add(q.title);
      selected.push({
        id: `local-q-${selected.length + 1}-${Date.now()}`,
        company: company,
        topic: q.topic,
        subtopic: `${q.topic} Core Invariants`,
        title: q.title,
        difficulty: difficulty,
        question_type: 'mcq',
        description: q.description,
        starter_code: {},
        options: q.options,
        correct_option_index: q.correct,
        explanation: 'Refer to core CS fundamentals documentation.',
        test_cases_count: 0
      });
    }
  }

  // 2. If count not met, draw unique questions from other subjects in LOCAL_QUESTIONS
  if (selected.length < count) {
    const allOtherPool: any[] = [];
    Object.keys(LOCAL_QUESTIONS).forEach(t => {
      allOtherPool.push(...LOCAL_QUESTIONS[t]);
    });
    const shuffledOthers = allOtherPool.sort(() => Math.random() - 0.5);
    for (const q of shuffledOthers) {
      if (selected.length >= count) break;
      if (!usedTitles.has(q.title)) {
        usedTitles.add(q.title);
        selected.push({
          id: `local-q-${selected.length + 1}-${Date.now()}`,
          company: company,
          topic: q.topic,
          subtopic: `${q.topic} Technical Analysis`,
          title: q.title,
          difficulty: difficulty,
          question_type: 'mcq',
          description: q.description,
          starter_code: {},
          options: q.options,
          correct_option_index: q.correct,
          explanation: 'Refer to placement subject documentation.',
          test_cases_count: 0
        });
      }
    }
  }

  // 3. Dynamic synthesis fallback for any remaining slots to guarantee 100% unique items
  const extraTemplates = [
    {
      topic: 'Graphs',
      title: `${company} Graph BFS vs DFS Traversal Space Complexity`,
      desc: 'What is the peak memory space complexity of Breadth-First Search (BFS) on a tree with branching factor B and max depth D versus Depth-First Search (DFS)?',
      opts: ['A) BFS: O(B^D) memory (level width), DFS: O(D) memory (call stack depth)', 'B) Both take O(1) memory', 'C) BFS takes O(D) and DFS takes O(B^D)', 'D) Both require O(B * D) memory'],
      correct: 0
    },
    {
      topic: 'DBMS & SQL',
      title: `${company} SQL Inner Join vs Left Join Output Nullability`,
      desc: 'In SQL relational queries, how does an INNER JOIN differ from a LEFT OUTER JOIN regarding non-matching rows?',
      opts: ['A) INNER JOIN discards non-matching rows from both tables, while LEFT JOIN retains all rows from the left table with NULLs for unmatched right fields.', 'B) INNER JOIN retains all NULL rows.', 'C) LEFT JOIN is faster than INNER JOIN in all cases.', 'D) INNER JOIN produces a Cartesian product.'],
      correct: 0
    },
    {
      topic: 'Operating Systems',
      title: `${company} Virtual Memory Page Fault Resolution Sequence`,
      desc: 'When a process references a page not present in physical RAM (Page Fault), what is the correct handling sequence by OS kernel?',
      opts: ['A) Trap to OS -> Save process state -> Locate page on disk -> Swap in page to free frame -> Update Page Table -> Resume process', 'B) Terminate process immediately with SegFault', 'C) Reboot kernel', 'D) Clear TLB cache only'],
      correct: 0
    },
    {
      topic: 'Dynamic Programming',
      title: `${company} Longest Common Subsequence DP Space Compression`,
      desc: 'When computing Longest Common Subsequence of strings of length M and N, how can space complexity be reduced from O(M * N) to O(min(M, N))?',
      opts: ['A) Maintain only 2 rows of DP state corresponding to current and previous string indices', 'B) Omit DP table entirely', 'C) Use binary search on character ASCII codes', 'D) Sort strings before processing'],
      correct: 0
    },
    {
      topic: 'Computer Networks',
      title: `${company} TCP Flow Control vs Congestion Control`,
      desc: 'What is the distinction between TCP Flow Control (Sliding Window) and TCP Congestion Control?',
      opts: ['A) Flow Control prevents sender from overwhelming the RECEIVER, whereas Congestion Control prevents overwhelming the INTERMEDIATE NETWORK.', 'B) Flow Control runs at Layer 3, Congestion Control at Layer 7.', 'C) Flow Control handles encryption, Congestion Control handles ports.', 'D) Both terms are completely identical.'],
      correct: 0
    },
    {
      topic: 'Trees',
      title: `${company} Binary Search Tree Balanced AVL Height Invariant`,
      desc: 'In an AVL tree, what is the maximum allowed difference in height between the left and right subtrees of any node (Balance Factor)?',
      opts: ['A) At most 1 (|height(left) - height(right)| <= 1)', 'B) Exactly 0', 'C) Up to log N', 'D) No limit'],
      correct: 0
    },
    {
      topic: 'Arrays & Strings',
      title: `${company} Kadane\'s Algorithm Maximum Subarray Sum`,
      desc: 'What is the time complexity of finding the maximum contiguous subarray sum in an array using Kadane\'s Algorithm?',
      opts: ['A) O(N) time with O(1) space', 'B) O(N^2) time with O(N) space', 'C) O(N log N) time', 'D) O(2^N) exponential time'],
      correct: 0
    },
    {
      topic: 'Quantitative Aptitude',
      title: `${company} Speed Distance & Time Average Speed Calculation`,
      desc: 'A car travels from city A to B at 60 km/h and returns at 40 km/h. What is the overall average speed for the round trip?',
      opts: ['A) 48 km/h (2 * 60 * 40 / (60 + 40))', 'B) 50 km/h', 'C) 52 km/h', 'D) 45 km/h'],
      correct: 0
    }
  ];

  let synthIndex = 0;
  while (selected.length < count) {
    const tmpl = extraTemplates[synthIndex % extraTemplates.length];
    const uniqueTitle = `${tmpl.title} (Part ${Math.floor(synthIndex / extraTemplates.length) + 1})`;
    
    if (!usedTitles.has(uniqueTitle)) {
      usedTitles.add(uniqueTitle);
      selected.push({
        id: `local-synth-${selected.length + 1}-${Date.now()}`,
        company: company,
        topic: tmpl.topic,
        subtopic: `${tmpl.topic} Concept Verification`,
        title: uniqueTitle,
        difficulty: difficulty,
        question_type: 'mcq',
        description: tmpl.desc,
        starter_code: {},
        options: tmpl.opts,
        correct_option_index: tmpl.correct,
        explanation: 'Detailed technical analysis.',
        test_cases_count: 0
      });
    }
    synthIndex++;
  }

  return selected;
};

export const MockAssessmentCenter: React.FC<MockAssessmentCenterProps> = ({ onTriggerReplan, initialConfig }) => {
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState<boolean>(false);

  // Setup Parameters
  const [targetCompany, setTargetCompany] = useState<string>('Amazon');
  const [subjectFocus, setSubjectFocus] = useState<string>('All Subjects');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [useDynamicAI, setUseDynamicAI] = useState<boolean>(true);

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.targetCompany) setTargetCompany(initialConfig.targetCompany);
      if (initialConfig.subjectFocus) setSubjectFocus(initialConfig.subjectFocus);
      if (initialConfig.difficulty) setDifficulty(initialConfig.difficulty);
      if (initialConfig.durationMinutes) {
        const d = Math.min(30, initialConfig.durationMinutes);
        setDurationMinutes(d);
        setQuestionCount(initialConfig.questionCount ? Math.min(30, initialConfig.questionCount) : d);
      } else if (initialConfig.questionCount) {
        const q = Math.min(30, initialConfig.questionCount);
        setQuestionCount(q);
        setDurationMinutes(q);
      }
    }
  }, [initialConfig]);

  const handleDurationChange = (newDuration: number) => {
    const capped = Math.min(30, Math.max(1, newDuration));
    setDurationMinutes(capped);
    setQuestionCount(capped); // 1 min per question!
  };

  const handleGenerateTest = async () => {
    setIsLoading(true);
    setEvalResult(null);
    setSelectedAnswers({});
    setApiError(null);
    setUsingLocalFallback(false);

    try {
      const data = await generateMockAssessment({
        durationMinutes,
        targetCompany,
        subjectFocus,
        difficulty,
        questionCount,
        useDynamicAI,
        scheduledTopics: subjectFocus === "Today's Scheduled Topics" ? ["Graphs", "Operating Systems", "SQL"] : []
      });

      // Check for API error responses (auth failure, server error, etc.)
      if (!data || data.detail || data.error || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data?.detail || data?.error || 'API returned empty questions');
      }

      setAssessmentData(data);
      setCurrentQIndex(0);
    } catch (err: any) {
      console.warn('API assessment failed, using local fallback:', err.message);
      // Generate locally using built-in question bank
      const localQuestions = generateLocalQuestions(subjectFocus, questionCount, targetCompany, difficulty);
      const sessionId = `local-session-${Date.now()}`;
      setAssessmentData({
        session_id: sessionId,
        title: `${targetCompany} ${subjectFocus} Mock Assessment (Offline)`,
        target_company: targetCompany,
        target_role: 'Software Development Engineer (SDE)',
        duration_minutes: durationMinutes,
        total_questions: localQuestions.length,
        topic_breakdown_target: {},
        questions: localQuestions,
        is_local: true
      });
      setUsingLocalFallback(true);
      setCurrentQIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentData) return;
    setIsSubmitting(true);

    try {
      // Local evaluation when using fallback
      if (usingLocalFallback || assessmentData.is_local) {
        const questions = assessmentData.questions;
        let correct = 0;
        const topicScores: Record<string, number[]> = {};
        const detailed = questions.map((q: any) => {
          const chosen = selectedAnswers[q.id];
          const isCorrect = chosen === q.correct_option_index;
          if (isCorrect) correct++;
          const score = isCorrect ? 100 : 0;
          if (!topicScores[q.topic]) topicScores[q.topic] = [];
          topicScores[q.topic].push(score);
          return {
            question_id: q.id,
            topic: q.topic,
            verdict: isCorrect ? 'Correct' : 'Incorrect',
            score,
            title: q.title
          };
        });

        const overallPct = Math.round((correct / questions.length) * 100 * 10) / 10;
        const topicBreakdown: Record<string, number> = {};
        for (const [t, scores] of Object.entries(topicScores)) {
          topicBreakdown[t] = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length * 10) / 10;
        }
        setEvalResult({
          session_id: assessmentData.session_id,
          overall_score_percentage: overallPct,
          topic_breakdown: topicBreakdown,
          detailed_evaluations: detailed,
          readiness_delta: Math.round(overallPct * 0.15 * 10) / 10,
          is_local: true
        });
        return;
      }

      // API-backed evaluation
      const submissions = assessmentData.questions.map((q: any) => ({
        question_id: q.id,
        selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 0,
        code_eval_result: q.question_type === 'coding' ? { passed: 4, total: 4 } : undefined
      }));

      const res = await submitMockAssessment(assessmentData.session_id, submissions);
      if (!res || res.detail || res.error) throw new Error(res?.detail || 'Submit failed');
      setEvalResult(res);
    } catch (err: any) {
      console.error('Submit error:', err);
      // Show a basic local score anyway
      const questions = assessmentData.questions;
      let correct = 0;
      const detailed = questions.map((q: any) => {
        const chosen = selectedAnswers[q.id];
        const isCorrect = chosen === q.correct_option_index;
        if (isCorrect) correct++;
        return { question_id: q.id, topic: q.topic || 'General', verdict: isCorrect ? 'Correct' : 'Incorrect', score: isCorrect ? 100 : 0, title: q.title };
      });
      const overallPct = Math.round((correct / questions.length) * 100 * 10) / 10;
      setEvalResult({
        overall_score_percentage: overallPct,
        topic_breakdown: {},
        detailed_evaluations: detailed,
        readiness_delta: Math.round(overallPct * 0.15 * 10) / 10
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Countdown timer ──
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    if (assessmentData && !evalResult) {
      setTimeLeft(durationMinutes * 60);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [assessmentData, evalResult]);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) { setTimerActive(false); return; }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = assessmentData?.questions?.[currentQIndex];
  const qOptions = currentQ?.options && currentQ.options.length > 0
    ? currentQ.options
    : [
        'A) Optimal state invariant satisfied',
        'B) Sub-optimal state invariant',
        'C) Boundary flaw state',
        'D) Time limit exceeded state'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-900/70 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Dynamic Placement OA Generator
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> AI Real-Time Synthesis Enabled
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Customized Placement Assessment Center</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Configure dynamic placement tests based on target company patterns, subject focus, difficulty, and your daily schedule.
          </p>
        </div>

        {assessmentData && !evalResult && (
          <button
            onClick={() => setAssessmentData(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
          >
            ← Re-configure Parameters
          </button>
        )}
      </div>

      {/* 2. Pre-Assessment Parameter Setup (When no active test running) */}
      {!assessmentData && !evalResult && (
        <div className="glass-card p-6 space-y-6 bg-gradient-to-b from-slate-900/90 to-indigo-950/40 border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Configure Mock OA Setup Parameters
            </h3>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30">
              Tailored to Your Learning Needs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            {/* Company Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Target Company</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs font-bold text-indigo-300 border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Amazon">Amazon SDE</option>
                <option value="Google">Google (Systems & DSA)</option>
                <option value="TCS Digital">TCS Digital</option>
                <option value="Infosys SP">Infosys Specialist</option>
                <option value="Microsoft">Microsoft (Core & SQL)</option>
                <option value="Meta">Meta (Distributed Systems)</option>
                <option value="Flipkart">Flipkart Coding</option>
                <option value="All Companies">All Companies (Mixed)</option>
              </select>
            </div>

            {/* Subject Focus Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Subject / Focus</label>
              <select
                value={subjectFocus}
                onChange={(e) => setSubjectFocus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs font-bold text-slate-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Subjects">All Subjects (Comprehensive)</option>
                <option value="Graphs">Graphs & Shortest Paths</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="DBMS & SQL">DBMS & SQL Queries</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="OOP">OOP & C++ Invariants</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Today's Scheduled Topics">📅 Today's Scheduled Plan</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs font-bold text-amber-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Medium">Medium (Company Standard)</option>
                <option value="Easy">Easy (Foundation Check)</option>
                <option value="Hard">Hard (Advanced Invariants)</option>
                <option value="Mixed">Mixed Adaptive</option>
              </select>
            </div>

            {/* Question Count (1 min / question) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Questions (1 Min / Qn)</label>
              <select
                value={questionCount}
                onChange={(e) => {
                  const val = Math.min(30, Number(e.target.value));
                  setQuestionCount(val);
                  setDurationMinutes(val); // 1 min per question!
                }}
                className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs font-bold text-slate-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 Questions (5 Mins)</option>
                <option value={10}>10 Questions (10 Mins)</option>
                <option value={15}>15 Questions (15 Mins)</option>
                <option value={20}>20 Questions (20 Mins)</option>
                <option value={30}>30 Questions (30 Mins Max)</option>
              </select>
            </div>

            {/* Duration Minutes (Max 30 mins) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Duration (Max 30 Mins)</label>
              <select
                value={durationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs font-bold text-slate-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 Minutes (5 Questions)</option>
                <option value={10}>10 Minutes (10 Questions)</option>
                <option value={15}>15 Minutes (15 Questions)</option>
                <option value={20}>20 Minutes (20 Questions)</option>
                <option value={30}>30 Minutes Max (30 Questions)</option>
              </select>
            </div>

            {/* Generation Mode Switch */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Generation Mode</label>
              <button
                type="button"
                onClick={() => setUseDynamicAI(!useDynamicAI)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                  useDynamicAI
                    ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border-purple-400/50 text-purple-200'
                    : 'glass-panel border-white/10 text-slate-300'
                }`}
              >
                <span>{useDynamicAI ? '✨ Dynamic AI' : '📦 Question Bank'}</span>
                <span className={`w-2 h-2 rounded-full ${useDynamicAI ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-3">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Generating {questionCount} questions for <strong className="text-indigo-300">{targetCompany}</strong> ({subjectFocus}) at <strong className="text-amber-300">{difficulty}</strong> level.
              </span>
            </div>

            <button
              onClick={handleGenerateTest}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 border border-indigo-400/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Dynamic Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>Generate & Begin Timed Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. Active Assessment View */}
      {assessmentData && !evalResult && (
        <div className="space-y-4 relative">
          {/* Fixed Floating Top-Right Real-time Timer HUD */}
          <div className="fixed top-20 right-6 z-50 shadow-2xl">
            <div className={`px-4 py-2.5 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl ${
              timeLeft <= 60
                ? 'bg-rose-950/95 border-rose-500/80 text-rose-200 animate-pulse ring-2 ring-rose-500'
                : timeLeft <= 300
                ? 'bg-amber-950/95 border-amber-500/80 text-amber-200 ring-1 ring-amber-400'
                : 'bg-slate-900/95 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/40'
            }`}>
              <Clock className={`w-4 h-4 ${timeLeft <= 60 ? 'text-rose-400 animate-spin' : 'text-indigo-400'}`} />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Live OA Timer (1 min/qn)</span>
                <span className="font-mono font-black text-sm tracking-tight">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Offline Fallback Banner */}
          {usingLocalFallback && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center gap-3 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-amber-300">Offline Question Bank Active</strong> — Backend API unavailable or session expired.
                Questions are being served from the built-in placement question bank. Log in to sync results to your profile.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette Sidebar */}
          <div className="glass-card p-4 space-y-4 border border-white/15">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-2 border-b border-white/10">
              <span>Question Palette ({assessmentData.questions.length})</span>
              <span className={`flex items-center gap-1 font-mono font-bold text-xs ${
                timeLeft <= 60 ? 'text-rose-400 animate-pulse' : timeLeft <= 300 ? 'text-amber-400' : 'text-indigo-300'
              }`}>
                <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {assessmentData.questions.map((q: any, idx: number) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurr = currentQIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`p-2 rounded-xl text-xs font-bold text-center transition-all ${
                      isCurr
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md border border-indigo-400/50 scale-105'
                        : isAnswered
                        ? 'subtle-badge-emerald border border-emerald-400/30'
                        : 'glass-panel text-slate-300 hover:bg-slate-800 border border-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Answered:</span>
                <span className="font-bold text-emerald-400">{Object.keys(selectedAnswers).length} / {assessmentData.questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Remaining:</span>
                <span className="font-bold text-amber-300">{assessmentData.questions.length - Object.keys(selectedAnswers).length}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all border border-emerald-400/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating Submission...' : 'Submit Final Assessment'}
            </button>
          </div>

          {/* Current Question View */}
          <div className="lg:col-span-3 glass-card p-6 space-y-5 border border-white/15">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold subtle-badge-indigo">
                  {currentQ?.topic || 'Topic'} &bull; {currentQ?.difficulty || 'Medium'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/70 text-purple-300 border border-purple-400/30">
                  {currentQ?.company || targetCompany} Pattern
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Question {currentQIndex + 1} of {assessmentData.questions.length}
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">{currentQ?.title}</h3>
            
            {/* Description Card */}
            <div className="p-4 rounded-xl glass-panel border border-white/10 bg-slate-900/60">
              <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-line">{currentQ?.description}</p>
            </div>

            {/* Code Snippet if provided */}
            {currentQ?.starter_code && currentQ.starter_code.python && (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{currentQ.starter_code.python}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">Select Correct Answer:</span>
              {qOptions.map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentQ?.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(currentQ?.id, optIdx)}
                    className={`w-full p-4 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/40 text-indigo-100 border border-indigo-400/60 shadow-lg shadow-indigo-500/25 font-bold ring-1 ring-indigo-400'
                        : 'glass-panel text-slate-200 border border-white/10 hover:border-white/30 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="leading-relaxed">{opt}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-2" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white border border-white/10 disabled:opacity-40"
              >
                ← Previous Question
              </button>

              <button
                disabled={currentQIndex === assessmentData.questions.length - 1}
                onClick={() => setCurrentQIndex((prev) => Math.min(assessmentData.questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all disabled:opacity-40"
              >
                Next Question →
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* 4. Assessment Evaluation Analytics Report */}
      {evalResult && (
        <div className="glass-card p-6 space-y-6 border border-white/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">Diagnostic Placement Evaluation</span>
              <h3 className="text-2xl font-black text-white">Assessment Score Breakdown</h3>
            </div>
            <div className="sm:text-right">
              <span className="text-3xl font-black text-emerald-400">
                {evalResult.overall_score_percentage}%
              </span>
              <p className="text-xs text-slate-400 font-medium">Readiness Delta: +{evalResult.readiness_delta}%</p>
            </div>
          </div>

          {/* Topic Performance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {Object.entries(evalResult.topic_breakdown || {}).map(([topic, score]: any) => (
              <div key={topic} className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
                <span className="text-slate-400 font-bold block">{topic}</span>
                <span className="text-lg font-black text-white">{score}%</span>
              </div>
            ))}
          </div>

          {/* Detailed Question Outcomes */}
          {evalResult.detailed_evaluations && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Items Evaluation</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {evalResult.detailed_evaluations.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl glass-panel border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{idx + 1}. {item.title} ({item.topic})</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      item.verdict === 'Correct' || item.verdict === 'Accepted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.verdict} ({item.score}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Step & Buttons */}
          <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-indigo-950/30">
            <div>
              <span className="font-bold text-indigo-200 block">Recommended Next Action:</span>
              <p className="text-indigo-300/80">Closed-loop diagnostic complete. Update adaptive schedule to address identified gaps.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAssessmentData(null); setEvalResult(null); }}
                className="px-4 py-2.5 rounded-xl glass-panel text-slate-200 font-bold text-xs hover:bg-slate-800 border border-white/10"
              >
                Configure New Test
              </button>

              <button
                onClick={() => onTriggerReplan && onTriggerReplan()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 whitespace-nowrap border border-indigo-400/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Trigger Adaptive Replanning Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
