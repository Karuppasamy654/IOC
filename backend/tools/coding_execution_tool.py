import time
import sys
import json
import subprocess
import builtins
import os
from typing import Dict, Any, List, Optional

RUNNER_SCRIPT = """
import sys
import json
import builtins
import collections
from collections import deque, defaultdict, Counter
import heapq
import math
import itertools

try:
    raw_input = sys.stdin.read()
    payload = json.loads(raw_input)
except Exception as e:
    print(json.dumps({"error_type": "payload_error", "message": str(e)}))
    sys.exit(0)

code = payload.get("code", "")
test_cases = payload.get("test_cases", [])
entry_func_name = payload.get("entry_function")

safe_builtins = dict(builtins.__dict__)
for dangerous in ["exit", "quit", "eval", "exec", "open", "input"]:
    safe_builtins.pop(dangerous, None)

exec_globals = {
    "__builtins__": safe_builtins,
    "collections": collections,
    "deque": deque,
    "defaultdict": defaultdict,
    "Counter": Counter,
    "heapq": heapq,
    "math": math,
    "itertools": itertools
}

try:
    compiled = compile(code, "<student_code>", "exec")
    exec(compiled, exec_globals)
except SyntaxError as se:
    print(json.dumps({"error_type": "syntax", "message": f"SyntaxError: {se.msg} on line {se.lineno}"}))
    sys.exit(0)
except Exception as e:
    print(json.dumps({"error_type": "compile", "message": f"Definition Error: {str(e)}"}))
    sys.exit(0)

func = None
if entry_func_name and entry_func_name in exec_globals:
    func = exec_globals[entry_func_name]
else:
    excluded = set(dir(builtins)) | {"collections", "deque", "defaultdict", "Counter", "heapq", "math", "itertools"}
    for k, v in exec_globals.items():
        if callable(v) and k not in excluded and not k.startswith("__"):
            func = v
            break

if not func:
    print(json.dumps({"error_type": "missing_func", "message": "No solution function found in submission."}))
    sys.exit(0)

results = []
passed_count = 0
runtime_error_msg = None

for idx, tc in enumerate(test_cases):
    tc_input = tc.get("input", {})
    expected = tc.get("expected")
    is_hidden = tc.get("is_hidden", False)

    try:
        if isinstance(tc_input, dict):
            actual = func(**tc_input)
        elif isinstance(tc_input, list):
            actual = func(*tc_input)
        else:
            actual = func(tc_input)

        is_match = (actual == expected)
        if is_match:
            passed_count += 1

        results.append({
            "test_case_index": idx + 1,
            "passed": is_match,
            "input": tc_input if not is_hidden else "[Hidden Test Case]",
            "expected": expected if not is_hidden else "[Hidden]",
            "actual": actual if not is_hidden else ("[Matches Expected]" if is_match else "[Wrong Output]"),
            "error": None
        })
    except Exception as e:
        err_str = str(e) or type(e).__name__
        results.append({
            "test_case_index": idx + 1,
            "passed": False,
            "input": tc_input if not is_hidden else "[Hidden Test Case]",
            "expected": expected if not is_hidden else "[Hidden]",
            "actual": None,
            "error": err_str
        })
        if not runtime_error_msg:
            runtime_error_msg = err_str

print(json.dumps({
    "passed": passed_count,
    "total": len(test_cases),
    "test_results": results,
    "runtime_error": runtime_error_msg
}))
"""

