import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class StrategyRecord(Base):
    __tablename__ = "strategy_records"

    id = Column(String(100), primary_key=True) # e.g. strat-guided-coding-graphs
    strategy_name = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=False, index=True)
    weakness_type = Column(String(100), nullable=False) # implementation_weakness, conceptual_weakness, time_management
    context_description = Column(Text, nullable=False)
    intervention_sequence = Column(JSON, default=list) # e.g. ["visual breakdown", "worked example", "guided coding", "targeted drill"]
    average_before_score = Column(Float, default=40.0)
    average_after_score = Column(Float, default=70.0)
    average_improvement = Column(Float, default=30.0)
    sample_count = Column(Integer, default=1)
    success_rate = Column(Float, default=0.85) # 0.0 to 1.0
    effectiveness_rating = Column(String(50), default="Highly Effective") # Highly Effective, Moderate, Ineffective
    embedding_text = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

class AdaptivePlanSchedule(Base):
    __tablename__ = "adaptive_plan_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    plan_title = Column(String(255), default="Placement Preparation Master Plan")
    adaptation_reason = Column(Text, nullable=True)
    schedule_blocks = Column(JSON, default=list)
    # [
    #   {"time": "10:00 - 10:30", "topic": "Graphs", "activity": "BFS concept revision", "type": "concept", "priority": "High"},
    #   {"time": "10:30 - 11:00", "topic": "Graphs", "activity": "Guided BFS coding", "type": "guided_coding", "priority": "High"},
    #   ...
    # ]
    total_study_minutes_per_day = Column(Integer, default=180)
    target_deadline_days = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plans")

class AgentTraceLog(Base):
    __tablename__ = "agent_trace_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    session_id = Column(String(100), nullable=True)
    step_number = Column(Integer, default=1)
    agent_name = Column(String(100), nullable=False) # Profile Agent, Weakness Diagnosis Agent, Adaptive Planner, etc.
    observation = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)
    decision = Column(Text, nullable=False)
    action = Column(Text, nullable=False)
    tool_called = Column(String(100), nullable=True)
    tool_result_summary = Column(Text, nullable=True)
    memory_retrieved_summary = Column(Text, nullable=True)
    confidence = Column(Float, default=0.90)
    outcome_summary = Column(Text, nullable=True)
    next_agent = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
