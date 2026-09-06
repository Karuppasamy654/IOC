# PlacementEvolve AI

> **A Self-Adaptive Multi-Agent System for Personalized Software Engineering Placement Preparation**

PlacementEvolve AI is a fully functional, agentic web application that prepares students for competitive software engineering placements. It implements a closed-loop feedback engine driven by **8 specialized autonomous agents** orchestrated through a **LangGraph StateGraph**:

```
REGISTER/LOGIN → ONBOARDING WIZARD → BASELINE ASSESSMENT
       ↓
  ADAPTIVE PLAN (v1)
       ↓
  PRACTICE & CODE EXECUTION (Subprocess Sandbox)
       ↓
  EVALUATION → WEAKNESS DIAGNOSIS → INTERVENTION RETRIEVAL
       ↓
  ADAPTIVE REPLAN (v2) → STRATEGY MEMORY UPDATED
```

---

## ✅ What Actually Works (No Dummy Data)

| Feature | Status |
|---|---|
| JWT Register / Login / Auth | ✅ Real bcrypt + PyJWT |
| 4-Step Onboarding Wizard | ✅ Updates real DB profile |
| Baseline Mock Assessment | ✅ Generates & evaluates real MCQs/coding Qs |
| Competency Scores | ✅ Calculated from real submitted answers |
| Readiness Score | ✅ Weighted formula from real mastery scores |
| Code Practice Arena | ✅ Isolated subprocess sandbox, 3s timeout |
| 8-Agent LangGraph Cycle | ✅ Full StateGraph, traces persisted in DB |
| Adaptive Plan v1 → v2 | ✅ Real schedule adaptation from evidence |
| Strategy Memory | ✅ TF-IDF retrieval, win-rate updates |
| Agent Execution Traces | ✅ All 8 agents write structured DB trace logs |
| Research Benchmark | ✅ Static vs Adaptive controlled experiment |

---

## Project Structure

```
IOC_PROJECT/
├── backend/
│   ├── agents/              # 8 specialized autonomous agents
│   │   ├── profile_agent.py
│   │   ├── placement_skill_agent.py
│   │   ├── planner_agent.py
│   │   ├── question_agent.py
│   │   ├── evaluator_agent.py
│   │   ├── weakness_agent.py
│   │   ├── intervention_agent.py
│   │   └── adaptive_planner_agent.py
│   ├── api/                 # FastAPI routes (all JWT-protected)
│   │   ├── auth.py          # Register, Login, /me — bcrypt + PyJWT
│   │   ├── student.py       # Profile, Competencies, Readiness, Weaknesses
│   │   ├── assessment.py    # Generate/Submit Diagnostic Assessment
│   │   ├── learning.py      # Questions, Code Execute, Trigger Agent Cycle
│   │   ├── progress.py      # Plans, Strategies, Traces, Episodes
│   │   └── benchmark.py     # Static vs Adaptive experiment
│   ├── database/
│   │   ├── connection.py    # SQLAlchemy engine (SQLite)
│   │   └── init_db.py       # Creates schema + seeds question/strategy banks
│   ├── memory/              # 4-Tier persistent memory layer
│   │   ├── profile_memory.py
│   │   ├── episodic_memory.py
│   │   ├── mistake_memory.py
│   │   └── strategy_memory.py
│   ├── models/              # SQLAlchemy ORM models
│   ├── tools/               # 3 real integrated tools
│   │   ├── coding_execution_tool.py  # Subprocess sandbox
│   │   ├── mock_assessment_tool.py   # Diagnostic generator + scorer
│   │   └── resource_search_tool.py   # TF-IDF resource search
│   ├── workflows/
│   │   ├── graph.py         # LangGraph StateGraph — 8-agent pipeline
│   │   └── state.py         # AgentState TypedDict
│   └── main.py              # FastAPI app entry point
├── frontend/
│   └── src/
│       ├── components/      # 16 React/TypeScript UI components
│       ├── services/api.ts  # Typed API client with JWT headers
│       └── types/index.ts   # Shared TypeScript interfaces
├── data/
│   ├── questions/           # DSA + Core CS question banks (JSON)
│   └── strategies/          # Seed intervention strategies (JSON)
├── evaluation/              # pytest test suites
│   ├── test_api_endpoints.py    # Integration tests (auth + API)
│   ├── agent_tests/test_agents.py
│   ├── tool_tests/test_tools.py
│   └── benchmark.py
├── requirements.txt
└── README.md
```

---

## Quick Start (Windows — Fresh Clone)

### Prerequisites

