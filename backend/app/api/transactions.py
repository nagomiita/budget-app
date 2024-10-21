import logging  # ロギング用のインポート
from typing import List

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
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
