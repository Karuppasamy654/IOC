import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class QuestionRecord(Base):
    __tablename__ = "question_records"

    id = Column(String(100), primary_key=True)
    company = Column(String(100), nullable=True, default="Amazon", index=True)
    topic = Column(String(100), nullable=False, index=True)
    subtopic = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Medium")
    question_type = Column(String(50), default="coding") # coding, mcq, sql, debugging, prediction
    description = Column(Text, nullable=False)
    starter_code = Column(JSON, default=dict)
    test_cases = Column(JSON, default=list)
    options = Column(JSON, default=list)
    correct_option_index = Column(Integer, nullable=True)
    flaw_triggers = Column(JSON, default=dict)
    reference_solution = Column(JSON, default=dict)
    explanation = Column(Text, nullable=True)

class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Placement Mock Assessment")
    assessment_type = Column(String(50), default="mock_oa") # diagnostic, mock_oa, targeted_drill, reassessment
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=100.0)
    score_percentage = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=60)
    topic_breakdown = Column(JSON, default=dict)
    detailed_results = Column(JSON, default=list)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestionSubmission(Base):
    __tablename__ = "question_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(String(100), ForeignKey("question_records.id"), nullable=False)
    assessment_session_id = Column(String(100), nullable=True)
    submitted_code_or_answer = Column(Text, nullable=False)
    language = Column(String(50), default="python")
    status = Column(String(50), default="evaluated") # accepted, wrong_answer, compile_error, runtime_error, partial
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    runtime_ms = Column(Float, default=0.0)
    time_taken_seconds = Column(Float, default=0.0)
    detected_errors = Column(JSON, default=list)
    evaluation_feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