- **Python 3.10+** (tested on 3.13)
- **Node.js 18+** and **npm**

### 1. Backend Setup

```powershell
# From the project root
pip install -r requirements.txt

# Initialize the database (creates schema + seeds question/strategy banks)
python -m backend.database.init_db

# Start the FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs will be available at: **http://localhost:8000/docs**

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Web dashboard will be available at: **http://localhost:5173**

---

## End-to-End User Workflow

Follow these steps on a fresh database for a complete demo:

### Step 1: Register a New Account
- Click **"Login / Register"** in the top navigation bar.
- Switch to the **Register** tab.
- Enter your **name**, **email**, and **password** → click **"Create Account"**.
- A JWT token is stored in browser `localStorage` — no demo user is logged in.

### Step 2: Complete Onboarding Wizard
- After registration, a banner appears: **"Complete Your Placement Onboarding"**.
- Click **"Launch Onboarding Wizard"** and complete all 4 steps:
  1. Academic background (branch, CGPA, graduation year)
  2. Self-reported technical familiarity (DSA, DBMS, OS, Networks…)
  3. Target company & role (Amazon, Google, Microsoft…) + deadline + daily hours
  4. Learning style preference + free-text requirements
- Click **"Complete Profile & Unlock Assessment"** — this persists your profile to the DB.

### Step 3: Take Baseline Diagnostic Assessment
- Navigate to **"Assessment Center"** tab.
- Click **"Generate Diagnostic Assessment"** — the system generates 10–15 mixed MCQ + coding questions across your target role's key domains.
- Answer all questions within the timer.
- Click **"Submit Assessment"** — the `MockAssessmentTool` scores answers and writes real competency mastery scores to the database.

### Step 4: View Readiness Dashboard
- Return to **"Dashboard"** — your calculated readiness percentage is now displayed.
- The **Skill Competency Breakdown** shows real scores per topic (Graphs, OS, DBMS, SQL, OOP…).
- The **"What should I study?"** card shows your lowest-scoring weak topic from DB.

### Step 5: Run Full Agent Cycle (1-Click Adaptive Replan)
- In the **Navbar**, click **"Run Agent Cycle"**.
- The complete 8-agent LangGraph StateGraph executes:
  1. **Profile Agent** — Synthesizes student state
  2. **Placement Skill Agent** — Maps competency gaps against target role
  3. **Planning Agent** — Generates Plan v1
  4. **Question Agent** — Selects a practice problem targeting your weakest gap
  5. **Sandbox Executor** — Runs code in isolated subprocess
  6. **Evaluation Agent** — Analyzes execution telemetry (pass rate, runtime, flaws)
  7. **Weakness Diagnosis Agent** — Classifies Conceptual vs. Implementation vs. Time gaps
  8. **Adaptive Planner Agent** — Updates Strategy Memory, deploys Plan v2
- You are automatically redirected to the **Roadmap** tab showing Plan v2 with adaptation reasoning.

### Step 6: Observe Agent Reasoning
- Navigate to **"Agent Traces"** tab.
- Every agent's Observation → Reasoning → Decision → Action → Outcome is displayed.
- Traces are persisted in the SQLite DB and will survive server restarts.

### Step 7: Practice in Code Arena
- Navigate to **"Code Practice"** tab.
- Select any question, write Python code in the editor.
- Click **"Run Code"** — executed in an isolated subprocess with 3-second timeout.
- See per-test-case results, runtime (ms), and flaw detection output.

---

## Running Automated Tests

```powershell
# Run all tests from project root
python -m pytest evaluation/ -v

# Run only agent unit tests
python -m pytest evaluation/agent_tests/ -v

# Run only tool tests
python -m pytest evaluation/tool_tests/ -v

# Run only API integration tests
python -m pytest evaluation/test_api_endpoints.py -v

# Run empirical benchmark CLI
python evaluation/benchmark.py
```

---

## 8 Autonomous Agents — Architecture

```
START
  │
  ▼
[1] Profile Agent
    ↳ Reads + persists structured student state from DB profile
  │
  ▼
[2] Placement Skill Analysis Agent
    ↳ Maps competency gaps against role-specific benchmark thresholds
    ↳ Produces prioritized critical_gaps list
  │
  ▼
[3] Planning Agent
    ↳ Allocates time blocks across topic priorities
    ↳ Writes Plan v1 to AdaptivePlanSchedule table
  │
  ▼
[4] Question/Practice Agent
    ↳ Queries Mistake Memory for recurring errors
    ↳ Selects or generates targeted practice item
  │
  ▼
