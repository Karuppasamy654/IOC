import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    competencies = relationship("StudentCompetency", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("QuestionSubmission", back_populates="user", cascade="all, delete-orphan")
    plans = relationship("AdaptivePlanSchedule", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch = Column(String(100), default="Computer Science")
    graduation_year = Column(Integer, default=2026)
    cgpa = Column(Float, default=8.5)
    target_role = Column(String(100), default="Software Development Engineer (SDE)")
    available_hours_per_day = Column(Float, default=3.0)
    preparation_deadline_days = Column(Integer, default=30)
    skills = Column(JSON, default=lambda: ["Python", "C++", "DSA", "DBMS"])
    preferred_subjects = Column(JSON, default=lambda: ["DSA", "Operating Systems", "DBMS"])
    readiness_score = Column(Float, default=45.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class StudentCompetency(Base):
    __tablename__ = "student_competencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False, index=True)
    mastery_score = Column(Float, default=40.0) # 0 to 100
    concept_mastery = Column(Float, default=40.0)
    implementation_mastery = Column(Float, default=40.0)
    time_management_score = Column(Float, default=50.0)
    status = Column(String(50), default="Needs Improvement") # Mastered, Proficient, Needs Improvement, Critical Weakness
    last_assessed = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="competencies")
