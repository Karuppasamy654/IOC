const API_BASE = "http://localhost:8000/api";

export async function fetchProfile(userId: number = 1) {
  const res = await fetch(`${API_BASE}/student/profile?user_id=${userId}`);
  return res.json();
}

export async function updateProfile(data: any, userId: number = 1) {
  const res = await fetch(`${API_BASE}/student/profile?user_id=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchCompetencies(userId: number = 1) {
  const res = await fetch(`${API_BASE}/student/competencies?user_id=${userId}`);
  return res.json();
}

export async function fetchReadiness(userId: number = 1) {
  const res = await fetch(`${API_BASE}/student/readiness?user_id=${userId}`);
  return res.json();
}

export async function fetchWeaknesses(userId: number = 1) {
  const res = await fetch(`${API_BASE}/student/weaknesses?user_id=${userId}`);
  return res.json();
}

export async function fetchCurrentPlan(userId: number = 1) {
  const res = await fetch(`${API_BASE}/progress/plan?user_id=${userId}`);
  return res.json();
}

export async function fetchPlanHistory(userId: number = 1) {
  const res = await fetch(`${API_BASE}/progress/plans/history?user_id=${userId}`);
  return res.json();
}

export async function fetchStrategyEffectiveness() {
  const res = await fetch(`${API_BASE}/progress/strategies`);
  return res.json();
}

export async function fetchMistakes(userId: number = 1) {
  const res = await fetch(`${API_BASE}/progress/mistakes?user_id=${userId}`);
  return res.json();
}

export async function fetchAgentTraces(userId: number = 1) {
  const res = await fetch(`${API_BASE}/progress/traces?user_id=${userId}`);
  return res.json();
}

export async function fetchQuestions(topic?: string, questionType?: string) {
  let url = `${API_BASE}/learning/questions`;
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (questionType) params.append("question_type", questionType);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

export async function executeCode(code: string, language: string = "python", questionId: string = "dsa-graph-bfs-01") {
  const res = await fetch(`${API_BASE}/learning/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, question_id: questionId })
  });
  return res.json();
}

export async function searchResources(topic: string, weaknessType: string) {
  const res = await fetch(`${API_BASE}/learning/resources/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, weakness_type: weaknessType })
  });
  return res.json();
}

export async function triggerAgentCycle(params: any = {}) {
  const res = await fetch(`${API_BASE}/learning/trigger_agent_cycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function runBenchmarkExperiment(sampleSize: number = 50, days: number = 30) {
  const res = await fetch(`${API_BASE}/benchmark/run_experiment?sample_size=${sampleSize}&days=${days}`);
  return res.json();
}

export async function generateMockAssessment(durationMinutes: number = 45) {
  const res = await fetch(`${API_BASE}/assessment/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration_minutes: durationMinutes })
  });
  return res.json();
}

export async function submitMockAssessment(sessionId: string, submissions: any[]) {
  const res = await fetch(`${API_BASE}/assessment/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, submissions })
  });
  return res.json();
}
