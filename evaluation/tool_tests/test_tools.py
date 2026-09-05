import pytest
from backend.database.connection import SessionLocal
from backend.database.init_db import init_database
from backend.tools.coding_execution_tool import CodingExecutionTool
from backend.tools.resource_search_tool import ResourceSearchTool
from backend.tools.mock_assessment_tool import MockAssessmentTool

@pytest.fixture(scope="module")
def db():
    init_database()
    session = SessionLocal()
    yield session
    session.close()

def test_coding_execution_tool_valid_and_invalid():
    tool = CodingExecutionTool()

    # Valid BFS code
    valid_bfs = (
        "from collections import deque\n"
        "def bfs_traversal(V, adj):\n"
        "    visited = [False] * V\n"
        "    queue = deque([0])\n"
        "    visited[0] = True\n"
        "    res = []\n"
        "    while queue:\n"
        "        node = queue.popleft()\n"
        "        res.append(node)\n"
        "        for n in adj[node]:\n"
        "            if not visited[n]:\n"
        "                visited[n] = True\n"
        "                queue.append(n)\n"
        "    return res\n"
    )

    test_cases = [
        {"input": {"V": 5, "adj": [[1, 2, 3], [], [4], [], []]}, "expected": [0, 1, 2, 3, 4]},
        {"input": {"V": 4, "adj": [[1, 2], [0, 2], [0, 1, 3], [2]]}, "expected": [0, 1, 2, 3]}
    ]

    res = tool.execute_python_code(valid_bfs, test_cases)
    assert res["status"] == "accepted"
    assert res["passed"] == 2
    assert res["total"] == 2
    assert res["runtime_ms"] > 0

    # Flawed BFS code (visited omitted)
    flawed_bfs = (
        "def bfs_traversal(V, adj):\n"
        "    return [0, 1]\n"
    )
    res_flawed = tool.execute_python_code(flawed_bfs, test_cases)
    assert res_flawed["status"] == "wrong_answer"
    assert res_flawed["flaw_detected"] == "visited_array_omission"

def test_resource_search_tool():
    tool = ResourceSearchTool()
    results = tool.search(
        topic="Graphs",
        weakness_type="implementation_weakness_visited_array",
        learning_preference="visual + guided"
    )
    assert len(results) > 0
    assert "relevance_score" in results[0]
    assert results[0]["relevance_score"] >= 40.0

def test_mock_assessment_tool(db):
    tool = MockAssessmentTool(db)
    assessment = tool.generate_assessment(user_id=1, duration_minutes=30)
    assert assessment["total_questions"] > 0
    assert "session_id" in assessment

    # Evaluate submission
    eval_res = tool.evaluate_assessment_submission(
        session_id=assessment["session_id"],
        submissions=[
            {"question_id": assessment["questions"][0]["id"], "selected_option_index": 1}
        ]
    )
    assert "overall_score_percentage" in eval_res
    assert "topic_breakdown" in eval_res
