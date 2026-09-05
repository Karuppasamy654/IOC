from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ReasoningRecord(BaseModel):
    agent_name: str
    observation: str
    evidence: List[str] = Field(default_factory=list)
    decision: str
    action: str
    tool_called: Optional[str] = None
    tool_result_summary: Optional[str] = None
    memory_retrieved_summary: Optional[str] = None
    confidence: float = 0.90
    outcome_summary: Optional[str] = None
    next_agent: Optional[str] = None

class AgentState(BaseModel):
    user_id: int
    session_id: str
    student_profile: Dict[str, Any] = Field(default_factory=dict)
    target_role: str = "Software Development Engineer (SDE)"
    competency_map: List[Dict[str, Any]] = Field(default_factory=list)
    critical_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    current_plan: Dict[str, Any] = Field(default_factory=dict)
    current_question: Dict[str, Any] = Field(default_factory=dict)
    submitted_solution: Optional[str] = None
    tool_execution_result: Dict[str, Any] = Field(default_factory=dict)
    evaluation_evidence: Dict[str, Any] = Field(default_factory=dict)
    diagnosis_report: Dict[str, Any] = Field(default_factory=dict)
    intervention: Dict[str, Any] = Field(default_factory=dict)
    memory_context: Dict[str, Any] = Field(default_factory=dict)
    adapted_plan: Dict[str, Any] = Field(default_factory=dict)
    execution_traces: List[ReasoningRecord] = Field(default_factory=list)
    current_step: int = 1
    status: str = "initialized"
