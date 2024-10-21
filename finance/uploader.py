import requests


class FinanceUploader:
    def __init__(self, api_url: str):
        self.api_url = api_url

    def post(self, transactions):
        url = f"{self.api_url}/transactions"  # 実際のAPIエンドポイントを指定
        headers = {"Content-Type": "application/json"}
        transactions_dict = [transaction.dict() for transaction in transactions]

        for transaction in transactions_dict:
            print(transaction)
            response = requests.post(url, json=transaction, headers=headers)
            if response.status_code == 200:
                print("Data posted successfully")
            else:
                print(f"Failed to post data. Status code: {response.status_code}")
