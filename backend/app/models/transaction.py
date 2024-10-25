from core.database import Base
from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # カテゴリ名
    type = Column(String, nullable=False)  # タイプ名
    color = Column(String, nullable=False)  # カテゴリカラー
    icon_base64 = Column(String, nullable=True)  # Base64エンコードされたアイコンデータ

    # Transactionテーブルとのリレーションシップ
    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)
    content = Column(String, nullable=False)
    type = Column(String, nullable=False)  # income or expense
    source = Column(String, nullable=True)  # データソースのタイプ
    transaction_type = Column(String, nullable=True)  # 'bank' or 'credit_card' など
    category_id = Column(
        Integer, ForeignKey("categories.id"), nullable=False
    )  # カテゴリの外部キー

    # Categoryテーブルとのリレーションシップ
    category = relationship("Category", back_populates="transactions")
