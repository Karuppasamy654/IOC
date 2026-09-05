# PlacementEvolve AI
> **A Self-Adaptive Multi-Agent System for Personalized Software Engineering Placement Preparation**

PlacementEvolve AI is an autonomous, agentic web application designed to prepare students for competitive software engineering placements. It implements a closed-loop feedback engine:
$$\text{Observe} \longrightarrow \text{Reason} \longrightarrow \text{Plan} \longrightarrow \text{Act} \longrightarrow \text{Observe} \longrightarrow \text{Evaluate} \longrightarrow \text{Learn} \longrightarrow \text{Adapt} \longrightarrow \text{Replan}$$

---

## Key Features

1. **8 Autonomous Specialized Agents**:
   - **Student Profile Agent**: Builds structured academic and target profile.
   - **Placement Skill Analysis Agent**: Maps role competencies and knowledge gaps.
   - **Planning Agent**: Creates initial preparation schedule.
   - **Question/Practice Agent**: Memory-informed problem generator targeting active mistakes.
   - **Evaluation Agent**: Analyzes code execution, pass rates, and runtime to generate structured telemetry.
   - **Weakness Diagnosis Agent**: Distinguishes **Conceptual Weakness vs. Implementation Mastery vs. Time Management**.
   - **Resource/Intervention Agent**: Selects high-yield interventions using persistent Strategy Memory.
   - **Adaptive Planner Agent**: Main agentic engine modifying schedules, promoting/demoting topics, and recording delta gains in memory.

2. **3 Real Integrated Tools**:
   - **Sandboxed Coding Execution Tool**: Multi-test execution measuring runtime (ms), syntax/runtime errors, and static flaw heuristics.
   - **Learning Resource Search Tool**: Semantic search engine retrieving curated visual guides, cheat sheets, and invariant proofs.
   - **Mock Placement Assessment Tool**: Multi-topic timed placement OA generator and deterministic scoring engine.

3. **Multi-Tier Persistent Memory Engine**:
   - Profile Memory, Episodic Learning Memory, Mistake Memory, and Strategy Memory with Cosine Vector Retrieval.

4. **Empirical Research Benchmark Sandbox**:
   - Controlled experiment comparing **Mode A (Static Planner)** vs **Mode B (PlacementEvolve Adaptive Multi-Agent)**.

---

## Quick Start Guide

### 1. Backend Setup (FastAPI + LangGraph)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run backend test suite
pytest evaluation/ -v

# Run empirical benchmark CLI
python evaluation/benchmark.py

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + TypeScript + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
The web dashboard will be available at `http://localhost:5173`.

---

## 1-Click End-to-End Primary Demo Scenario

1. Click the **"1-Click End-to-End Demo Scenario"** button in the top navigation bar.
2. The system executes the complete 20-step loop:
   - Initial Graph score: 35%
   - Evaluator observes BFS test failure and diagnoses **Visited Array Omission** (Concept: Good vs. Implementation: Weak).
   - System queries Strategy Memory and retrieves **"Guided Coding & Visited Invariant Drill"**.
   - Resource Search Tool is invoked to load visual state diagrams.
   - Re-assessment score jumps to **68%** (+30% improvement).
   - Strategy Memory records the empirical gain.
   - Dynamic schedule is adapted (Plan v2) promoting Graphs and targeting Operating Systems next.
3. Observe real-time step-by-step reasoning in the **"Agent Traces"** tab.
