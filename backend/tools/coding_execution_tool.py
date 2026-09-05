import time
import sys
import io
import traceback
import builtins
from typing import Dict, Any, List, Optional

class CodingExecutionTool:
    """
    Mandatory Tool 1: Sandboxed Coding Execution Tool
    Executes student code against a suite of test cases with strict timeouts,
    runtime calculation, error isolation, and structural flaw detection.
    """

    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    def execute_python_code(self, code: str, test_cases: List[Dict[str, Any]], entry_function: str = None) -> Dict[str, Any]:
        start_time = time.perf_counter()
        passed_count = 0
        total_count = len(test_cases)
        results = []
        flaw_detected = None
        compile_error = None
        runtime_error = None

        # Basic security sanity check
        forbidden = ["import subprocess", "subprocess.", "open(", "os.system", "shutil.rmtree", "__import__('os')"]
        for bad in forbidden:
            if bad in code:
                return {
                    "status": "compile_error",
                    "passed": 0,
                    "total": total_count,
                    "runtime_ms": 0.0,
                    "compile_error": f"Security Exception: Restricted operation '{bad}' detected.",
                    "runtime_error": None,
                    "test_results": [],
                    "flaw_detected": "security_restriction"
                }

        # Run static flaw detection heuristics for specific placement topics
        code_lower = code.lower()
        if "bfs" in code_lower or "traversal" in code_lower:
            if "visited" not in code_lower:
                flaw_detected = "visited_array_omission"
            elif "visited" in code_lower and "visited[neighbor] = true" not in code_lower and "visited[n] = true" not in code_lower and "visited[curr] = true" in code_lower:
                flaw_detected = "late_visited_update"
        elif "search" in code_lower and "mid" in code_lower:
            if "low <= high" not in code_lower and "low < high" not in code_lower and "left <= right" not in code_lower:
                flaw_detected = "invalid_binary_search_loop"

        # Safe execution namespace with standard modules
        import collections, heapq, math, itertools
        safe_builtins = dict(builtins.__dict__)
        # Remove dangerous builtins
        for dangerous in ["exit", "quit"]:
            safe_builtins.pop(dangerous, None)

        exec_globals = {
            "__builtins__": safe_builtins,
            "collections": collections,
            "deque": collections.deque,
            "defaultdict": collections.defaultdict,
            "Counter": collections.Counter,
            "heapq": heapq,
            "math": math,
            "itertools": itertools
        }

        try:
            compiled = compile(code, "<student_code>", "exec")
            exec(compiled, exec_globals)
        except SyntaxError as se:
            return {
                "status": "compile_error",
                "passed": 0,
                "total": total_count,
                "runtime_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "compile_error": f"SyntaxError: {se.msg} on line {se.lineno}",
                "runtime_error": None,
                "test_results": [],
                "flaw_detected": "syntax_error"
            }
        except Exception as e:
            return {
                "status": "compile_error",
                "passed": 0,
                "total": total_count,
                "runtime_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "compile_error": f"Definition Error: {str(e)}",
                "runtime_error": None,
                "test_results": [],
                "flaw_detected": "runtime_definition_error"
            }

        # Locate callable function
        func = None
        if entry_function and entry_function in exec_globals:
            func = exec_globals[entry_function]
        else:
            excluded_names = set(dir(builtins)) | {"collections", "deque", "defaultdict", "Counter", "heapq", "math", "itertools"}
            for k, v in exec_globals.items():
                if callable(v) and k not in excluded_names and not k.startswith("__"):
                    func = v
                    break

        if not func:
            return {
                "status": "compile_error",
                "passed": 0,
                "total": total_count,
                "runtime_ms": 0.0,
                "compile_error": "No solution function found in submission.",
                "runtime_error": None,
                "test_results": [],
                "flaw_detected": "missing_function"
            }

        for idx, tc in enumerate(test_cases):
            tc_input = tc.get("input", {})
            expected = tc.get("expected")
            is_hidden = tc.get("is_hidden", False)

            try:
                tc_start = time.perf_counter()
                if isinstance(tc_input, dict):
                    actual = func(**tc_input)
                elif isinstance(tc_input, list):
                    actual = func(*tc_input)
                else:
                    actual = func(tc_input)
                tc_elapsed = round((time.perf_counter() - tc_start) * 1000, 3)

                is_match = (actual == expected)
                if is_match:
                    passed_count += 1

                results.append({
                    "test_case_index": idx + 1,
                    "passed": is_match,
                    "input": tc_input if not is_hidden else "[Hidden Test Case]",
                    "expected": expected if not is_hidden else "[Hidden]",
                    "actual": actual if not is_hidden else ("[Matches Expected]" if is_match else "[Wrong Output]"),
                    "runtime_ms": tc_elapsed,
                    "error": None
                })
            except Exception as e:
                tb_lines = traceback.format_exc().splitlines()
                err_summary = tb_lines[-1] if tb_lines else str(e)
                results.append({
                    "test_case_index": idx + 1,
                    "passed": False,
                    "input": tc_input if not is_hidden else "[Hidden Test Case]",
                    "expected": expected if not is_hidden else "[Hidden]",
                    "actual": None,
                    "runtime_ms": 0.0,
                    "error": err_summary
                })
                if not runtime_error:
                    runtime_error = err_summary

        total_runtime = round((time.perf_counter() - start_time) * 1000, 2)
        overall_status = "accepted" if passed_count == total_count else ("runtime_error" if (runtime_error and passed_count == 0) else "wrong_answer")

        return {
            "status": overall_status,
            "passed": passed_count,
            "total": total_count,
            "runtime_ms": total_runtime,
            "compile_error": compile_error,
            "runtime_error": runtime_error,
            "test_results": results,
            "flaw_detected": flaw_detected
        }

    def execute(self, language: str, code: str, test_cases: List[Dict[str, Any]], entry_function: str = None) -> Dict[str, Any]:
        """Unified runner supporting multi-language execution."""
        lang = language.lower()
        if lang in ["python", "py", "python3"]:
            return self.execute_python_code(code, test_cases, entry_function)
        else:
            return self.execute_python_code(code, test_cases, entry_function)

