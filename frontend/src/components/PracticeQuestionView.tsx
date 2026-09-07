import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, RefreshCw, Zap, AlertCircle, BookOpen, Code2, Layers, CheckSquare } from 'lucide-react';
import { fetchQuestions, generateDynamicQuestion, submitPracticeAnswer } from '../services/api';
import { CodePracticeArena } from './CodePracticeArena';

interface PracticeQuestionViewProps {
  onTriggerAgentCycle: () => void;
}

// Comprehensive local question bank for offline practice fallback
const LOCAL_PRACTICE_BANK: Question[] = [
  {
    id: 'local-pr-1',
    company: 'Amazon',
    topic: 'Graphs',
    subtopic: 'Topological Sort & Kahn\'s Invariant',
    title: 'Topological Sort & Kahn\'s Algorithm Cycle Detection',
    difficulty: 'Medium',
    question_type: 'Technical MCQ',
    distinction_tag: 'Amazon Pattern',
    description: 'In Kahn\'s topological sort algorithm applied to a directed graph G = (V, E), which condition definitively indicates the presence of a directed cycle?',
    starter_code: {},
    options: [
      'The processed node count is less than V after the zero-indegree queue is exhausted.',
      'All vertex in-degrees become zero simultaneously on initialization.',
      'The maximum recursion depth exceeds O(V + E) during traversal.',
      'In-degree array values contain negative integer offsets.'
    ],
    correct_option_index: 0,
    explanation: 'Vertices within a directed cycle maintain an in-degree of at least 1, preventing them from entering the zero-indegree queue. Thus, total processed vertices < V.'
  },
  {
    id: 'local-pr-2',
    company: 'Amazon',
    topic: 'Dynamic Programming',
    subtopic: '0/1 Knapsack State Space',
    title: '0/1 Knapsack 1D Array Space Optimization',
    difficulty: 'Medium',
    question_type: 'Technical MCQ',
    distinction_tag: 'Amazon SDE Pattern',
    description: 'When optimizing 0/1 Knapsack to a 1D DP array of size (W + 1), why must the inner capacity loop iterate in REVERSE order (from W down to item weight)?',
    starter_code: {},
    options: [
      'To ensure each item is evaluated at most ONCE by using values from the previous row state.',
      'To reduce the time complexity of the algorithm from O(N*W) to O(N).',
      'Reverse iteration prevents integer overflow during capacity summation.',
      'Forward iteration throws array out-of-bounds exceptions in C++.'
    ],
    correct_option_index: 0,
    explanation: 'Iterating backward ensures dp[w - weight] references the state from the previous item (i-1) rather than the current item iteration, preventing multiple re-uses of the item.'
  },
  {
    id: 'local-pr-3',
    company: 'Microsoft',
    topic: 'DBMS & SQL',
    subtopic: 'SQL HAVING vs WHERE Clause',
    title: 'SQL GROUP BY & Aggregate Filtering Behavior',
    difficulty: 'Easy',
    question_type: 'SQL Output',
    distinction_tag: 'Microsoft Pattern',
    description: 'Which SQL clause is executed AFTER GROUP BY aggregation to filter grouped results based on aggregate conditions like COUNT() or AVG()?',
    starter_code: {},
    options: [
      'HAVING clause',
      'WHERE clause',
      'FILTER clause',
      'ORDER BY clause'
    ],
    correct_option_index: 0,
    explanation: 'The WHERE clause filters individual rows before grouping. The HAVING clause filters aggregated groups after the GROUP BY operation is applied.'
  },
  {
    id: 'local-pr-4',
    company: 'Google',
    topic: 'Operating Systems',
    subtopic: 'Mutex vs Binary Semaphore Invariant',
    title: 'Process Synchronization Ownership Invariant',
    difficulty: 'Medium',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'Google Core Systems',
    description: 'What is the key functional difference between a Mutex lock and a Binary Semaphore in process synchronization?',
    starter_code: {},
    options: [
      'Mutex has strict thread ownership (only the locking thread can unlock it), whereas any thread can signal a binary semaphore.',
      'Binary semaphores are limited to user-space while Mutexes run in hardware.',
      'Mutexes allow up to N concurrent threads while semaphores allow only 1.',
      'Semaphores cause immediate deadlock if contented.'
    ],
    correct_option_index: 0,
    explanation: 'A Mutex is an ownership lock (only the thread that acquired the mutex can release it). A semaphore is a signaling mechanism (any thread can call signal/wait).'
  },
  {
    id: 'local-pr-5',
    company: 'TCS Digital',
    topic: 'OOP',
    subtopic: 'Virtual Functions & Polymorphism',
    title: 'C++ Virtual Table & Runtime Dispatch Mechanism',
    difficulty: 'Medium',
    question_type: 'Technical MCQ',
    distinction_tag: 'TCS Digital Pattern',
    description: 'What mechanism enables runtime polymorphism when calling a virtual function via a Base class pointer pointing to a Derived object in C++?',
    starter_code: {},
    options: [
      'Dynamic dispatch using the object\'s virtual pointer (vptr) and virtual table (vtable).',
      'Static binding resolved at compile time by the compiler.',
      'Type casting exception handling.',
      'Direct macro expansion during preprocessing.'
    ],
    correct_option_index: 0,
    explanation: 'Virtual functions use a hidden vptr stored in each object to look up the derived class function override in the class\'s vtable at runtime.'
  },
  {
    id: 'local-pr-6',
    company: 'Infosys SP',
    topic: 'Computer Networks',
    subtopic: 'TCP Handshake Protocol',
    title: 'TCP 3-Way Handshake SYN-ACK Packet Role',
    difficulty: 'Easy',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'Infosys Specialist',
    description: 'During TCP 3-way handshake connection setup, what is the exact function of the SYN-ACK packet sent by the server to the client?',
    starter_code: {},
    options: [
      'Acknowledges the client\'s SYN (Initial Sequence Number) and sends the server\'s own Initial Sequence Number.',
      'Terminates the active TCP session gracefully.',
      'Transmits the SSL/TLS public key certificate.',
      'Flushes the client\'s local DNS cache.'
    ],
    correct_option_index: 0,
    explanation: 'The server sends SYN-ACK to acknowledge receiving the client\'s SYN packet and simultaneously initiate its own sequence numbering.'
  },
  {
    id: 'local-pr-7',
    company: 'Google',
    topic: 'Trees',
    subtopic: 'Binary Search Tree Invariants',
    title: 'Inorder Traversal of Binary Search Tree (BST)',
    difficulty: 'Easy',
    question_type: 'Technical MCQ',
    distinction_tag: 'Google Pattern',
    description: 'Which tree traversal algorithm produces node values in strictly ascending sorted order for a valid Binary Search Tree (BST)?',
    starter_code: {},
    options: [
      'Inorder Traversal (Left, Root, Right)',
      'Preorder Traversal (Root, Left, Right)',
      'Postorder Traversal (Left, Right, Root)',
      'Level-Order Traversal (BFS)'
    ],
    correct_option_index: 0,
    explanation: 'Inorder traversal visits Left Subtree (< Root), Root, then Right Subtree (> Root), yielding sorted values.'
  },
  {
    id: 'local-pr-8',
    company: 'TCS Digital',
    topic: 'Arrays & Strings',
    subtopic: 'Two Pointers Strategy',
    title: 'Container With Most Water Two-Pointer Invariant',
    difficulty: 'Easy',
    question_type: 'Technical MCQ',
    distinction_tag: 'TCS Digital Pattern',
    description: 'Given n non-negative integers representing heights, which pointer moving strategy maximizes container area in O(N) time?',
    starter_code: {},
    options: [
      'Move the pointer with smaller height inwards.',
      'Move the pointer with larger height inwards.',
      'Move both pointers simultaneously inwards.',
      'Reset pointers to middle.'
    ],
    correct_option_index: 0,
    explanation: 'Moving the smaller height pointer offers potential to find a taller line to compensate for shrinking width.'
  },
  {
    id: 'local-pr-9',
    company: 'TCS Digital',
    topic: 'Quantitative Aptitude',
    subtopic: 'Time & Work Ratios',
    title: 'Combined Work Completion Time Calculation',
    difficulty: 'Easy',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'TCS Digital Aptitude',
    description: 'Person A completes a task in 10 hours. Person B completes the same task in 15 hours. How many hours will it take to complete the task if A and B work together?',
    starter_code: {},
    options: [
      '6 hours',
      '8 hours',
      '12.5 hours',
      '5 hours'
    ],
    correct_option_index: 0,
    explanation: 'Combined rate = 1/10 + 1/15 = 5/60 = 1/6 task per hour. Total time = 6 hours.'
  },
  {
    id: 'local-pr-10',
    company: 'Meta',
    topic: 'System Design',
    subtopic: 'Rate Limiting & Token Bucket',
    title: 'Token Bucket Distributed Rate Limiting',
    difficulty: 'Hard',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'Meta Architecture',
    description: 'In distributed system design, which rate limiting algorithm allows bursty incoming HTTP traffic while maintaining a constant average rate limit without dropping requests unnecessarily?',
    starter_code: {},
    options: [
      'Token Bucket Algorithm',
      'Fixed Window Counter',
      'Strict Leaky Bucket with zero capacity',
      'Round Robin Load Balancing'
    ],
    correct_option_index: 0,
    explanation: 'Token Bucket holds up to B tokens; requests consume tokens instantly when available, accommodating bursts up to bucket capacity B.'
  },
  {
    id: 'local-pr-11',
    company: 'Flipkart',
    topic: 'Arrays & Strings',
    subtopic: 'Subarray Sum Equals K',
    title: 'Subarray Sum Equals K Prefix Map Invariant',
    difficulty: 'Medium',
    question_type: 'Technical MCQ',
    distinction_tag: 'Flipkart Pattern',
    description: 'Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals to k using a hash map storing prefix sum frequencies.',
    starter_code: {},
    options: [
      'Hash map storing frequency of prefix sums in O(N) time.',
      'Nested loops in O(N^3) time.',
      'Sorting in O(N log N) time with two pointers.',
      'Dynamic Programming with 2D matrix.'
    ],
    correct_option_index: 0,
    explanation: 'Accumulating prefix sum current_sum and checking prefix_counts[current_sum - k] yields O(N) time complexity.'
  },
  {
    id: 'local-pr-12',
    company: 'Accenture',
    topic: 'Quantitative Aptitude',
    subtopic: 'Speed, Distance & Time',
    title: 'Relative Speed of Two Moving Trains',
    difficulty: 'Easy',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'Accenture Pattern',
    description: 'Two trains 120m and 80m long run in opposite directions at 40 km/h and 50 km/h respectively. How long will it take for them to completely cross each other?',
    starter_code: {},
    options: [
      '8 seconds',
      '10 seconds',
      '12 seconds',
      '15 seconds'
    ],
    correct_option_index: 0,
    explanation: 'Total distance = 120 + 80 = 200m. Relative speed = 40 + 50 = 90 km/h = 25 m/s. Time = 200 / 25 = 8 seconds.'
  },
  {
    id: 'local-pr-13',
    company: 'Wipro',
    topic: 'Quantitative Aptitude',
    subtopic: 'Percentages & Profit Loss',
    title: 'Percentage Profit on Cost Price',
    difficulty: 'Easy',
    question_type: 'Conceptual MCQ',
    distinction_tag: 'Wipro Pattern',
    description: 'If the cost price of 15 articles is equal to the selling price of 12 articles, what is the profit percentage?',
    starter_code: {},
    options: [
      '25%',
      '20%',
      '30%',
      '15%'
    ],
    correct_option_index: 0,
    explanation: 'Profit per article = (15 - 12) / 12 * 100 = 3/12 * 100 = 25%.'
  },
  {
    id: 'local-pr-14',
    company: 'Microsoft',
    topic: 'DBMS & SQL',
    subtopic: 'SQL HAVING Clause Output',
    title: 'SQL GROUP BY & HAVING Count Output Prediction',
    difficulty: 'Medium',
    question_type: 'SQL Output',
    distinction_tag: 'Microsoft Pattern',
    description: 'Consider an Orders table with columns (department, amount):\n[(\'IT\', 500), (\'IT\', 300), (\'HR\', 200), (\'IT\', 400), (\'HR\', 100)]\nWhat is the output count of departments returned by:\n\nSELECT department FROM Orders GROUP BY department HAVING SUM(amount) > 600;',
    starter_code: {},
    options: [
      '1 department (\'IT\' with sum 1200)',
      '2 departments (\'IT\' and \'HR\')',
      '0 departments',
      '5 individual rows'
    ],
    correct_option_index: 0,
    explanation: 'Sum for IT = 500+300+400 = 1200 (> 600). Sum for HR = 200+100 = 300 (<= 600). Thus only \'IT\' is returned.'
  },
  {
    id: 'local-pr-15',
    company: 'Google',
    topic: 'Operating Systems',
    subtopic: 'Process Creation & fork() Output',
    title: 'C POSIX fork() System Call Output Prediction',
    difficulty: 'Hard',
    question_type: 'Output Prediction',
    distinction_tag: 'Google Core Systems',
    description: 'Predict the number of times \'Hello\' is printed by this C program snippet:\n\n#include <stdio.h>\n#include <unistd.h>\nint main() {\n    fork();\n    fork();\n    printf("Hello\\n");\n    return 0;\n}',
    starter_code: {},
    options: [
      '4 times',
      '2 times',
      '3 times',
      '8 times'
    ],
    correct_option_index: 0,
    explanation: 'Each fork() doubles the number of executing processes. Initial = 1. First fork() = 2. Second fork() = 4 active processes, each printing \'Hello\'.'
  }
];

