from api import transactions
from core.database import Base, SessionLocal, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from seeds.category import seed_categories

# データベーステーブルの作成
Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーティング
app.include_router(transactions.router, prefix="/api")

db = SessionLocal()
try:
    seed_categories(db)
except Exception as e:
    # エラーをログに出力する場合
    print(f"Error seeding categories: {e}")
finally:
    db.close()