[5] Sandbox Execution (Tool)
    ↳ Runs code in isolated Python subprocess
    ↳ Enforces 3s timeout, sanitizes env vars, blocks dangerous builtins
  │
  ▼
[6] Evaluation Agent
    ↳ Generates structured telemetry: accuracy, pass rate, runtime, flaw type
    ↳ Updates StudentCompetency mastery scores in DB
  │
  ▼
[7] Weakness Diagnosis Agent
    ↳ Classifies: Conceptual Weakness vs. Implementation Weakness vs. Time Management
    ↳ Writes EpisodicLog + MistakeRecord to DB
  │
  ▼
[8] Resource/Intervention Agent
    ↳ Queries Strategy Memory (TF-IDF cosine similarity)
    ↳ Retrieves highest-yield intervention for the detected weakness type
  │
  ▼
[Adaptive Planner Agent]
    ↳ Measures delta improvement (score_before → score_after)
    ↳ Updates StrategyRecord win-rate in DB
    ↳ Deactivates Plan v1, commits Plan v2 with adaptation reasoning
  │
  ▼
END
```

---

## 4-Tier Memory System

| Memory Tier | Storage | Purpose |
|---|---|---|
| **Profile Memory** | `student_profiles` table | Stable academic/target profile |
| **Episodic Memory** | `episodic_logs` table | Per-session activity log (topic, score_before, score_after) |
| **Mistake Memory** | `mistake_records` table | Recurring error patterns (occurrence-counted) |
| **Strategy Memory** | `strategy_records` table | Intervention effectiveness records with TF-IDF retrieval |

---

## 3 Integrated Tools

### Tool 1: Sandboxed Coding Execution Tool
- **Implementation**: `subprocess.run()` with a `RUNNER_SCRIPT` injected via `stdin`
- **Isolation**: Dangerous builtins removed (`exec`, `eval`, `open`, `exit`, `input`), env vars sanitized
- **Timeout**: Hard 3-second limit — returns `TIME LIMIT EXCEEDED`
- **Flaw Detection**: Static heuristic analysis (e.g. `visited_array_omission`, `late_visited_update`)
- **Output**: `{ status, passed, total, runtime_ms, test_results, flaw_detected }`

### Tool 2: Mock Placement Assessment Tool
- **Implementation**: `backend/tools/mock_assessment_tool.py`
- **Features**: Multi-topic timed OA generator, deterministic scoring, topic_breakdown
- **Result**: Per-topic mastery scores written to `StudentCompetency` table

### Tool 3: Learning Resource Search Tool
- **Implementation**: `backend/tools/resource_search_tool.py`
- **Method**: TF-IDF + cosine similarity over curated resource corpus
- **Query**: `(topic, weakness_type, learning_preference)` → ranked resource list

---

## Security Notes

- All student API endpoints (`/api/student/*`, `/api/assessment/*`, `/api/progress/*`) require a valid `Authorization: Bearer <token>` header.
- Passwords are hashed with **bcrypt** before storage — never stored in plaintext.
- JWT tokens expire after **7 days**.
- The sandbox subprocess has no access to `JWT_SECRET`, `DATABASE_URL`, or other app secrets.
- Student data is always **user-scoped** — one user cannot access another's profile, competencies, or plans.

---

## Environment Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `placement-evolve-secret-key-prod-2026` | JWT signing secret — override in production |
| `DATABASE_URL` | SQLite `placement_evolve.db` | Override with PostgreSQL URL for production |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | FastAPI 0.110+ |
| Agent Orchestration | LangGraph 0.2+ (StateGraph) |
| ORM / Database | SQLAlchemy 2.0 + SQLite |
| Auth | PyJWT + passlib[bcrypt] |
| Code Sandbox | Python subprocess + stdin/stdout JSON protocol |
| Frontend | React 18 + TypeScript + Vite |
| UI Styling | Tailwind CSS 3 |
| Charts | Recharts |

---

## Research Benchmark

PlacementEvolve AI includes a controlled experiment comparing:
- **Mode A (Static Planner)**: Fixed weekly schedule, no feedback loop
- **Mode B (PlacementEvolve Adaptive)**: Full 8-agent closed-loop with strategy memory

Navigate to the **"Research Benchmark"** tab or run:

```powershell
python evaluation/benchmark.py
# Or via API:
# GET http://localhost:8000/api/benchmark/run_experiment?sample_size=50&days=30
```

---

*PlacementEvolve AI — Self-Adaptive Multi-Agent Placement Preparation Platform*
*8 Autonomous Agents · LangGraph StateGraph · 4-Tier Memory · Subprocess Sandbox*
