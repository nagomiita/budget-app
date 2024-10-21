from sqlalchemy import Column, Integer, String, Numeric, Date, Enum
from core.database import Base
from enum import Enum as PyEnum

class SourceType(PyEnum):
    JAPAN_POST = "japan_post"
    RAKUTEN = "rakuten"
    MITSUI_SMITOMO = "mitsui_smitomo"

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)
    content = Column(String, nullable=False)
    type = Column(String, nullable=False)  # income or expense
    category = Column(String, nullable=False)  # カテゴリ（収入または支出）
    source = Column(Enum(SourceType), nullable=True)  # データソースのタイプ
    transaction_type = Column(String, nullable=True)  # 'bank' or 'credit_card' など
