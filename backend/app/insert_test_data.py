from datetime import date

from init_db import Bank, CreditCard, SessionLocal


# テストデータを挿入する関数
def insert_test_data():
    # データベースセッションを開始
    session = SessionLocal()

    try:
        # クレジットカードのテストデータ
        credit_card_data = [
            CreditCard(
                date=date(2023, 10, 1),
                payee="Amazon",
                amount=15000,
                category="shopping",
                source="rakuten",
                payment_month=date(2023, 11, 1),
            ),
            CreditCard(
                date=date(2023, 10, 2),
                payee="Starbucks",
                amount=800,
                category="food",
                source="rakuten",
                payment_month=date(2023, 11, 1),
            ),
            CreditCard(
                date=date(2023, 10, 5),
                payee="Netflix",
                amount=1500,
                category="entertainment",
                source="rakuten",
                payment_month=date(2023, 11, 1),
            ),
        ]

        # 銀行のテストデータ
        bank_data = [
            Bank(
                date=date(2023, 10, 1),
                payee="Salary",
                amount=300000,
                category="income",
                source="bank",
                balance=300000,
            ),
            Bank(
                date=date(2023, 10, 2),
                payee="Rent",
                amount=-50000,
                category="housing",
                source="bank",
                balance=250000,
            ),
            Bank(
                date=date(2023, 10, 3),
                payee="Groceries",
                amount=-10000,
                category="food",
                source="bank",
                balance=240000,
            ),
        ]

        # データベースにデータを追加
        session.add_all(credit_card_data)
        session.add_all(bank_data)

        # コミットして変更を保存
        session.commit()
        print("Test data inserted successfully!")
    except Exception as e:
        session.rollback()  # エラー発生時はロールバック
        print(f"Error inserting test data: {e}")
    finally:
        session.close()  # セッションを閉じる


if __name__ == "__main__":
    insert_test_data()
