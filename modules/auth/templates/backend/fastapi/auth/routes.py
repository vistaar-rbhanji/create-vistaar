"""Auth API stubs for {{PROJECT_NAME}}. No real JWT verification yet."""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login():
    return {"message": "Auth login not implemented yet"}


@router.post("/register")
def register():
    return {"message": "Auth register not implemented yet"}


@router.get("/me")
def me():
    return {"message": "Auth session not implemented yet"}


@router.post("/logout")
def logout():
    return {"message": "Auth logout not implemented yet"}
