import logging  # ロギング用のインポート
from typing import List

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from schemas.transaction import Transaction, TransactionCreate
from services.transaction import create_transaction, get_transactions
from sqlalchemy.exc import SQLAlchemyError  # SQLAlchemyエラーのインポート
from sqlalchemy.orm import Session

# ロガーの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/transactions", response_model=List[Transaction], operation_id="get_transactions"
)
def read_transactions(db: Session = Depends(get_db)):
    return get_transactions(db)


@router.post("/transactions", operation_id="post_transaction")
def add_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    try:
        return create_transaction(db, transaction)  # 取引を作成

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
