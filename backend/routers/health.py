"""
Health check router
"""

from fastapi import APIRouter
from datetime import datetime
import psutil
import platform

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint"""
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "system": {
                "platform": platform.system(),
                "python_version": platform.python_version(),
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
            },
            "services": {
                "api": "running",
                "arbitrage_engine": "active",
                "ai_agents": "monitoring",
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }
