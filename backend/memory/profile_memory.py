from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.models.student import StudentProfile, User

class ProfileMemory:
    """
    Tier A: Profile Memory
    Maintains stable student properties, goals, target roles, time allocations,
    and competency baselines.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, user_id: int) -> Optional[Dict[str, Any]]:
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            return None
        return {
            "user_id": profile.user_id,
            "branch": profile.branch,
            "graduation_year": profile.graduation_year,
            "cgpa": profile.cgpa,
            "target_role": profile.target_role,
            "target_company": profile.target_company,
            "preferred_job_type": profile.preferred_job_type,
            "available_hours_per_day": profile.available_hours_per_day,
            "preparation_deadline_days": profile.preparation_deadline_days,
            "skills": profile.skills,
            "preferred_subjects": profile.preferred_subjects,
            "learning_style": profile.learning_style,
            "user_requirements": profile.user_requirements,
            "tech_familiarity": profile.tech_familiarity,
            "readiness_score": profile.readiness_score
        }

    def update_profile(self, user_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            profile = StudentProfile(user_id=user_id, **updates)
            self.db.add(profile)
        else:
            for k, v in updates.items():
                if hasattr(profile, k) and v is not None:
                    setattr(profile, k, v)
        self.db.commit()
        self.db.refresh(profile)
        return self.get_profile(user_id)
