import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from backend.database.connection import Base

class EpisodicLog(Base):
    __tablename__ = "episodic_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    topic = Column(String(100), nullable=False, index=True)
    subtopic = Column(String(100), nullable=True)
    activity_type = Column(String(50), default="practice") # practice, assessment, intervention, review
    question_id = Column(String(100), nullable=True)
    score_before = Column(Float, nullable=True)
    score_after = Column(Float, nullable=True)
    improvement = Column(Float, default=0.0)
    mistake_summary = Column(Text, nullable=True)
    intervention_applied = Column(String(255), nullable=True)
    outcome_status = Column(String(50), default="completed") # success, partial, failed
    metadata_json = Column(JSON, default=dict)

class MistakeRecord(Base):
    __tablename__ = "mistake_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False, index=True)
    subtopic = Column(String(100), nullable=True)
    mistake_type = Column(String(100), nullable=False) # e.g. "visited_array_omission", "boundary_off_by_one"
    description = Column(Text, nullable=False)
    occurrence_count = Column(Integer, default=1)
    status = Column(String(50), default="recurring") # recurring, resolving, resolved
    last_occurred_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class ReadinessScoreRecord(Base):
    __tablename__ = "readiness_score_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_readiness = Column(Float, nullable=False) # 0 to 100
    dsa_score = Column(Float, default=0.0)
    dbms_score = Column(Float, default=0.0)
    os_score = Column(Float, default=0.0)
    oop_score = Column(Float, default=0.0)
    sql_score = Column(Float, default=0.0)
    networks_score = Column(Float, default=0.0)
    coding_score = Column(Float, default=0.0)
    mock_oa_score = Column(Float, default=0.0)
    time_management_score = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)