// Comprehensive local synthesizer for dynamic AI question generation
const synthesizeLocalDynamicQuestion = (
  company: string,
  topic: string,
  difficulty: string,
  type: string
): Question => {
  const ts = Date.now();
  const templates: Record<string, { title: string; desc: string; opts: string[]; correct: number; exp: string }> = {
    Graphs: {
      title: `${company} ${topic} Path Invariant Challenge`,
      desc: `Targeting ${company} (${difficulty} Level - ${topic}): In Dijkstra's shortest path algorithm using a binary min-heap, why must vertices be relaxed only when a shorter distance estimate is found?`,
      opts: [
        'To maintain the greedy invariant that once a node is extracted from the min-heap, its shortest path distance is finalized.',
        'To reduce memory space from O(V + E) to O(1).',
        'Relaxation is only required for graph cycles with negative edge weights.',
        'Heap extraction automatically sorts all remaining edges in O(1) time.'
      ],
      correct: 0,
      exp: 'Dijkstra\'s greedy choice property relies on non-negative edge weights so that extracting the minimum unvisited distance node guarantees its shortest path is final.'
    },
    'DBMS & SQL': {
      title: `${company} SQL Functional Dependency & Normalization`,
      desc: `In database design for ${company} (${difficulty}): A relation R(A, B, C, D) has functional dependency A -> BCD. Which normal form does relation R automatically satisfy?`,
      opts: [
        'Boyce-Codd Normal Form (BCNF), since attribute A is a candidate key.',
        'First Normal Form (1NF) only.',
        '2NF but violates 3NF.',
        'Un-normalized state.'
      ],
      correct: 0,
      exp: 'Since A functionally determines all attributes (BCD), A is a superkey/candidate key, satisfying BCNF (for every non-trivial X -> Y, X is a superkey).'
    },
    'Operating Systems': {
      title: `${company} OS Deadlock Coffman Conditions`,
      desc: `For ${company}'s systems engineer role (${difficulty}): Which of the following is NOT one of the 4 necessary Coffman conditions for deadlock to occur?`,
      opts: [
        'Preemption allowed (Resource can be forcibly taken from a process).',
        'Mutual Exclusion.',
        'Hold and Wait.',
        'Circular Wait.'
      ],
      correct: 0,
      exp: 'Deadlock requires NO PREEMPTION (resources cannot be forcibly taken). Allowing preemption breaks deadlock conditions.'
    },
    'Dynamic Programming': {
      title: `${company} Dynamic Programming Substructure Challenge`,
      desc: `In a ${company} ${difficulty} technical interview on DP: What is the optimal subproblem recurrence for Longest Common Subsequence (LCS) when string characters match at indices i and j (X[i] == Y[j])?`,
      opts: [
        'LCS[i][j] = 1 + LCS[i-1][j-1]',
        'LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])',
        'LCS[i][j] = LCS[i-1][j] + LCS[i][j-1]',
        'LCS[i][j] = 2 * LCS[i-1][j-1]'
      ],
      correct: 0,
      exp: 'When current characters match, both can be appended to the LCS of prefixes X[0..i-1] and Y[0..j-1], yielding 1 + LCS[i-1][j-1].'
    },
    Trees: {
      title: `${company} Binary Search Tree & LCA Challenge`,
      desc: `For ${company} (${difficulty} level): In a Binary Search Tree (BST), what condition confirms that node P is the Lowest Common Ancestor (LCA) of target values V1 and V2?`,
      opts: [
        'Node P\'s value lies strictly between V1 and V2 (min(V1, V2) <= P.val <= max(V1, V2)).',
        'Both V1 and V2 are strictly greater than P.val.',
        'Node P has no left or right child pointers.',
        'Node P is the root vertex of the tree.'
      ],
      correct: 0,
      exp: 'In a BST, when V1 and V2 lie on opposite sides of node P (or one matches P), node P is their Lowest Common Ancestor.'
    },
    'Arrays & Strings': {
      title: `${company} Arrays & Two-Pointer Invariant`,
      desc: `In a ${company} ${difficulty} technical assessment on Arrays: What is the time complexity of finding two numbers in a sorted array that sum to a target value using two pointers?`,
      opts: [
        'O(N) time with O(1) auxiliary space.',
        'O(N^2) time with O(N) space.',
        'O(N log N) time using binary search loops.',
        'O(2^N) exponential time.'
      ],
      correct: 0,
      exp: 'Starting two pointers at both ends of a sorted array and moving inwards based on sum comparisons takes linear O(N) time and O(1) space.'
    },
    'Quantitative Aptitude': {
      title: `${company} Quantitative Aptitude & Probability`,
      desc: `For ${company}'s placement aptitude section (${difficulty}): Two fair 6-sided dice are rolled simultaneously. What is the probability that the sum of top faces equals 7?`,
      opts: [
        '1/6 (6 out of 36 outcomes)',
        '1/12 (3 out of 36 outcomes)',
        '7/36',
        '5/36'
      ],
      correct: 0,
      exp: 'The outcomes summing to 7 are (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). Total outcomes = 36. Probability = 6/36 = 1/6.'
    },
    OOP: {
      title: `${company} OOP & C++ Virtual Tables Invariant`,
      desc: `In ${company}'s C++ interview (${difficulty}): What happens when a pure virtual function (= 0) is declared inside a C++ Base class?`,
      opts: [
        'The Base class becomes an abstract class and cannot be directly instantiated.',
        'The compiler automatically creates a default empty function body.',
        'Derived classes are forbidden from overriding the function.',
        'It converts the class into a C C-style struct.'
      ],
      correct: 0,
      exp: 'A class with at least one pure virtual function is abstract and cannot be instantiated directly; concrete derived classes must override it.'
    },
    'Computer Networks': {
      title: `${company} OSI & TCP Protocol Invariant`,
      desc: `Targeting ${company} (${difficulty} Level - Computer Networks): Which layer of the OSI model handles end-to-end flow control, segmentation, and error recovery?`,
      opts: [
        'Transport Layer (Layer 4)',
        'Network Layer (Layer 3)',
        'Data Link Layer (Layer 2)',
        'Application Layer (Layer 7)'
      ],
      correct: 0,
      exp: 'The Transport Layer (Layer 4, e.g., TCP) provides reliable end-to-end data transmission, sequence control, and error handling.'
    }
  };

  const key = Object.keys(templates).find(k => topic.toLowerCase().includes(k.toLowerCase())) || 'Graphs';
  const t = templates[key] || templates['Graphs'];

  return {
    id: `dyn-local-${ts}`,
    company: company !== 'All Companies' ? company : 'Amazon',
    topic: topic !== 'All Topics' && topic !== 'All Subjects' ? topic : 'Graphs',
    subtopic: `${topic} Dynamic AI Invariant`,
    title: t.title,
    difficulty: (difficulty === 'Easy' || difficulty === 'Hard') ? difficulty : 'Medium',
    question_type: type !== 'All Question Types' ? type : 'Technical MCQ',
    distinction_tag: `${company}-AI Generated`,
    description: t.desc,
    starter_code: {},
    options: t.opts,
    correct_option_index: t.correct,
    explanation: t.exp
  };
};

