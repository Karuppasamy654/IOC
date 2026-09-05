from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
from backend.database.connection import get_db
from backend.models.student import User, StudentProfile

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
SECRET_KEY = "placement-evolve-super-secret-key"
ALGORITHM = "HS256"

class UserRegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    branch: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2026
    cgpa: Optional[float] = 8.5
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    available_hours_per_day: Optional[float] = 3.0
    preparation_deadline_days: Optional[int] = 30

class UserLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        name=req.name,
        hashed_password="hashed_" + req.password
    )
    db.add(user)
    db.flush()

    profile = StudentProfile(
        user_id=user.id,
        branch=req.branch,
        graduation_year=req.graduation_year,
        cgpa=req.cgpa,
        target_role=req.target_role,
        available_hours_per_day=req.available_hours_per_day,
        preparation_deadline_days=req.preparation_deadline_days,
        skills=["Python", "C++", "DSA", "DBMS", "OS"],
        preferred_subjects=["DSA", "DBMS", "OS"],
        readiness_score=48.0
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = jwt.encode({"user_id": user.id, "email": user.email, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "name": user.name, "email": user.email}

@router.post("/login")
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        demo = db.query(User).filter(User.email == "demo@placementevolve.ai").first()
        if demo:
            token = jwt.encode({"user_id": demo.id, "email": demo.email, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
            return {"access_token": token, "token_type": "bearer", "user_id": demo.id, "name": demo.name, "email": demo.email}
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode({"user_id": user.id, "email": user.email, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "name": user.name, "email": user.email}

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "demo@placementevolve.ai").first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile": {
            "branch": user.profile.branch if user.profile else "Computer Science",
            "cgpa": user.profile.cgpa if user.profile else 8.4,
            "target_role": user.profile.target_role if user.profile else "SDE",
            "available_hours_per_day": user.profile.available_hours_per_day if user.profile else 3.0,
            "preparation_deadline_days": user.profile.preparation_deadline_days if user.profile else 30,
            "readiness_score": user.profile.readiness_score if user.profile else 48.5
        }
    }
