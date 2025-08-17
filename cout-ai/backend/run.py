#!/usr/bin/env python3
"""
CoutAI Backend Server Runner

This script starts the FastAPI backend server for the CoutAI application.
Make sure to set up your environment variables before running.
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("🚀 Starting CoutAI Backend Server...")
    print(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔄 Auto-reload: Enabled")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    ) 