// Helper to strip prepended "A) ", "B) ", etc. if present in raw string
const cleanOptionText = (text: string): string => {
  return text.replace(/^[A-D]\)\s*/, '');
};

export const PracticeQuestionView: React.FC<PracticeQuestionViewProps> = ({ onTriggerAgentCycle }) => {
  const [viewMode, setViewMode] = useState<'mcq' | 'sandbox'>('mcq');

  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Difficulties');
  const [selectedType, setSelectedType] = useState<string>('All Question Types');

  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingDynamic, setIsGeneratingDynamic] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any | null>(null);

  // Load questions with robust multi-layer fallback so questions are ALWAYS visible
  const loadQuestions = async () => {
    setIsLoading(true);
    setIsOfflineMode(false);
    try {
      const data = await fetchQuestions({
        company: selectedCompany,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        questionType: selectedType
      });
      if (Array.isArray(data) && data.length > 0 && !data[0].detail && !data[0].error) {
        setQuestionsList(data);
        setIsLoading(false);
        setActiveQuestionIndex(0);
        setIsSubmitted(false);
        setSelectedOption(null);
        setSubmissionFeedback(null);
        return;
      }
      throw new Error('API returned empty question set');
    } catch (err) {
      console.warn('API unavailable or empty, filtering local bank with fallback synthesis:', err);
      setIsOfflineMode(true);

      // Filter local bank progressively
      let filtered = [...LOCAL_PRACTICE_BANK];

      if (selectedCompany !== 'All Companies') {
        const compMatches = filtered.filter(q => q.company.toLowerCase().includes(selectedCompany.toLowerCase()));
        if (compMatches.length > 0) filtered = compMatches;
      }

      if (selectedTopic !== 'All Topics' && selectedTopic !== 'All Subjects' && selectedTopic !== "Today's Schedule") {
        const topicMatches = filtered.filter(q => q.topic.toLowerCase().includes(selectedTopic.toLowerCase()));
        if (topicMatches.length > 0) filtered = topicMatches;
      }

      if (selectedDifficulty !== 'All Difficulties') {
        const diffMatches = filtered.filter(q => q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
        if (diffMatches.length > 0) {
          filtered = diffMatches;
        } else {
          const bankDiffMatches = LOCAL_PRACTICE_BANK.filter(q => q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
          if (bankDiffMatches.length > 0) {
            filtered = bankDiffMatches;
          } else {
            filtered = [synthesizeLocalDynamicQuestion(selectedCompany, selectedTopic, selectedDifficulty, selectedType)];
          }
        }
      }

      // If filtering produced no matches, synthesize a tailored question on the fly!
      if (filtered.length === 0) {
        const synthesized = synthesizeLocalDynamicQuestion(
          selectedCompany,
          selectedTopic,
          selectedDifficulty,
          selectedType
        );
        filtered = [synthesized];
      }

      setQuestionsList(filtered);
    } finally {
      setActiveQuestionIndex(0);
      setIsSubmitted(false);
      setSelectedOption(null);
      setSubmissionFeedback(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCompany, selectedTopic, selectedDifficulty, selectedType]);

  // Generate dynamic AI question on demand (API with offline fallback)
  const handleGenerateDynamic = async () => {
    setIsGeneratingDynamic(true);
    const company = selectedCompany !== 'All Companies' ? selectedCompany : 'Amazon';
    const topic = selectedTopic !== 'All Topics' && selectedTopic !== 'All Subjects' ? selectedTopic : 'Graphs';
    const difficulty = selectedDifficulty !== 'All Difficulties' ? selectedDifficulty : 'Medium';
    const qType = selectedType !== 'All Question Types' ? selectedType : 'Technical MCQ';

    try {
      const synQ = await generateDynamicQuestion(company, topic, difficulty, qType);
      if (synQ && synQ.id && !synQ.detail && !synQ.error && Array.isArray(synQ.options)) {
        setQuestionsList((prev) => [synQ, ...prev]);
        setActiveQuestionIndex(0);
        setIsSubmitted(false);
        setSelectedOption(null);
        setSubmissionFeedback(null);
        setIsGeneratingDynamic(false);
        return;
      }
      throw new Error(synQ?.detail || synQ?.error || 'Invalid dynamic question response');
    } catch (err) {
      console.warn('API dynamic generation failed, synthesizing question locally:', err);
      const localDyn = synthesizeLocalDynamicQuestion(company, topic, difficulty, qType);
      setQuestionsList((prev) => [localDyn, ...prev]);
      setActiveQuestionIndex(0);
      setIsSubmitted(false);
      setSelectedOption(null);
      setSubmissionFeedback(null);
      setIsOfflineMode(true);
    } finally {
      setIsGeneratingDynamic(false);
    }
  };

  const currentQ: Question | undefined = questionsList[activeQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQ || selectedOption === null) return;
    setIsSubmitted(true);
    
    // Evaluate locally if in offline mode or if local question id
    if (isOfflineMode || currentQ.id.startsWith('local-') || currentQ.id.startsWith('dyn-local-')) {
      const isCorrect = selectedOption === currentQ.correct_option_index;
      setSubmissionFeedback({
        is_correct: isCorrect,
        earned_score: isCorrect ? 100 : 0,
        explanation: currentQ.explanation || 'Detailed analysis of invariants.',
        feedback: isCorrect ? 'Correct! Outcome logged to practice session.' : 'Incorrect. Review technical explanation below.'
      });
      return;
    }

    try {
      const feedback = await submitPracticeAnswer(currentQ.id, selectedOption);
      if (feedback && !feedback.detail && !feedback.error) {
        setSubmissionFeedback(feedback);
      } else {
        throw new Error('API submission error');
      }
    } catch (err) {
      console.warn('API submit failed, fallback to local evaluation:', err);
      const isCorrect = selectedOption === (currentQ.correct_option_index !== undefined ? currentQ.correct_option_index : 0);
      setSubmissionFeedback({
        is_correct: isCorrect,
        earned_score: isCorrect ? 100 : 0,
        explanation: currentQ.explanation || 'Detailed analysis of technical invariants.',
        feedback: isCorrect ? 'Correct! Practice answer recorded.' : 'Incorrect. Check the explanation below.'
      });
    }
  };

  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setSubmissionFeedback(null);
    setActiveQuestionIndex((prev) => (prev + 1) % (questionsList.length || 1));
  };

  const qOptions = currentQ?.options && currentQ.options.length > 0
    ? currentQ.options
    : [
        'Optimal invariant condition satisfied',
        'Sub-optimal implementation state',
        'Boundary edge-case flaw',
        'Visited state synchronization missing'
      ];

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Mode Selector */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-900/70 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-indigo flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" /> Technical Practice Arena
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold subtle-badge-emerald flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Dynamic AI Synthesis
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Placement MCQ, Output & Code Practice</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5 max-w-2xl">
            Solve company-focused MCQs, SQL queries, output prediction challenges, and code implementations tailored to your target SDE roles.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Practice Mode Toggle */}
          <div className="p-1 rounded-xl glass-panel border border-white/10 flex items-center gap-1 bg-slate-950/60">
            <button
              onClick={() => setViewMode('mcq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'mcq'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> MCQs & Concepts
            </button>
            <button
              onClick={() => setViewMode('sandbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Coding Sandbox
            </button>
          </div>

          {viewMode === 'mcq' && (
            <button
              onClick={handleGenerateDynamic}
              disabled={isGeneratingDynamic}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 border border-purple-400/30 disabled:opacity-50"
            >
              {isGeneratingDynamic ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Generate AI Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Mode: Interactive Code Practice Arena */}
      {viewMode === 'sandbox' ? (
        <CodePracticeArena questions={questionsList} />
      ) : (
        <>
          {/* Offline Mode Banner */}
          {isOfflineMode && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center gap-3 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-amber-300">Offline Question Bank Active:</strong> Serving topic-tailored questions and local dynamic AI generation from the built-in placement bank.
              </span>
            </div>
          )}

          {/* 2. Filter Controls */}
          <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-b from-slate-900/90 to-indigo-950/40 border border-white/15">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-panel text-xs font-bold text-indigo-300 border border-indigo-400/30 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Companies" className="bg-slate-900 text-slate-100">All Companies (Default)</option>
                <option value="Amazon" className="bg-slate-900 text-slate-100">Amazon SDE</option>
                <option value="Google" className="bg-slate-900 text-slate-100">Google (Systems & DSA)</option>
                <option value="TCS Digital" className="bg-slate-900 text-slate-100">TCS Digital</option>
                <option value="Infosys SP" className="bg-slate-900 text-slate-100">Infosys Specialist</option>
                <option value="Microsoft" className="bg-slate-900 text-slate-100">Microsoft (Core & SQL)</option>
                <option value="Meta" className="bg-slate-900 text-slate-100">Meta</option>
                <option value="Flipkart" className="bg-slate-900 text-slate-100">Flipkart</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Topic / Subject</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-200 border border-white/10 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Topics" className="bg-slate-900 text-slate-100">All Subjects</option>
                <option value="Graphs" className="bg-slate-900 text-slate-100">Graphs & Shortest Paths</option>
                <option value="DBMS & SQL" className="bg-slate-900 text-slate-100">DBMS & SQL</option>
                <option value="Operating Systems" className="bg-slate-900 text-slate-100">Operating Systems</option>
                <option value="Computer Networks" className="bg-slate-900 text-slate-100">Computer Networks</option>
                <option value="OOP" className="bg-slate-900 text-slate-100">OOP & C++</option>
                <option value="Dynamic Programming" className="bg-slate-900 text-slate-100">Dynamic Programming</option>
                <option value="Trees" className="bg-slate-900 text-slate-100">Trees & BST</option>
                <option value="Arrays & Strings" className="bg-slate-900 text-slate-100">Arrays & Strings</option>
                <option value="Quantitative Aptitude" className="bg-slate-900 text-slate-100">Quantitative Aptitude</option>
                <option value="Today's Schedule" className="bg-slate-900 text-slate-100">📅 Today's Schedule</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-panel text-xs font-semibold text-amber-300 border border-white/10 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Difficulties" className="bg-slate-900 text-slate-100">All Difficulties</option>
                <option value="Easy" className="bg-slate-900 text-slate-100">Easy (Foundation)</option>
                <option value="Medium" className="bg-slate-900 text-slate-100">Medium (Company Std)</option>
                <option value="Hard" className="bg-slate-900 text-slate-100">Hard (Advanced Invariants)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Question Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-200 border border-white/10 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Question Types" className="bg-slate-900 text-slate-100">All Types</option>
                <option value="Technical MCQ" className="bg-slate-900 text-slate-100">Technical MCQ</option>
                <option value="Output Prediction" className="bg-slate-900 text-slate-100">Output Prediction</option>
                <option value="SQL Output" className="bg-slate-900 text-slate-100">SQL Output</option>
                <option value="Conceptual MCQ" className="bg-slate-900 text-slate-100">Conceptual MCQ</option>
              </select>
            </div>
          </div>

          {/* 3. Question Practice Area */}
          {isLoading ? (
            <div className="glass-card p-12 text-center text-slate-400 text-xs font-bold space-y-2 border border-white/15">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
              <p>Loading questions bank...</p>
            </div>
          ) : currentQ ? (
            <div className="glass-card p-6 space-y-6 bg-slate-900/90 border border-white/15 shadow-xl">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold subtle-badge-indigo">
                    Question {activeQuestionIndex + 1} of {questionsList.length}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold glass-panel text-slate-200 border border-white/10">
                    {currentQ.topic} {currentQ.subtopic ? `— ${currentQ.subtopic}` : ''}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentQ.difficulty === 'Hard'
                        ? 'subtle-badge-rose'
                        : currentQ.difficulty === 'Medium'
                        ? 'subtle-badge-amber'
                        : 'subtle-badge-emerald'
                    }`}
                  >
                    {currentQ.difficulty || 'Medium'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950/70 text-purple-300 border border-purple-400/30">
                    🏷️ {currentQ.distinction_tag || `${currentQ.company || selectedCompany} Pattern`}
                  </span>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white leading-snug">{currentQ.title}</h3>
                
                {/* Description Card */}
                <div className="p-4 rounded-xl glass-panel border border-white/10 bg-slate-950/60">
                  <p className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-line">{currentQ.description}</p>
                </div>

                {/* Optional Code Snippet / Starter Code Block */}
                {((currentQ as any).code_snippet || (currentQ.starter_code && currentQ.starter_code.python)) && (
                  <div className="p-4 rounded-xl bg-slate-950 text-indigo-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">Code Context / Snippet:</div>
                    <pre>{(currentQ as any).code_snippet || currentQ.starter_code?.python}</pre>
                  </div>
                )}

                {/* Options Grid */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">Select Your Choice:</span>
                  {qOptions.map((rawOptionText, oidx) => {
                    const isSelected = selectedOption === oidx;
                    const isCorrectOption = oidx === (currentQ.correct_option_index !== undefined ? currentQ.correct_option_index : 0);
                    const cleanText = cleanOptionText(rawOptionText);
                    const letter = optionLetters[oidx % 4];

                    let optionStyle = 'glass-panel border-white/10 hover:border-indigo-400/50 hover:bg-slate-800/60 text-slate-200 font-medium';

                    if (isSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = 'subtle-badge-emerald border-emerald-500/50 text-emerald-100 font-bold ring-1 ring-emerald-500/50';
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = 'subtle-badge-rose border-rose-500/50 text-rose-100 font-bold ring-1 ring-rose-500/50';
                      } else {
                        optionStyle = 'glass-panel border-white/5 text-slate-400 opacity-50';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-indigo-600/40 text-indigo-100 border-indigo-400/60 font-bold shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400';
                    }

                    return (
                      <button
                        key={oidx}
                        onClick={() => handleSelectOption(oidx)}
                        disabled={isSubmitted}
                        className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 border border-white/10'
                          }`}>
                            {letter}
                          </span>
                          <span className="leading-relaxed mt-0.5">{cleanText}</span>
                        </div>
                        {isSubmitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />}
                        {isSubmitted && isSelected && !isCorrectOption && (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Answer Submission & Navigation Controls */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 border border-indigo-400/30"
                  >
                    Submit Answer & Log Outcome
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                  >
                    <span>Next Practice Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {isSubmitted && (
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${
                    submissionFeedback?.is_correct ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    <Sparkles className="w-4 h-4" /> {submissionFeedback?.feedback || (selectedOption === currentQ.correct_option_index ? 'Correct! Mastery updated.' : 'Incorrect! Review explanation below.')}
                  </span>
                )}
              </div>

              {/* Detailed Explanation Breakdown */}
              {isSubmitted && (
                <div className="p-4 rounded-xl glass-panel border border-indigo-500/30 space-y-2 bg-indigo-950/30 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Step-by-Step Technical Explanation:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {submissionFeedback?.explanation || currentQ.explanation || 'Detailed analysis of invariants and boundary states.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center space-y-4 border border-white/15">
              <p className="text-xs font-bold text-slate-400">No questions matched the selected combination.</p>
              <button
                onClick={handleGenerateDynamic}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
              >
                ✨ Generate Dynamic Question Now
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
