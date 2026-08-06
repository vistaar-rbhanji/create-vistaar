from fastapi import APIRouter, HTTPException

from app.db import get_app_info

router = APIRouter()


@router.get("")
async def read_app_info():
    app_info = await get_app_info()
    if not app_info:
        raise HTTPException(status_code=404, detail="AppInfo has not been seeded yet.")
    return app_info
