from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "EduGuide AI"
    api_prefix: str = "/api/v1"
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    enable_vector_store: bool = False
    college_data_path: str = "../../data/College_data.csv"
    chroma_persist_dir: str = "./storage/chroma"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def backend_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def resolved_data_path(self) -> Path:
        candidate = Path(self.college_data_path)
        if candidate.is_absolute() and candidate.exists():
            return candidate

        options = [
            (self.backend_root / candidate).resolve(),
            (self.backend_root / "data" / "College_data.csv").resolve(),
            (self.backend_root.parent.parent / "data" / "College_data.csv").resolve(),
        ]
        for option in options:
            if option.exists():
                return option
        return options[0]

    @property
    def resolved_chroma_dir(self) -> Path:
        candidate = Path(self.chroma_persist_dir)
        if candidate.is_absolute():
            return candidate
        return (self.backend_root / candidate).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
