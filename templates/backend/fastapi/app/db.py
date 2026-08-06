"""Database driver abstraction, selected via DB_DRIVER at runtime."""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from app.mark_setup import mark

DB_DRIVER = os.getenv("DB_DRIVER", "{{DB_DRIVER}}")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_FILE = DATA_DIR / "app-info.json"

_sa_engine = None
_sa_session_factory = None
_sa_model = None

_motor_client = None
_motor_db = None


def _ensure_file_store() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("null", encoding="utf-8")


def _parse_created_at(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def _init_sqlalchemy() -> None:
    global _sa_engine, _sa_session_factory, _sa_model
    if _sa_engine is not None:
        return

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.models import AppInfo, Base

    database_url = os.getenv("DATABASE_URL", "")
    _sa_engine = create_engine(database_url, pool_pre_ping=True)
    Base.metadata.create_all(_sa_engine)
    _sa_session_factory = sessionmaker(bind=_sa_engine)
    _sa_model = AppInfo
    mark("migrated")


def _init_motor() -> None:
    global _motor_client, _motor_db
    if _motor_client is not None:
        return

    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/{{DB_NAME}}")
    _motor_client = AsyncIOMotorClient(mongo_uri)
    _motor_db = _motor_client.get_default_database()


async def connect() -> None:
    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
    elif DB_DRIVER == "motor":
        _init_motor()
    else:
        _ensure_file_store()


async def check_database() -> bool:
    try:
        if DB_DRIVER == "sqlalchemy":
            _init_sqlalchemy()
            from sqlalchemy import text

            with _sa_engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True

        if DB_DRIVER == "motor":
            _init_motor()
            await _motor_db.command("ping")
            return True

        _ensure_file_store()
        return True
    except Exception:
        return False


def _row_to_dict(row: Any) -> dict:
    return {
        "id": row.id,
        "projectName": row.projectName,
        "frontend": row.frontend,
        "backend": row.backend,
        "database": row.database,
        "orm": row.orm,
        "uiFramework": row.uiFramework,
        "authentication": row.authentication,
        "docker": row.docker,
        "createdAt": row.createdAt.isoformat() if row.createdAt else None,
    }


async def get_app_info() -> Optional[dict]:
    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
        with _sa_session_factory() as session:
            row = session.query(_sa_model).order_by(_sa_model.createdAt.asc()).first()
            return _row_to_dict(row) if row else None

    if DB_DRIVER == "motor":
        _init_motor()
        doc = await _motor_db.app_info.find_one(sort=[("createdAt", 1)])
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc

    _ensure_file_store()
    raw = DATA_FILE.read_text(encoding="utf-8")
    return json.loads(raw)


async def seed_if_empty(seed_data: dict) -> Optional[dict]:
    existing = await get_app_info()
    if existing:
        mark("seeded")
        return existing

    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
        with _sa_session_factory() as session:
            row = _sa_model(
                id=str(uuid.uuid4()),
                projectName=seed_data["projectName"],
                frontend=seed_data["frontend"],
                backend=seed_data["backend"],
                database=seed_data["database"],
                orm=seed_data["orm"],
                uiFramework=seed_data["uiFramework"],
                authentication=seed_data["authentication"],
                docker=seed_data["docker"],
                createdAt=_parse_created_at(seed_data["createdAt"]),
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            mark("seeded")
            return _row_to_dict(row)

    if DB_DRIVER == "motor":
        _init_motor()
        doc = dict(seed_data)
        result = await _motor_db.app_info.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        mark("seeded")
        return doc

    _ensure_file_store()
    record = {"id": "seed-1"}
    record.update(seed_data)
    DATA_FILE.write_text(json.dumps(record, indent=2), encoding="utf-8")
    mark("seeded")
    return record
