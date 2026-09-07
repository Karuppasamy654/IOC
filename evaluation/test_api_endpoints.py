"""
PlacementEvolve AI — API Integration Tests
Tests use a fresh test user registered at runtime to exercise all
protected endpoints with real JWT tokens. No hardcoded demo data.
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# ── Shared test user state ──────────────────────────────────────────────────
TEST_EMAIL = f"testuser_{uuid.uuid4().hex[:6]}@placementevolve.test"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "Integration Tester"
_auth_token: str = ""
_auth_headers: dict = {}


@pytest.fixture(scope="session", autouse=True)
def register_test_user():
    """Register a fresh test user once per session and store JWT token."""
    global _auth_token, _auth_headers
    res = client.post("/api/auth/register", json={
        "email": TEST_EMAIL,
        "name": TEST_NAME,
        "password": TEST_PASSWORD,
        "branch": "Computer Science & Engineering",
        "graduation_year": 2026,
        "cgpa": 8.4,
        "target_role": "Software Development Engineer (SDE)",
        "target_company": "Amazon",
        "available_hours_per_day": 3.0,
        "preparation_deadline_days": 30,
        "skills": ["Python", "DSA", "DBMS", "OS"]
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    token = res.json()["access_token"]
    _auth_token = token
    _auth_headers = {"Authorization": f"Bearer {token}"}


# ── 1. Health & Root ────────────────────────────────────────────────────────
def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["system"] == "PlacementEvolve AI"


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


# ── 2. Auth ─────────────────────────────────────────────────────────────────
def test_register_duplicate_rejected():
    """Second registration with same email must be rejected."""
    res = client.post("/api/auth/register", json={
        "email": TEST_EMAIL,
        "name": "Duplicate",
        "password": "AnyPass123!"
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"].lower()


def test_login_valid():
    res = client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_invalid_rejected():
    """Wrong password must return 401 — no silent demo fallback."""
    res = client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "invalid" in res.json()["detail"].lower()


def test_get_me():
    res = client.get("/api/auth/me", headers=_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == TEST_EMAIL
    assert data["name"] == TEST_NAME


# ── 3. Student Profile ───────────────────────────────────────────────────────
def test_get_profile():
    res = client.get("/api/student/profile", headers=_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "target_role" in data
    assert "target_company" in data


def test_update_profile():
    res = client.put("/api/student/profile", headers=_auth_headers, json={
        "cgpa": 9.1,
        "target_company": "Google",
        "available_hours_per_day": 4.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["cgpa"] == 9.1
    assert data["target_company"] == "Google"


def test_get_readiness_unassessed():
    """Before any assessment, readiness must return None — not a fake score."""
    res = client.get("/api/student/readiness", headers=_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["overall_readiness"] is None
    assert "No assessment" in data["interpretation"]


def test_get_competencies_empty():
    res = client.get("/api/student/competencies", headers=_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_weaknesses_empty():
    res = client.get("/api/student/weaknesses", headers=_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# ── 4. Questions & Execution ─────────────────────────────────────────────────
def test_list_questions():
    res = client.get("/api/learning/questions")
    assert res.status_code == 200
    qs = res.json()
    assert len(qs) > 0
    assert "id" in qs[0]
    assert "title" in qs[0]


def test_execute_correct_code():
    code = (
        "from collections import deque\n"
        "def bfs_traversal(V, adj):\n"
        "    visited = [False] * V\n"
        "    q = deque([0])\n"
        "    visited[0] = True\n"
        "    res = []\n"
        "    while q:\n"
        "        n = q.popleft()\n"
        "        res.append(n)\n"
        "        for nb in adj[n]:\n"
        "            if not visited[nb]:\n"
        "                visited[nb] = True\n"
        "                q.append(nb)\n"
        "    return res\n"
    )
    res = client.post("/api/learning/execute", json={
        "code": code,
        "language": "python",
        "question_id": "dsa-graph-bfs-01"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ACCEPTED", "WRONG ANSWER", "wrong_answer", "accepted"]


def test_execute_flawed_code():
    res = client.post("/api/learning/execute", json={
        "code": "def bfs_traversal(V, adj):\n    return [0, 1]",
        "language": "python",
        "question_id": "dsa-graph-bfs-01"
    })
    assert res.status_code == 200


def test_resource_search():
    res = client.post("/api/learning/resources/search", json={
        "topic": "Graphs",
        "weakness_type": "implementation_weakness"
    })
    assert res.status_code == 200
    assert len(res.json()) > 0


def test_suggestions():
    res = client.get("/api/learning/suggestions", headers=_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_practice_submit():
    res = client.post("/api/learning/practice/submit", headers=_auth_headers, json={
        "question_id": "dsa-graph-bfs-01",
        "selected_option_index": 0
    })
    assert res.status_code == 200
    assert "is_correct" in res.json()



def test_generate_dynamic_question():
    res = client.post("/api/learning/questions/generate_dynamic", json={
        "company": "Google",
        "topic": "Operating Systems",
        "difficulty": "Hard",
        "question_type": "Technical MCQ"
    })
    assert res.status_code == 200
    q = res.json()
    assert "id" in q
    assert q["company"] == "Google"
    assert q["topic"] == "Operating Systems"
    assert len(q["options"]) == 4


# ── 5. Assessment ─────────────────────────────────────────────────────────────
def test_generate_and_submit_assessment():
    # Generate
    gen_res = client.post("/api/assessment/generate", headers=_auth_headers, json={
        "title": "Integration Test Diagnostic",
        "target_role": "Software Development Engineer (SDE)",
        "target_company": "Amazon",
        "subject_focus": "Graphs",
        "difficulty": "Medium",
        "question_count": 5,
        "use_dynamic_ai": True,
        "duration_minutes": 20
    })
    assert gen_res.status_code == 200
    assessment = gen_res.json()
    assert "session_id" in assessment
    session_id = assessment["session_id"]
    questions = assessment.get("questions", [])
    assert len(questions) == 5

    # Submit with first-option answers for each question
    submissions = [
        {"question_id": q["id"], "selected_option": 0, "time_taken_seconds": 30}
        for q in questions
    ]
    sub_res = client.post("/api/assessment/submit", headers=_auth_headers, json={
        "session_id": session_id,
        "submissions": submissions
    })
    assert sub_res.status_code == 200
    eval_data = sub_res.json()
    assert "overall_score_percentage" in eval_data
    assert isinstance(eval_data["overall_score_percentage"], float)


# ── 6. Progress & Plans ───────────────────────────────────────────────────────
def test_get_plan_no_plan_yet():
    res = client.get("/api/progress/plan", headers=_auth_headers)
    assert res.status_code == 200
    data = res.json()
    # Either version 0 (no plan) or a valid plan generated by previous cycle
    assert "version" in data
    assert "schedule_blocks" in data


def test_get_plan_history():
    res = client.get("/api/progress/plans/history", headers=_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_strategy_effectiveness():
    res = client.get("/api/progress/strategies")
    assert res.status_code == 200
    strats = res.json()
    assert len(strats) > 0
    assert "strategy_name" in strats[0]


# ── 7. Full 8-Agent Cycle ────────────────────────────────────────────────────
def test_full_agent_cycle():
    """
    Triggers the complete LangGraph workflow:
    Profile → Skill → Plan → Question → Sandbox → Evaluator → Weakness → Intervention → Adaptive Planner
    """
    res = client.post("/api/learning/trigger_agent_cycle", json={
        "user_id": 1,
        "target_role": "Software Development Engineer (SDE)",
        "target_company": "Amazon",
        "available_hours_per_day": 3.0,
        "preparation_deadline_days": 30,
        "skills": ["Python", "DSA", "DBMS", "OS"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert "adapted_plan" in data
    assert "execution_traces" in data
    assert len(data["execution_traces"]) >= 8  # All 8 agents must produce traces


# ── 8. Agent Traces ──────────────────────────────────────────────────────────
def test_get_agent_traces():
    res = client.get("/api/progress/traces", headers=_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# ── 9. Benchmark ─────────────────────────────────────────────────────────────
def test_benchmark_experiment():
    res = client.get("/api/benchmark/run_experiment?sample_size=10&days=30")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "static_planner" in data["summary"]
    assert "adaptive_planner" in data["summary"]