class CodingExecutionTool:
    """
    Mandatory Tool 1: Sandboxed Coding Execution Tool
    Executes student code inside an isolated subprocess with strict 3.0s timeouts,
    runtime calculation, error isolation, and structural flaw detection.
    """

    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    def _static_flaw_analysis(self, code: str) -> Optional[str]:
        code_lower = code.lower()
        if "bfs" in code_lower or "traversal" in code_lower:
            if "visited" not in code_lower:
                return "visited_array_omission"
            elif "visited" in code_lower and "visited[neighbor] = true" not in code_lower and "visited[n] = true" not in code_lower and "visited[curr] = true" in code_lower:
                return "late_visited_update"
        elif "search" in code_lower and "mid" in code_lower:
            if "low <= high" not in code_lower and "low < high" not in code_lower and "left <= right" not in code_lower:
                return "invalid_binary_search_loop"
        return None

    def execute_python_code(self, code: str, test_cases: List[Dict[str, Any]], entry_function: str = None) -> Dict[str, Any]:
        start_time = time.perf_counter()
        total_count = len(test_cases)
        flaw_detected = self._static_flaw_analysis(code)

        # Basic security sanity check
        forbidden = ["import subprocess", "subprocess.", "open(", "os.system", "shutil.rmtree", "__import__('os')"]
        for bad in forbidden:
            if bad in code:
                return {
                    "status": "COMPILATION ERROR",
                    "status_code": "compile_error",
                    "passed": 0,
                    "total": total_count,
                    "runtime_ms": 0.0,
                    "compile_error": f"Security Exception: Restricted operation '{bad}' detected.",
                    "runtime_error": None,
                    "test_results": [],
                    "flaw_detected": "security_restriction"
                }

        payload = {
            "code": code,
            "test_cases": test_cases,
            "entry_function": entry_function
        }

        try:
            sandbox_env = os.environ.copy()
            # Remove application secrets from subprocess environment
            for secret_key in ["JWT_SECRET", "DATABASE_URL", "API_KEY", "SECRET"]:
                sandbox_env.pop(secret_key, None)

            proc = subprocess.run(
                [sys.executable, "-c", RUNNER_SCRIPT],
                input=json.dumps(payload),
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
                env=sandbox_env
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if proc.returncode != 0 and proc.stderr:
                return {
                    "status": "RUNTIME ERROR",
                    "status_code": "runtime_error",
                    "passed": 0,
                    "total": total_count,
                    "runtime_ms": elapsed_ms,
                    "compile_error": None,
                    "runtime_error": proc.stderr.strip()[:300],
                    "test_results": [],
                    "flaw_detected": flaw_detected or "runtime_crash"
                }

            out_text = proc.stdout.strip()
            if not out_text:
                return {
                    "status": "COMPILATION ERROR",
                    "status_code": "compile_error",
                    "passed": 0,
                    "total": total_count,
                    "runtime_ms": elapsed_ms,
                    "compile_error": "Subprocess produced no output.",
                    "runtime_error": None,
                    "test_results": [],
                    "flaw_detected": flaw_detected
                }

            data = json.loads(out_text)
            if "error_type" in data:
                return {
                    "status": "COMPILATION ERROR",
                    "status_code": "compile_error",
                    "passed": 0,
                    "total": total_count,
                    "runtime_ms": elapsed_ms,
                    "compile_error": data.get("message"),
                    "runtime_error": None,
                    "test_results": [],
                    "flaw_detected": flaw_detected or "syntax_error"
                }

            passed_count = data.get("passed", 0)
            runtime_err = data.get("runtime_error")

            if passed_count == total_count:
                status_str = "ACCEPTED"
                status_code = "accepted"
            elif runtime_err and passed_count == 0:
                status_str = "RUNTIME ERROR"
                status_code = "runtime_error"
            else:
                status_str = "WRONG ANSWER"
                status_code = "wrong_answer"

            return {
                "status": status_str,
                "status_code": status_code,
                "passed": passed_count,
                "total": total_count,
                "runtime_ms": elapsed_ms,
                "compile_error": None,
                "runtime_error": runtime_err,
                "test_results": data.get("test_results", []),
                "flaw_detected": flaw_detected
            }

        except subprocess.TimeoutExpired:
            return {
                "status": "TIME LIMIT EXCEEDED",
                "status_code": "time_limit_exceeded",
                "passed": 0,
                "total": total_count,
                "runtime_ms": round(self.timeout_seconds * 1000, 2),
                "compile_error": None,
                "runtime_error": f"Execution exceeded maximum configured limit ({self.timeout_seconds}s). Infinite loop or TLE.",
                "test_results": [],
                "flaw_detected": flaw_detected or "infinite_loop"
            }
        except Exception as e:
            return {
                "status": "RUNTIME ERROR",
                "status_code": "runtime_error",
                "passed": 0,
                "total": total_count,
                "runtime_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "compile_error": None,
                "runtime_error": str(e),
                "test_results": [],
                "flaw_detected": flaw_detected
            }

    def execute(self, language: str, code: str, test_cases: List[Dict[str, Any]], entry_function: str = None) -> Dict[str, Any]:
        return self.execute_python_code(code, test_cases, entry_function)

if __name__ == "__main__":
    tool = CodingExecutionTool()

    print("=" * 70)
    print("SANDBOXED CODING EXECUTION TOOL - SUBPROCESS STDIN RUNNER")
    print("=" * 70)

    test_cases = [
        {"input": {"V": 5, "adj": [[1, 2, 3], [], [4], [], []]}, "expected": [0, 1, 2, 3, 4]},
        {"input": {"V": 4, "adj": [[1, 2], [0, 2], [0, 1, 3], [2]]}, "expected": [0, 1, 2, 3]}
    ]

    code = (
        "from collections import deque\n"
        "def bfs_traversal(V, adj):\n"
        "    visited = [False] * V\n"
        "    queue = deque([0])\n"
        "    visited[0] = True\n"
        "    res = []\n"
        "    while queue:\n"
        "        curr = queue.popleft()\n"
        "        res.append(curr)\n"
        "        for n in adj[curr]:\n"
        "            if not visited[n]:\n"
        "                visited[n] = True\n"
        "                queue.append(n)\n"
        "    return res\n"
    )
    res = tool.execute("python", code, test_cases)
    print("Execution Result:", json.dumps(res, indent=2))
    print("=" * 70)