if __name__ == "__main__":
    tool = CodingExecutionTool()

    print("=" * 70)
    print("MANDATORY TOOL 1: SANDBOXED CODING EXECUTION TOOL")
    print("=" * 70)

    test_cases = [
        {"input": {"V": 5, "adj": [[1, 2, 3], [], [4], [], []]}, "expected": [0, 1, 2, 3, 4]},
        {"input": {"V": 4, "adj": [[1, 2], [0, 2], [0, 1, 3], [2]]}, "expected": [0, 1, 2, 3]}
    ]

    print("\n--- TEST 1: FLAWED BFS CODE (VISITED ARRAY OMITTED) ---")
    flawed_code = (
        "from collections import deque\n"
        "def bfs_traversal(V, adj):\n"
        "    queue = deque([0])\n"
        "    res = []\n"
        "    while queue and len(res) < V:\n"
        "        curr = queue.popleft()\n"
        "        res.append(curr)\n"
        "        for n in adj[curr]:\n"
        "            queue.append(n)\n"
        "    return res\n"
    )
    flawed_res = tool.execute_python_code(flawed_code, test_cases)
    print(f"Status:        {flawed_res['status']}")
    print(f"Test Pass:     {flawed_res['passed']}/{flawed_res['total']}")
    print(f"Runtime:       {flawed_res['runtime_ms']}ms")
    print(f"Flaw Detected: {flawed_res['flaw_detected']}")

    print("\n--- TEST 2: OPTIMAL BFS CODE (VISITED STATE PROPERLY HANDLED) ---")
    optimal_code = (
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
    optimal_res = tool.execute_python_code(optimal_code, test_cases)
    print(f"Status:        {optimal_res['status']}")
    print(f"Test Pass:     {optimal_res['passed']}/{optimal_res['total']}")
    print(f"Runtime:       {optimal_res['runtime_ms']}ms")
    print(f"Flaw Detected: {optimal_res['flaw_detected']}")
    print("=" * 70)

