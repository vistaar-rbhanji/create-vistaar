"""FastAPI dependency stub — protect routes after you implement verify_token."""

from fastapi import HTTPException


async def require_auth():
    raise HTTPException(status_code=501, detail="require_auth not implemented yet")
