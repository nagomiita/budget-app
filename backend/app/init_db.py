from sqlalchemy import Column, Date, Integer, String, UniqueConstraint, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLiteデータベースファイルのパス
DATABASE_URL = "sqlite:///./finance.db"

# エンジンとセッションの設定
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# クレジットカードテーブルの定義
class CreditCard(Base):
    __tablename__ = "credit_card"
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    payee = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    category = Column(String(50))
    source = Column(String(50))
    payment_month = Column(Date)
    __table_args__ = (
        UniqueConstraint("date", "payee", "amount", "source", name="_credit_card_uc"),
    )


# 銀行テーブルの定義
class Bank(Base):
    __tablename__ = "bank"
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    payee = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    category = Column(String(50))
    source = Column(String(50))
    balance = Column(Integer)
    __table_args__ = (
        UniqueConstraint("date", "payee", "amount", "source", name="_bank_uc"),
    )


# テーブルの作成
def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
