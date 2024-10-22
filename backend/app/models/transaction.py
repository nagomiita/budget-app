from core.database import Base
from sqlalchemy import Column, Date, Integer, Numeric, String


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)
    content = Column(String, nullable=False)
    type = Column(String, nullable=False)  # income or expense
    category = Column(String, nullable=False)  # カテゴリ（収入または支出）
    source = Column(String, nullable=True)  # データソースのタイプ
    transaction_type = Column(String, nullable=True)  # 'bank' or 'credit_card' など
