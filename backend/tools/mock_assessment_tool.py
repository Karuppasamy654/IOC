import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.assessment import QuestionRecord, AssessmentSession

class MockAssessmentTool:
    """
    Mandatory Tool 3: Mock Placement Assessment Tool
    Generates customized placement assessments, handles multi-topic distribution,
    evaluates submissions deterministically, and produces diagnostic reports.
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    def synthesize_dynamic_question(
        self,
        company: str = "Amazon",
        topic: str = "Graphs",
        difficulty: str = "Medium",
        subtopic: Optional[str] = None,
        index_offset: int = 0
    ) -> Dict[str, Any]:
        """
        Synthesizes a rich placement question on-the-fly for any company, subject, and difficulty,
        with varied question templates based on index_offset to ensure uniqueness.
        """
        q_id = f"dyn-{uuid.uuid4().hex[:8]}"
        sub_title = subtopic or f"{topic} Core Pattern Analysis"

        topic_lower = topic.lower()

        # Multi-template catalog per topic to guarantee distinct unique questions
        graph_templates = [
            {
                "title": f"{company} {topic} Topological Sort Invariant",
                "desc": f"In a {company} {difficulty}-level assessment on {topic}, consider a directed graph G = (V, E). Which condition definitively indicates that Kahn's algorithm has detected a directed cycle?",
                "opts": ["A) Processed vertex count < V after zero-indegree queue is empty.", "B) All vertex in-degrees become zero initially.", "C) DFS stack depth exceeds O(V+E).", "D) In-degree array contains negative integers."],
                "correct": 0,
                "exp": "Vertices within a directed cycle maintain in-degree >= 1, preventing them from entering the zero-indegree queue. Thus, total processed vertices < V."
            },
            {
                "title": f"{company} Dijkstra Priority Queue Min-Heap Complexity",
                "desc": f"For {company} ({difficulty} Level): What is the tight time complexity of Dijkstra's algorithm implemented with an adjacency list and binary min-heap?",
                "opts": ["A) O((V + E) log V)", "B) O(V^2)", "C) O(E^2)", "D) O(V log E)"],
                "correct": 0,
                "exp": "Extracting minimum distance nodes and updating neighbor distances via min-heap operations takes O((V + E) log V) time."
            },
            {
                "title": f"{company} Bipartite Graph 2-Coloring Check",
                "desc": f"In {company}'s technical interview on {topic}: Which structural property prevents an undirected graph from being 2-colorable (bipartite)?",
                "opts": ["A) Presence of an odd-length cycle.", "B) Presence of an even-length cycle.", "C) Vertices having degree greater than 3.", "D) Disconnected subgraphs."],
                "correct": 0,
                "exp": "A graph is bipartite if and only if it contains no odd-length cycles."
            },
            {
                "title": f"{company} Bellman-Ford Negative Cycle Detection",
                "desc": f"Why can the Bellman-Ford algorithm detect negative weight cycles while Dijkstra's algorithm fails?",
                "opts": ["A) Bellman-Ford relaxes all E edges V-1 times; a V-th relaxation that shortens any distance indicates a negative cycle.", "B) Bellman-Ford uses a FIFO queue.", "C) Dijkstra cannot process floating point weights.", "D) Bellman-Ford executes in O(V + E) time."],
                "correct": 0,
                "exp": "A shortest simple path has at most V-1 edges. If distance can still be relaxed after V-1 passes, a negative cycle exists."
            }
        ]

        dbms_templates = [
            {
                "title": f"{company} SQL GROUP BY & HAVING Filter Output",
                "desc": f"For {company}'s database OA ({difficulty}): Predict the output of executing SELECT dept_id, AVG(salary) FROM Emp GROUP BY dept_id HAVING COUNT(*) > 3 AND AVG(salary) > 50000;",
                "opts": ["A) Returns average salaries for departments with more than 3 employees earning an average > 50,000.", "B) Syntax error because HAVING cannot combine COUNT and AVG.", "C) Filters individual rows before grouping.", "D) Returns overall company average."],
                "correct": 0,
                "exp": "HAVING filters aggregated groups produced by GROUP BY based on aggregate function conditions."
            },
            {
                "title": f"{company} BCNF Normalization Condition",
                "desc": f"In {company} DBMS assessment: A relational schema R is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X -> Y:",
                "opts": ["A) X is a Super Key in schema R.", "B) Y is a Prime Attribute.", "C) X is a Candidate Key or Y is a Prime Attribute.", "D) Schema R contains no nulls."],
                "correct": 0,
                "exp": "BCNF strictly requires the determinant X to be a super key for every functional dependency."
            },
            {
                "title": f"{company} Transaction Isolation Levels & Dirty Read",
                "desc": f"Which SQL transaction isolation level prevents Dirty Reads but still allows Non-Repeatable Reads?",
                "opts": ["A) Read Committed", "B) Read Uncommitted", "C) Repeatable Read", "D) Serializable"],
                "correct": 0,
                "exp": "Read Committed prevents reading uncommitted changes (dirty reads) but permits data modifications between reads."
            }
        ]

        os_templates = [
            {
                "title": f"{company} Mutex vs Binary Semaphore Invariant",
                "desc": f"Targeting {company} ({difficulty} Level - OS): What is the primary operational distinction between a Binary Semaphore and a Mutex lock?",
                "opts": ["A) A Mutex has strict thread ownership (only the locking thread can unlock it), whereas any thread can signal a binary semaphore.", "B) Semaphores can take values up to infinity while Mutex is strictly 0 or 1.", "C) Mutexes cause kernel panic upon contention.", "D) Binary semaphores operate in user-space only."],
                "correct": 0,
                "exp": "Mutexes enforce strict thread ownership (locking thread must unlock). Semaphores can be signaled by any producer/consumer thread."
            },
            {
                "title": f"{company} Banker's Safety Algorithm Invariant",
                "desc": f"In Banker's Algorithm for deadlock avoidance, a state is defined as SAFE if:",
                "opts": ["A) There exists at least one execution sequence of processes that allows all processes to complete without deadlock.", "B) Total allocated resources equal zero.", "C) All processes acquire resources simultaneously.", "D) No process requests more than 1 resource."],
                "correct": 0,
                "exp": "A safe state guarantees the OS can allocate resources up to max claims for every process in some order without deadlocking."
            }
        ]

        # Select template by topic & index_offset
        if "graph" in topic_lower:
            tmpl = graph_templates[index_offset % len(graph_templates)]
        elif "dbms" in topic_lower or "sql" in topic_lower:
            tmpl = dbms_templates[index_offset % len(dbms_templates)]
        elif "operating" in topic_lower or "os" in topic_lower:
            tmpl = os_templates[index_offset % len(os_templates)]
        else:
            tmpl = {
                "title": f"{company} {topic} Pattern Challenge #{index_offset + 1}",
                "desc": f"Targeting {company} {difficulty} assessment ({topic}): Which algorithmic pattern guarantees optimal substructure resolution with minimal asymptotic space overhead?",
                "opts": ["A) Dynamic Programming with State Compression / Rolling Array", "B) Unconstrained Exponential Backtracking", "C) Linear Scan without State Tracking", "D) Random Selection without Invariants"],
                "correct": 0,
                "exp": "State compression reduces DP space from O(N^2) or O(N) to O(1) by storing only necessary previous boundary states."
            }

        title = tmpl["title"]
        desc = tmpl["desc"]
        opts = tmpl["opts"]
        correct_idx = tmpl["correct"]
        exp = tmpl["exp"]

        new_q = QuestionRecord(
            id=q_id,
            company=company,
            topic=topic,
            subtopic=sub_title,
            title=title,
            difficulty=difficulty,
            question_type="mcq",
            description=desc,
            options=opts,
            correct_option_index=correct_idx,
            explanation=exp
        )
        try:
            self.db.add(new_q)
            self.db.commit()
        except Exception:
            self.db.rollback()

        return {
            "id": q_id,
            "company": company,
            "topic": topic,
            "subtopic": sub_title,
            "title": title,
            "difficulty": difficulty,
            "question_type": "mcq",
            "description": desc,
            "starter_code": {},
            "options": opts,
            "correct_option_index": correct_idx,
            "explanation": exp,
            "test_cases_count": 0
        }

    def generate_assessment(
        self,
        user_id: int,
        title: str = "Full Placement Diagnostic Mock OA",
        target_role: str = "Software Development Engineer (SDE)",
        difficulty: str = "Medium",
        topic_distribution: Optional[Dict[str, int]] = None,
        duration_minutes: int = 45,
        target_company: Optional[str] = "Amazon",
        subject_focus: Optional[str] = "All Subjects",
        question_count: int = 10,
        use_dynamic_ai: bool = False,
        scheduled_topics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate a customized placement assessment session with 100% unique questions.
        Pulls from DB and falls back to dynamic synthesis without repeating items.
        """
        session_id = f"mock-oa-{uuid.uuid4().hex[:8]}"
        selected_questions = []
        used_ids = set()
        used_titles = set()

        company = target_company if (target_company and target_company != "All Companies") else "Amazon"

        duration_minutes = min(30, max(1, duration_minutes))
        if not question_count or question_count <= 0:
            question_count = duration_minutes
        else:
            question_count = min(30, max(1, question_count))

        def add_question_record(r):
            if r.id in used_ids or r.title in used_titles:
                return False
            opts = r.options if (r.options and len(r.options) >= 2) else [
                "A) Optimal state invariant satisfied",
                "B) Sub-optimal state invariant",
                "C) Boundary flaw state",
                "D) Time limit exceeded state"
            ]
            selected_questions.append({
                "id": r.id,
                "company": r.company or company,
                "topic": r.topic,
                "subtopic": r.subtopic or f"{r.topic} Invariants",
                "title": r.title,
                "difficulty": r.difficulty,
                "question_type": r.question_type or "mcq",
                "description": r.description,
                "starter_code": r.starter_code or {},
                "options": opts,
                "correct_option_index": r.correct_option_index if r.correct_option_index is not None else 0,
                "explanation": r.explanation or "Detailed step-by-step technical breakdown.",
                "test_cases_count": len(r.test_cases) if r.test_cases else 0
            })
            used_ids.add(r.id)
            used_titles.add(r.title)
            return True

        import random

        # Phase 1: Query exact matches (company + topic + difficulty)
        q1 = self.db.query(QuestionRecord)
        if target_company and target_company != "All Companies":
            q1 = q1.filter(QuestionRecord.company.ilike(f"%{target_company}%"))
        if subject_focus and subject_focus not in ["All Subjects", "All Topics", "All"]:
            q1 = q1.filter(QuestionRecord.topic.ilike(f"%{subject_focus}%"))
        if difficulty and difficulty not in ["All Difficulties", "Mixed", "Company Std"]:
            q1 = q1.filter(QuestionRecord.difficulty.ilike(f"%{difficulty}%"))

        matches1 = q1.all()
        random.shuffle(matches1)
        for r in matches1:
            if len(selected_questions) >= question_count:
                break
            add_question_record(r)

        # Phase 2: Relax company filter if more questions needed
        if len(selected_questions) < question_count:
            q2 = self.db.query(QuestionRecord)
            if subject_focus and subject_focus not in ["All Subjects", "All Topics", "All"]:
                q2 = q2.filter(QuestionRecord.topic.ilike(f"%{subject_focus}%"))
            if difficulty and difficulty not in ["All Difficulties", "Mixed", "Company Std"]:
                q2 = q2.filter(QuestionRecord.difficulty.ilike(f"%{difficulty}%"))

            matches2 = q2.all()
            random.shuffle(matches2)
            for r in matches2:
                if len(selected_questions) >= question_count:
                    break
                add_question_record(r)

        # Phase 3: Relax difficulty filter if more questions needed
        if len(selected_questions) < question_count:
            q3 = self.db.query(QuestionRecord)
            if subject_focus and subject_focus not in ["All Subjects", "All Topics", "All"]:
                q3 = q3.filter(QuestionRecord.topic.ilike(f"%{subject_focus}%"))

            matches3 = q3.all()
            random.shuffle(matches3)
            for r in matches3:
                if len(selected_questions) >= question_count:
                    break
                add_question_record(r)

        # Phase 4: Draw from entire database question bank if still needed
        if len(selected_questions) < question_count:
            all_recs = self.db.query(QuestionRecord).all()
            random.shuffle(all_recs)
            for r in all_recs:
                if len(selected_questions) >= question_count:
                    break
                add_question_record(r)

        # Phase 5: Synthesize distinct dynamic questions if needed
        offset = 0
        while len(selected_questions) < question_count:
            offset += 1
            curr_topic = subject_focus if (subject_focus and subject_focus not in ["All Subjects", "All Topics", "All"]) else "Graphs"
            syn_q = self.synthesize_dynamic_question(
                company=company,
                topic=curr_topic,
                difficulty=difficulty if difficulty not in ["All Difficulties", "Mixed", "Company Std"] else "Medium",
                index_offset=offset
            )
            if syn_q["id"] not in used_ids and syn_q["title"] not in used_titles:
                selected_questions.append(syn_q)
                used_ids.add(syn_q["id"])
                used_titles.add(syn_q["title"])

        selected_questions = selected_questions[:question_count]

        # Calculate actual topic breakdown
        topic_counts = {}
        for q in selected_questions:
            t = q["topic"]
            topic_counts[t] = topic_counts.get(t, 0) + 1

        assessment_record = AssessmentSession(
            id=session_id,
            user_id=user_id,
            title=title or f"{company} Placement Assessment ({subject_focus})",
            assessment_type="mock_oa",
            duration_minutes=duration_minutes,
            topic_breakdown={t: 0.0 for t in topic_counts.keys()},
            detailed_results=[],
            completed=False
        )
        self.db.add(assessment_record)
        self.db.commit()

        return {
            "session_id": session_id,
            "title": title or f"{company} Placement Assessment",
            "target_company": company,
            "target_role": target_role,
            "duration_minutes": duration_minutes,
            "total_questions": len(selected_questions),
            "topic_breakdown_target": topic_counts,
            "questions": selected_questions
        }

    def evaluate_assessment_submission(
        self,
        session_id: str,
        submissions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate full assessment submission list:
        [{ "question_id": "...", "answer": ..., "code_eval_result": {...} }]
        """
        session_obj = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        total_questions = len(submissions)
        if total_questions == 0:
            return {"score_percentage": 0.0, "topic_breakdown": {}}

        total_earned_score = 0.0
        max_possible_score = total_questions * 100.0
        topic_scores: Dict[str, List[float]] = {}
        detailed_evaluations = []

        for sub in submissions:
            q_id = sub.get("question_id")
            q_record = self.db.query(QuestionRecord).filter(QuestionRecord.id == q_id).first()
            topic = q_record.topic if q_record else "General"
            if topic not in topic_scores:
                topic_scores[topic] = []

            earned = 0.0
            verdict = "Incorrect"

            if q_record and q_record.question_type == "mcq":
                chosen = sub.get("selected_option_index")
                if chosen is not None and chosen == q_record.correct_option_index:
                    earned = 100.0
                    verdict = "Correct"
                else:
                    earned = 0.0
                    verdict = "Incorrect"
            elif q_record and q_record.question_type == "coding":
                eval_data = sub.get("code_eval_result", {})
                passed = eval_data.get("passed", 0)
                total_tc = eval_data.get("total", 1) or 1
                earned = (passed / total_tc) * 100.0
                verdict = "Accepted" if passed == total_tc else (f"Passed {passed}/{total_tc}")
            else:
                # Default credit based on submission presence
                earned = sub.get("score_override", 50.0)
                verdict = "Evaluated"

            topic_scores[topic].append(earned)
            total_earned_score += earned

            detailed_evaluations.append({
                "question_id": q_id,
                "topic": topic,
                "verdict": verdict,
                "score": earned,
                "title": q_record.title if q_record else "Assessment Item"
            })

        overall_percentage = round((total_earned_score / max_possible_score) * 100.0, 1)
        final_topic_breakdown = {
            t: round(sum(scores) / len(scores), 1) for t, scores in topic_scores.items()
        }

        if session_obj:
            session_obj.total_score = total_earned_score
            session_obj.max_score = max_possible_score
            session_obj.score_percentage = overall_percentage
            session_obj.topic_breakdown = final_topic_breakdown
            session_obj.detailed_results = detailed_evaluations
            session_obj.completed = True
            self.db.commit()

        return {
            "session_id": session_id,
            "overall_score_percentage": overall_percentage,
            "topic_breakdown": final_topic_breakdown,
            "detailed_evaluations": detailed_evaluations,
            "readiness_delta": round(overall_percentage * 0.15, 1)
        }

if __name__ == "__main__":
    from backend.database.connection import SessionLocal
    from backend.database.init_db import init_database

    init_database()
    db = SessionLocal()
    tool = MockAssessmentTool(db)

    print("=" * 70)
    print("MANDATORY TOOL 3: MOCK PLACEMENT ASSESSMENT TOOL")
    print("=" * 70)

    print("\n--- 1. GENERATING MULTI-TOPIC SIMULATED PLACEMENT OA ---")
    assessment = tool.generate_assessment(
        user_id=1,
        title="Software Engineering Placement Mock Assessment",
        duration_minutes=45
    )

    print(f"Session ID:       {assessment['session_id']}")
    print(f"Target Role:      {assessment['target_role']}")
    print(f"Duration:         {assessment['duration_minutes']} minutes")
    print(f"Total Questions:  {assessment['total_questions']}")
    for idx, q in enumerate(assessment['questions']):
        print(f"  [{idx + 1}] {q['title']} ({q['topic']} - {q['difficulty']})")

    print("\n--- 2. DETERMINISTIC ASSESSMENT EVALUATION ---")
    mock_submissions = [
        {"question_id": q["id"], "selected_option_index": 1, "code_eval_result": {"passed": 4, "total": 4}}
        for q in assessment["questions"]
    ]
    eval_result = tool.evaluate_assessment_submission(assessment["session_id"], mock_submissions)

    print(f"Overall Score:    {eval_result['overall_score_percentage']}%")
    print(f"Readiness Boost:  +{eval_result['readiness_delta']}%")
    print("Topic Breakdown:")
    for t, s in eval_result['topic_breakdown'].items():
        print(f"  - {t:<22}: {s}%")
    print("=" * 70)
    db.close()

