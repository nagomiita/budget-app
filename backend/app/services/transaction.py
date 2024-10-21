import logging  # ロギング用のインポート

from models.transaction import Transaction
from schemas.transaction import TransactionCreate
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

# ロガーの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_transactions(db: Session):
    return db.query(Transaction).all()


def create_transaction(db: Session, transaction: TransactionCreate):
    try:
        # Transactionオブジェクトの作成
        db_transaction = Transaction(
            date=transaction.date,
            amount=transaction.amount,
            content=transaction.content,
            type=transaction.type,
            category=transaction.category,
        )

        # データベースに追加
        db.add(db_transaction)
        db.commit()  # コミットを試みる

        # データをリフレッシュ
        db.refresh(db_transaction)
        return db_transaction

    except SQLAlchemyError as e:  # SQLAlchemyのエラーを捕捉
        db.rollback()  # エラー発生時はロールバック
        logger.error(
            f"Error occurred while creating transaction: {e}"
        )  # エラーメッセージをログに記録
        raise  # エラーを再スローして呼び出し元で処理可能にする

    except Exception as e:  # その他の一般的なエラーを捕捉
        logger.error(
            f"An unexpected error occurred: {e}"
        )  # エラーメッセージをログに記録
        raise  # エラーを再スロー