#!/usr/bin/env python3
"""
🚀 ATOM Backend Startup Script
The Ultimate Arbitrage System - Backend Launcher
"""

import uvicorn
import sys
import os

def main():
    print("🚀 Starting ATOM Backend...")
    print("⚡ The Ultimate Arbitrage System")
    print("🔗 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True,
            reload_dirs=["./"],
            reload_includes=["*.py"]
        )
    except KeyboardInterrupt:
        print("\n🛑 ATOM Backend shutting down...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
