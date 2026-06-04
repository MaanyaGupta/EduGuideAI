from functools import lru_cache
from pathlib import Path
import re

import pandas as pd

from app.core.config import get_settings
from app.models.schemas import College


NUMERIC_COLUMNS = [
    "rating",
    "academic",
    "accommodation",
    "faculty",
    "infrastructure",
    "placement",
    "social_life",
]


def _fee_to_int(value: object) -> int | None:
    if pd.isna(value):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "na", "n/a", "-"}:
        return None
    digits = re.sub(r"[^0-9]", "", text)
    return int(digits) if digits else None


def _clean_text(value: object) -> str:
    if pd.isna(value):
        return "Unknown"
    text = re.sub(r"\s+", " ", str(value).strip())
    return text if text else "Unknown"


class CollegeDataService:
    def __init__(self, data_path: Path | None = None) -> None:
        self.data_path = data_path or get_settings().resolved_data_path

    def load_dataframe(self) -> pd.DataFrame:
        if not self.data_path.exists():
            raise FileNotFoundError(f"College dataset not found at {self.data_path}")

        df = pd.read_csv(self.data_path)
        df = df.rename(
            columns={
                "College_Name": "college_name",
                "State": "state",
                "Stream": "stream",
                "UG_fee": "ug_fee",
                "PG_fee": "pg_fee",
                "Rating": "rating",
                "Academic": "academic",
                "Accommodation": "accommodation",
                "Faculty": "faculty",
                "Infrastructure": "infrastructure",
                "Placement": "placement",
                "Social_Life": "social_life",
            }
        )

        for column in ["college_name", "state", "stream"]:
            df[column] = df[column].map(_clean_text)

        df["ug_fee"] = df["ug_fee"].map(_fee_to_int)
        df["pg_fee"] = df["pg_fee"].map(_fee_to_int)

        for column in NUMERIC_COLUMNS:
            df[column] = pd.to_numeric(df[column], errors="coerce")
            df[column] = df[column].fillna(df[column].median()).round(2)

        df["id"] = range(1, len(df) + 1)
        df["profile"] = df.apply(self._profile_from_row, axis=1)
        return df[
            [
                "id",
                "college_name",
                "state",
                "stream",
                "ug_fee",
                "pg_fee",
                *NUMERIC_COLUMNS,
                "profile",
            ]
        ]

    @staticmethod
    def _profile_from_row(row: pd.Series) -> str:
        ug_fee = f"UG fee INR {int(row.ug_fee):,}" if pd.notna(row.ug_fee) else "UG fee unavailable"
        pg_fee = f"PG fee INR {int(row.pg_fee):,}" if pd.notna(row.pg_fee) else "PG fee unavailable"
        return (
            f"{row.college_name} is a {row.stream} college in {row.state}. "
            f"Rating {row.rating}/10, placement {row.placement}/10, faculty {row.faculty}/10, "
            f"infrastructure {row.infrastructure}/10, academic {row.academic}/10. "
            f"{ug_fee}; {pg_fee}."
        )

    def as_models(self) -> list[College]:
        df = self.load_dataframe()
        records = []
        for record in df.to_dict(orient="records"):
            records.append({key: (None if pd.isna(value) else value) for key, value in record.items()})
        return [College.model_validate(record) for record in records]


@lru_cache(maxsize=1)
def get_colleges() -> tuple[College, ...]:
    return tuple(CollegeDataService().as_models())


@lru_cache(maxsize=1)
def get_dataframe() -> pd.DataFrame:
    return CollegeDataService().load_dataframe()
