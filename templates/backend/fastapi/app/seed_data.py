import json
from pathlib import Path

SEED_DATA_PATH = Path(__file__).resolve().parent / "seed_data.json"


def get_seed_data() -> dict:
    return json.loads(SEED_DATA_PATH.read_text(encoding="utf-8"))
