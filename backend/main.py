import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base
from backend.database.init_db import init_database

from backend.api.auth import router as auth_router
from backend.api.student import router as student_router
from backend.api.assessment import router as assessment_router
from backend.api.learning import router as learning_router
from backend.api.progress import router as progress_router
from backend.api.benchmark import router as benchmark_router

app = FastAPI(
    title="PlacementEvolve AI API",
    description="A Self-Adaptive Multi-Agent System for Personalized Placement Preparation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_origin_regex=r"http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_database()

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(assessment_router)
app.include_router(learning_router)
app.include_router(progress_router)
app.include_router(benchmark_router)

@app.get("/")
def root():
    return {
        "system": "PlacementEvolve AI",
        "description": "Autonomous Self-Adaptive Multi-Agent Placement Preparation System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "PlacementEvolve Backend", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
