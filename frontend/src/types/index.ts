export interface StudentProfile {
  user_id?: number;
  name?: string;
  email?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  cgpa?: number;
  current_year?: string;
  current_semester?: string;
  skills?: string[];
  preferred_subjects?: string[];
  programming_languages?: string[];
  subjects_studied?: string[];
  strengths?: string[];
  weaknesses?: string[];
  placement_target?: string;
  target_role?: string;
  target_company?: string;
  preferred_job_type?: string;
  preparation_deadline_days?: number;
  available_hours_per_day?: number;
  preferred_learning_style?: string;
  learning_style?: string;
  user_requirements?: string;
  tech_familiarity?: Record<string, string>;
  resume_summary?: string;
  curriculum_summary?: string;
  readiness_score?: number | null;
}

export interface Competency {
  id: number;
  topic: string;
  mastery_score: number;
  concept_mastery: number;
  implementation_mastery: number;
  time_management_score: number;
  status: 'Mastered' | 'Proficient' | 'Needs Improvement' | 'Critical Weakness';
  last_assessed: string;
}

export interface ReadinessData {
  overall_readiness: number | null;
  breakdown: Record<string, number>;
  interpretation: string;
  target_readiness: number;
  gap: number | null;
}

export interface WeaknessItem {
  topic: string;
  overall_score: number;
  concept_mastery: number;
  implementation_mastery: number;
  time_management: number;
  primary_weakness: string;
  status: string;
  recommended_action: string;
}

export interface ScheduleBlock {
  time: string;
  topic: string;
  activity: string;
  type: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  company_tag?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

export interface AdaptivePlan {
  id?: number;
  version: number;
  plan_title: string;
  adaptation_reason: string;
  schedule_blocks: ScheduleBlock[];
  total_study_minutes_per_day?: number;
  target_deadline_days?: number;
  created_at?: string;
  observation?: string;
  decision?: string;
  action?: string;
  reason?: string;
  outcome?: string;
}

export interface CalendarSession {
  id: string;
  date: string;
  time_slot: string;
  topic: string;
  subtopic: string;
  session_type: 'MCQ Practice' | 'Output Questions' | 'Concept Revision' | 'Mock Assessment' | 'Code Practice';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_minutes: number;
  company_pattern: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
}

export interface StrategyRecord {
  id: string;
  strategy_name: string;
  topic: string;
  weakness_type: string;
  context: string;
  intervention_sequence: string[];
  average_before_score: number;
  average_after_score: number;
  average_improvement: number;
  sample_count: number;
  success_rate: number;
  effectiveness_rating: string;
}

export interface Question {
  id: string;
  topic: string;
  subtopic?: string;
  title: string;
  company?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_type: 'Technical MCQ' | 'Conceptual MCQ' | 'Output Prediction' | 'Code Tracing' | 'SQL Output' | 'Debugging' | string;
  distinction_tag?: 'Company Previous Pattern' | 'Company-Style Generated' | 'General Placement' | string;
  description: string;
  starter_code?: Record<string, string>;
  test_cases?: Array<{ input: any; expected: any }>;
  options?: string[];
  correct_option_index?: number;
  expected_output?: string;
  explanation?: string;
  code_snippet?: string;
}

export interface CodeExecutionResult {
  status: string;
  passed: number;
  total: number;
  runtime_ms: number;
  compile_error?: string;
  runtime_error?: string;
  output?: string;
  test_results?: Array<{
    test_case_index: number;
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
    runtime_ms?: number;
    error?: string;
  }>;
  flaw_detected?: string;
}

export interface AgentTrace {
  id?: number;
  step_number: number;
  session_id?: string;
  agent_name: string;
  observation: string;
  evidence: string[];
  decision: string;
  action: string;
  tool_called?: string;
  tool_result_summary?: string;
  memory_retrieved_summary?: string;
  confidence: number;
  outcome_summary?: string;
  next_agent?: string;
  timestamp?: string;
}

export interface BenchmarkResult {
  experiment_title: string;
  sample_size: number;
  duration_days: number;
  summary: {
    static_planner: {
      initial_score: number;
      final_score: number;
      improvement: string;
      improvement_value: number;
      repeated_errors: number;
      plan_adaptations: number;
      weakness_clearance_rate: string;
    };
    adaptive_planner: {
      initial_score: number;
      final_score: number;
      improvement: string;
      improvement_value: number;
      repeated_errors: number;
      plan_adaptations: number;
      weakness_clearance_rate: string;
    };
    delta_advantage: {
      extra_score_gain: string;
      error_reduction_pct: string;
      p_value: string;
    };
  };
  progression_timeline: Array<{
    week: string;
    static_score: number;
    adaptive_score: number;
  }>;
  individual_samples: Array<{
    student_id: string;
    static_init: number;
    static_final: number;
    adapt_init: number;
    adapt_final: number;
    adaptive_advantage: number;
  }>;
}

export interface AISuggestion {
  id: string;
  title: string;
  category: 'Company Pattern' | 'Weakness Target' | 'Schedule Replan' | 'Revision Priority';
  company_context?: string;
  description: string;
  evidence: string;
  recommended_actions: string[];
  priority: 'High' | 'Medium' | 'Low';
  action_label: string;
  action_target: string;
}
