"""
Personal AI Knowledge Management System (CortexPKM) Runner
Author: Prince Kumar (B.Tech CSE IoT, Jain University)
GitHub: princekumar993408-stack
"""

import sys
import os
import argparse
import subprocess

def main():
    parser = argparse.ArgumentParser(description="CortexPKM Runner")
    parser.add_argument("--test", action="store_true", help="Run backend test suite")
    parser.add_argument("--host", default="0.0.0.0", help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--reload", action="store_true", default=True, help="Enable auto-reload")
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")

    if args.test:
        print("Running CortexPKM Backend Test Suite via pytest...")
        res = subprocess.run(["pytest", "-v"], cwd=backend_dir)
        sys.exit(res.returncode)

    print("=" * 68)
    print("  🧠 CortexPKM: Personal AI Knowledge Management Platform")
    print("  Author: Prince Kumar (princekumar993408-stack)")
    print(f"  Starting FastAPI server on http://{args.host}:{args.port}")
    print("=" * 68)

    import uvicorn
    sys.path.insert(0, backend_dir)
    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=args.reload)

if __name__ == "__main__":
    main()
