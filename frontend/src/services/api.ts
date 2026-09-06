const API_BASE = "http://localhost:8000/api";

export function getToken(): string | null {
  return localStorage.getItem("placement_evolve_token");
}

export function setToken(token: string) {
  localStorage.setItem("placement_evolve_token", token);
}

export function removeToken() {
  localStorage.removeItem("placement_evolve_token");
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // If unauthorized, token might be invalid/expired
  }
  return res;
}

export async function loginUser(data: any) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  const result = await res.json();
  if (result.access_token) {
    setToken(result.access_token);
  }
  return result;
}

export async function registerUser(data: any) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  const result = await res.json();
  if (result.access_token) {
    setToken(result.access_token);
  }
  return result;
}

export async function getCurrentUser() {
  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchProfile() {
  const res = await authFetch(`${API_BASE}/student/profile`);
  return res.json();
}

export async function updateProfile(data: any) {
  const res = await authFetch(`${API_BASE}/student/profile`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchCompetencies() {
  const res = await authFetch(`${API_BASE}/student/competencies`);
  return res.json();
}

export async function fetchReadiness() {
  const res = await authFetch(`${API_BASE}/student/readiness`);
  return res.json();
}

export async function fetchWeaknesses() {
  const res = await authFetch(`${API_BASE}/student/weaknesses`);
  return res.json();
}

export async function fetchCurrentPlan() {
  const res = await authFetch(`${API_BASE}/progress/plan`);
  return res.json();
}

export async function fetchPlanHistory() {
  const res = await authFetch(`${API_BASE}/progress/plans/history`);
  return res.json();
}

export async function fetchStrategyEffectiveness() {
  const res = await authFetch(`${API_BASE}/progress/strategies`);
  return res.json();
}

export async function fetchMistakes() {
  const res = await authFetch(`${API_BASE}/progress/mistakes`);
  return res.json();
}

export async function fetchAgentTraces() {
  const res = await authFetch(`${API_BASE}/progress/traces`);
  return res.json();
}

export async function fetchQuestions(filters?: {
  company?: string;
  topic?: string;
  difficulty?: string;
  questionType?: string;
  search?: string;
}) {
  let url = `${API_BASE}/learning/questions`;
  const params = new URLSearchParams();
  if (filters?.company && filters.company !== 'All Companies') params.append("company", filters.company);
  if (filters?.topic && filters.topic !== 'All Topics' && filters.topic !== 'All Subjects') params.append("topic", filters.topic);
  if (filters?.difficulty && filters.difficulty !== 'All Difficulties') params.append("difficulty", filters.difficulty);
  if (filters?.questionType && filters.questionType !== 'All Question Types' && filters.questionType !== 'All Types') params.append("question_type", filters.questionType);
  if (filters?.search) params.append("search", filters.search);

  if (params.toString()) url += `?${params.toString()}`;
  const res = await authFetch(url);
  return res.json();
}

export async function submitPracticeAnswer(questionId: string, selectedOptionIndex?: number | null, submittedCode?: string) {
  const res = await authFetch(`${API_BASE}/learning/practice/submit`, {
    method: "POST",
    body: JSON.stringify({
      question_id: questionId,
      selected_option_index: selectedOptionIndex,
      submitted_code: submittedCode
    })
  });
  return res.json();
}

export async function fetchSuggestions() {
  const res = await authFetch(`${API_BASE}/learning/suggestions`);
  return res.json();
}

export async function executeCode(code: string, language: string = "python", questionId: string = "dsa-graph-bfs-01") {
  const res = await authFetch(`${API_BASE}/learning/execute`, {
    method: "POST",
    body: JSON.stringify({ code, language, question_id: questionId })
  });
  return res.json();
}

export async function searchResources(topic: string, weaknessType: string) {
  const res = await authFetch(`${API_BASE}/learning/resources/search`, {
    method: "POST",
    body: JSON.stringify({ topic, weakness_type: weaknessType })
  });
  return res.json();
}

export async function triggerAgentCycle(params: any = {}) {
  const res = await authFetch(`${API_BASE}/learning/trigger_agent_cycle`, {
    method: "POST",
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function runBenchmarkExperiment(sampleSize: number = 50, days: number = 30) {
  const res = await authFetch(`${API_BASE}/benchmark/run_experiment?sample_size=${sampleSize}&days=${days}`);
  return res.json();
}

export async function generateMockAssessment(durationMinutes: number = 30, targetCompany?: string, targetRole?: string) {
  const res = await authFetch(`${API_BASE}/assessment/generate`, {
    method: "POST",
    body: JSON.stringify({
      duration_minutes: durationMinutes,
      target_company: targetCompany || "Amazon",
      target_role: targetRole || "Software Development Engineer (SDE)"
    })
  });
  return res.json();
}

export async function submitMockAssessment(sessionId: string, submissions: any[]) {
  const res = await authFetch(`${API_BASE}/assessment/submit`, {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, submissions })
  });
  return res.json();
}
