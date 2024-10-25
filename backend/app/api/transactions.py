import logging  # ロギング用のインポート
from typing import List, Optional

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from schemas.transaction import Transaction, TransactionCreate, TransactionResponse
from services.transaction import (
    create_transaction,
    delete_transaction,
    get_transaction_by_id,
    get_transactions,
    update_transaction,
)
from sqlalchemy.exc import SQLAlchemyError  # SQLAlchemyエラーのインポート
from sqlalchemy.orm import Session

# ロガーの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


# GET: 取引を取得するエンドポイント
@router.get(
    "/transactions", response_model=List[Transaction], operation_id="get_transactions"
)
def read_transactions(db: Session = Depends(get_db)):
    return get_transactions(db)


# POST: 取引を追加するエンドポイント
@router.post(
    "/transactions", response_model=TransactionResponse, operation_id="post_transaction"
)
def add_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    try:
        # 取引を作成し、DBに保存
        db_transaction = create_transaction(db, transaction)

        # IDをstr型で返す
        return TransactionResponse(id=db_transaction.id)

    except SQLAlchemyError as e:  # SQLAlchemyのエラーを捕捉
        logger.error(
            f"Error occurred while adding transaction: {e}"
        )  # エラーメッセージをログに記録
        raise HTTPException(
            status_code=400, detail="Transaction could not be added."
        )  # 400 Bad Requestを返す

    except Exception as e:  # その他の一般的なエラーを捕捉
        logger.error(
            f"An unexpected error occurred: {e}"
        )  # エラーメッセージをログに記録
        raise HTTPException(
            status_code=500, detail="Internal Server Error"
        )  # 500 Internal Server Errorを返す


# PUT: 取引を更新するエンドポイント
@router.put(
    "/transactions/{transaction_id}",
    response_model=Transaction,
    operation_id="update_transaction",
)
def update_transaction_endpoint(
    transaction_id: int,
    updated_transaction: TransactionCreate,
    db: Session = Depends(get_db),
):
    try:
        # 取引を取得
        transaction = get_transaction_by_id(db, transaction_id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # 取引を更新
        updated_transaction = update_transaction(db, transaction, updated_transaction)
        return updated_transaction

    except SQLAlchemyError as e:
        logger.error(f"Error occurred while updating transaction: {e}")
        raise HTTPException(status_code=400, detail="Transaction could not be updated.")

    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# DELETE: 取引を削除するエンドポイント
@router.delete("/transactions/{transaction_id}", operation_id="delete_transaction")
def delete_transaction_endpoint(transaction_id: int, db: Session = Depends(get_db)):
    try:
        # 取引を取得
        transaction = get_transaction_by_id(db, transaction_id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # 取引を削除
        delete_transaction(db, transaction)
        return {"message": "Transaction deleted successfully"}

    except SQLAlchemyError as e:
        logger.error(f"Error occurred while deleting transaction: {e}")
        raise HTTPException(status_code=400, detail="Transaction could not be deleted.")

    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Pydanticモデルの定義
class CustomFormField(BaseModel):
    item: str  # `keyof FormValues | string` に対応
    type: str
    display_name: str
    component_type: str  # "input" | "auto_post" | "calculate" | "file_input"
    formula: Optional[str] = None
    isInspectionData: Optional[bool] = False


# ダミーデータとしてのcustomForm
custom_form_data = [
    {
        "item": "productLot",
        "type": "text",
        "display_name": "製品ロット",
        "component_type": "input",
    },
    {
        "item": "inspector",
        "type": "text",
        "display_name": "検査者",
        "component_type": "input",
    },
    {
        "item": "inspectionDate",
        "type": "date",
        "display_name": "検査日",
        "component_type": "input",
    },
    {
        "item": "formula1",
        "type": "text",
        "display_name": "平均検査データ",
        "component_type": "calculate",
        "formula": "(custom_field1 + custom_field3) / 2",
    },
    {
        "item": "custom_field1",
        "type": "number",
        "display_name": "検査データ1",
        "component_type": "auto_post",
        "isInspectionData": True,
    },
    {
        "item": "custom_field2",
        "type": "number",
        "display_name": "検査データ2",
        "component_type": "auto_post",
        "isInspectionData": True,
    },
    {
        "item": "custom_field3",
        "type": "number",
        "display_name": "検査データ3",
        "component_type": "auto_post",
        "isInspectionData": True,
    },
    {
        "item": "formula2",
        "type": "text",
        "display_name": "総合検査データ",
        "component_type": "calculate",
        "formula": "custom_field1 + custom_field2",
    },
    # 必要に応じてファイル入力フィールドを追加
    # {
    #     "item": "inspectionFile",
    #     "type": "file",
    #     "display_name": "検査データファイル",
    #     "component_type": "file_input",
    #     "required": True
    # }
]


@router.get("/api/customForm", response_model=List[CustomFormField])
async def get_custom_form():
    """
    customFormを提供するエンドポイント。
    """
    return custom_form_data
