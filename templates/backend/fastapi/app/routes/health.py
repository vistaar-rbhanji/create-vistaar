from fastapi import APIRouter

from app.db import check_database

router = APIRouter()


@router.get("")
async def read_health():
    connected = await check_database()
    database = "connected" if connected else "disconnected"

    return {
        "server": "running",
        "database": database,
        "status": "healthy" if connected else "degraded",
        "api": "working",
    }
