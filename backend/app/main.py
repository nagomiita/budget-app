from fastapi import FastAPI
from api import transactions
from core.database import engine, Base

# データベーステーブルの作成
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ルーティング
app.include_router(transactions.router, prefix="/api")
