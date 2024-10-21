from typing import Literal, Optional, Union

from pydantic import BaseModel


class Transaction(BaseModel):
    date: str
    amount: int
    content: str
    type: Literal["income", "expense"]
    category: Union[
        Literal["食費", "日用品", "住居費", "交際費", "娯楽", "交通費", "その他"],
        Literal["給与", "副収入", "お小遣い"],
    ]
    source: Optional[Literal["japan_post", "rakuten", "mitsui_sumitomo"]] = (
        None  # データソース（NULLを許可）
    )
    transaction_type: Optional[Literal["bank", "credit_card"]] = (
        None  # 取引タイプ（NULLを許可）
    )
