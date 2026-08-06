"""Filesystem markers the Setup Wizard uses to detect completed steps."""

from pathlib import Path

MARK_DIR = Path(__file__).resolve().parent.parent / ".kickstack"


def mark(name: str) -> None:
    MARK_DIR.mkdir(parents=True, exist_ok=True)
    (MARK_DIR / name).write_text("1", encoding="utf-8")


def is_marked(name: str) -> bool:
    return (MARK_DIR / name).exists()
