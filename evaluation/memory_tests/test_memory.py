import pytest
import uuid
from backend.database.connection import SessionLocal
from backend.database.init_db import init_database
from backend.memory.profile_memory import ProfileMemory
from backend.memory.episodic_memory import EpisodicMemory
from backend.memory.mistake_memory import MistakeMemory
from backend.memory.strategy_memory import StrategyMemory
from backend.memory.memory_retriever import MemoryRetriever

@pytest.fixture(scope="module")
def db():
    init_database()
    session = SessionLocal()
    yield session
    session.close()

def test_profile_memory(db):
    mem = ProfileMemory(db)
    prof = mem.get_profile(1)
    assert prof is not None
    assert prof["target_role"] is not None

def test_episodic_memory(db):
    mem = EpisodicMemory(db)
    rec = mem.record_episode(
        user_id=1,
        topic="Graphs",
        activity_type="guided_coding",
        score_before=38.0,
        score_after=68.0,
        intervention_applied="Visual Diagram + Guided BFS"
    )
    assert rec["improvement"] == 30.0
    assert rec["outcome"] == "success"

def test_mistake_memory(db):
    mem = MistakeMemory(db)
    m = mem.record_mistake(
        user_id=1,
        topic="Graphs",
        mistake_type="visited_array_omission",
        description="Omitted visited check in BFS queue loop"
    )
    assert m["topic"] == "Graphs"
    assert m["occurrence_count"] >= 1

def test_strategy_memory_and_vector_retriever(db):
    strat_mem = StrategyMemory(db)
    retriever = MemoryRetriever(db)

    unique_id = f"strat-test-{uuid.uuid4().hex[:6]}"
    strat = strat_mem.record_or_update_strategy(
        strategy_id=unique_id,
        strategy_name="Guided Coding Drill",
        topic="Graphs",
        weakness_type="implementation_weakness",
        context_description="Visited state synchronization in graph traversal",
        intervention_sequence=["Step 1: Visual Trace", "Step 2: Guided Code"],
        before_score=35.0,
        after_score=72.0
    )
    assert strat["average_improvement"] == 37.0

    best = retriever.retrieve_best_strategy(
        topic="Graphs",
        weakness_type="implementation_weakness",
        diagnosis_context="Visited state omitted in BFS"
    )
    assert best is not None
    assert "strategy_name" in best
    assert best["historical_improvement"] > 20.0
