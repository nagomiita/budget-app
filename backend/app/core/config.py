import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # DB接続のための環境変数
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")

    class Config:
        env_file = ".env"

settings = Settings()
