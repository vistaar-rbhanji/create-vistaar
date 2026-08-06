import os

from fastapi import APIRouter

from app.db import DB_DRIVER, check_database, get_app_info
from app.mark_setup import is_marked
from app.seed_data import get_seed_data

router = APIRouter()


def _is_database_configured(driver: str) -> bool:
    if not driver or driver == "file":
        return True
    if driver in ("motor", "mongoose"):
        return bool(os.getenv("MONGODB_URI"))
    return bool(os.getenv("DATABASE_URL"))


@router.get("")
async def read_setup_status():
    seed_data = get_seed_data()
    database_engine = "{{DATABASE}}"
    database_required = database_engine != "None"

    database_configured = (not database_required) or _is_database_configured(DB_DRIVER)
    database_connected = await check_database() if database_required else True

    try:
        app_info = await get_app_info()
    except Exception:
        app_info = None

    # MongoDB (motor) and the file store need no explicit migration step.
    migration_not_applicable = (not database_required) or DB_DRIVER in ("file", "motor")
    migration_completed = migration_not_applicable or is_marked("migrated") or bool(app_info)

    seed_completed = bool(app_info) or is_marked("seeded")

    if not database_required:
        setup_complete = seed_completed
    else:
        setup_complete = (
            database_configured
            and database_connected
            and migration_completed
            and seed_completed
        )

    return {
        "projectGenerated": True,
        "projectName": (app_info or {}).get("projectName", seed_data["projectName"]),
        "databaseEngine": database_engine,
        "databaseRequired": database_required,
        "databaseConfigured": database_configured,
        "databaseConnected": database_connected,
        "migrationCompleted": migration_completed,
        "seedCompleted": seed_completed,
        "backendRunning": True,
        "frontendRunning": True,
        "dockerEnabled": seed_data["docker"] == "Enabled",
        "authenticationEnabled": seed_data["authentication"] == "Enabled",
        "setupComplete": setup_complete,
        "dbName": "{{DB_NAME}}",
        "commands": {
            "createDb": "createdb {{DB_NAME}}",
            "createDbSql": "CREATE DATABASE {{DB_NAME}};",
            "migrate": "npm run migrate",
            "seed": "npm run seed",
            "setup": "npm run setup",
            "docker": "docker compose up -d",
            "doctor": "npm run doctor",
        },
    }
