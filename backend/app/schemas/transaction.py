from datetime import date
from typing import Literal, Optional, Union

from pydantic import BaseModel, validator


class TransactionBase(BaseModel):
    date: date  # date型として定義
    amount: int
    content: str
    type: Literal["income", "expense"]
    category: Union[
        Literal["給与", "副収入", "お小遣い"],
        Literal["食費", "日用品", "住居費", "交際費", "娯楽", "交通費", "その他"],
    ]
    source: Optional[str] = None
    transaction_type: Optional[str] = None

    class Config:
        # JSONエンコード用にdate型をISOフォーマットの文字列に変換
        json_encoders = {date: lambda v: v.isoformat()}

    @validator("date", pre=True)
    def parse_date(cls, value):
        if not isinstance(value, str):
            return value
        return date.fromisoformat(value)


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int

    class Config:
        orm_mode = True


class TransactionResponse(BaseModel):
    id: str  # 返り値のIDをstr型で定義
