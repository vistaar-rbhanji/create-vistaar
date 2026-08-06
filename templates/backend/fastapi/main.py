import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import connect, seed_if_empty
from app.routes import app_info, health, setup_status
from app.seed_data import get_seed_data

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect()
        await seed_if_empty(get_seed_data())
        print("[db] ready")
    except Exception as error:
        print("[db] startup error: " + str(error))
    yield


app = FastAPI(title="{{PROJECT_NAME}}", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(app_info.router, prefix="/api/app-info", tags=["app-info"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(setup_status.router, prefix="/api/setup-status", tags=["setup-status"])
