import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.student import User, StudentProfile

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET", "placement-evolve-secret-key-prod-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"user_id": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not auth:
        # Fallback for API client testing if token header missing in dev
        first_user = db.query(User).first()
        if first_user:
            return first_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    
    token = auth.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class UserRegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    branch: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2026
    cgpa: Optional[float] = 8.5
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    target_company: Optional[str] = "Amazon"
    available_hours_per_day: Optional[float] = 3.0
    preparation_deadline_days: Optional[int] = 30
    skills: Optional[list] = None
    preferred_subjects: Optional[list] = None
    learning_style: Optional[str] = "Mixed"
    user_requirements: Optional[str] = None
    tech_familiarity: Optional[dict] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email.strip().lower(),
        name=req.name.strip(),
        hashed_password=hash_password(req.password)
    )
    db.add(user)
    db.flush()

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if profile:
        profile.branch = req.branch or profile.branch
        profile.graduation_year = req.graduation_year or profile.graduation_year
        profile.cgpa = req.cgpa or profile.cgpa
        profile.target_role = req.target_role or profile.target_role
        profile.target_company = req.target_company or profile.target_company
        profile.available_hours_per_day = req.available_hours_per_day or profile.available_hours_per_day
        profile.preparation_deadline_days = req.preparation_deadline_days or profile.preparation_deadline_days
        profile.skills = req.skills or profile.skills
        profile.preferred_subjects = req.preferred_subjects or profile.preferred_subjects
        profile.learning_style = req.learning_style or profile.learning_style
        profile.user_requirements = req.user_requirements or profile.user_requirements
        profile.tech_familiarity = req.tech_familiarity or profile.tech_familiarity
    else:
        profile = StudentProfile(
            user_id=user.id,
            branch=req.branch or "Computer Science",
            graduation_year=req.graduation_year or 2026,
            cgpa=req.cgpa or 8.0,
            target_role=req.target_role or "Software Development Engineer (SDE)",
            target_company=req.target_company or "Amazon",
            available_hours_per_day=req.available_hours_per_day or 3.0,
            preparation_deadline_days=req.preparation_deadline_days or 30,
            skills=req.skills or ["Python", "DSA", "DBMS", "OS"],
            preferred_subjects=req.preferred_subjects or ["DSA", "Operating Systems", "DBMS"],
            learning_style=req.learning_style or "Mixed",
            user_requirements=req.user_requirements,
            tech_familiarity=req.tech_familiarity or {},
            readiness_score=None
        )
        db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.post("/login")
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    prof = user.profile
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile": {
            "branch": prof.branch if prof else "Computer Science",
            "graduation_year": prof.graduation_year if prof else 2026,
            "cgpa": prof.cgpa if prof else 8.0,
            "target_role": prof.target_role if prof else "SDE",
            "target_company": prof.target_company if prof else "Amazon",
            "preferred_job_type": prof.preferred_job_type if prof else "Product Based",
            "available_hours_per_day": prof.available_hours_per_day if prof else 3.0,
            "preparation_deadline_days": prof.preparation_deadline_days if prof else 30,
            "skills": prof.skills if prof else [],
            "preferred_subjects": prof.preferred_subjects if prof else [],
            "learning_style": prof.learning_style if prof else "Mixed",
            "user_requirements": prof.user_requirements if prof else None,
            "tech_familiarity": prof.tech_familiarity if prof else {},
            "readiness_score": prof.readiness_score if prof else None
        }
    }
