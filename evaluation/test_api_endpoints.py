import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_student_endpoints():
    res_prof = client.get("/api/student/profile?user_id=1")
    assert res_prof.status_code == 200
    assert "target_role" in res_prof.json()

    res_comp = client.get("/api/student/competencies?user_id=1")
    assert res_comp.status_code == 200
    assert len(res_comp.json()) > 0

    res_read = client.get("/api/student/readiness?user_id=1")
    assert res_read.status_code == 200
    assert "overall_readiness" in res_read.json()

    res_weak = client.get("/api/student/weaknesses?user_id=1")
    assert res_weak.status_code == 200

def test_learning_endpoints():
    res_q = client.get("/api/learning/questions")
    assert res_q.status_code == 200
    assert len(res_q.json()) > 0

    res_exec = client.post("/api/learning/execute", json={
        "code": "def bfs_traversal(V, adj):\n    return [0, 1]",
        "language": "python",
        "question_id": "dsa-graph-bfs-01"
    })
    assert res_exec.status_code == 200
    assert res_exec.json()["status"] in ["wrong_answer", "accepted"]

    res_res = client.post("/api/learning/resources/search", json={
        "topic": "Graphs",
        "weakness_type": "implementation_weakness"
    })
    assert res_res.status_code == 200
    assert len(res_res.json()) > 0

def test_full_agent_cycle_endpoint():
    res_cycle = client.post("/api/learning/trigger_agent_cycle", json={
        "user_id": 1,
        "target_role": "Software Development Engineer (SDE)",
        "available_hours_per_day": 3.0,
        "preparation_deadline_days": 30
    })
    assert res_cycle.status_code == 200
    data = res_cycle.json()
    assert data["status"] == "completed"
    assert "adapted_plan" in data
    assert len(data["execution_traces"]) >= 5

def test_progress_and_benchmark():
    res_plan = client.get("/api/progress/plan?user_id=1")
    assert res_plan.status_code == 200
    assert "schedule_blocks" in res_plan.json()

    res_strat = client.get("/api/progress/strategies")
    assert res_strat.status_code == 200
    assert len(res_strat.json()) > 0

    res_bench = client.get("/api/benchmark/run_experiment?sample_size=10&days=30")
    assert res_bench.status_code == 200
    assert "summary" in res_bench.json()
