import csv
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from category import COMPANY, MITSUI_SUMITOMO_CARD, RAKUTEN_CARD
from schemas import Transaction
from utils import convert_string, setup_logger

logger = setup_logger()


class CsvFile(ABC):
    def __init__(
        self, encoding: List[str] = ["utf-8", "shift_jis"], target_file_path: str = ""
    ):
        self.base_path = Path(__file__).parent / "csv_files"
        self.encoding = encoding
        self.target_file_path = Path(target_file_path)

    def process_files(self):
        target_path = Path(self.base_path) / self.target_file_path
        csv_files = self._get_csv_files(target_path)

        contents = []
        for csv_file in csv_files:
            csv_file_path = Path(target_path) / csv_file
            contents.append(self._process_file(csv_file_path))
        return contents

    def _get_csv_files(self, target_path):
        csv_files = target_path.glob("*.csv")
        unprocessed_csv_files = []
        for f in csv_files:
            # if not f.name.endswith(".processed.csv"):
            unprocessed_csv_files.append(f)
        return unprocessed_csv_files

    def _process_file(self, csv_file_path: Path) -> List[Tuple]:
        for enc in self.encoding:
            try:
                with open(csv_file_path, "r", encoding=enc) as file:
                    reader = csv.reader(file)
                    next(reader, None)
                    data = list(reader)
                    if data and data[-1][0] == "":
                        data.pop()
                    processed_data = []
                    for row in data:
                        processed_row = self._process_row(row)
                        if processed_row:
                            processed_data.append(processed_row)
                    self._rename_file_to_processed(csv_file_path)
                    return processed_data
            except UnicodeDecodeError:
                logger.error(
                    f"Unable to read file {csv_file_path} with encoding: {enc}"
                )
                continue  # 既定のutf-8での読み込みに失敗した場合、shift_jisで再度読み込む。
        raise ValueError(
            f"Unable to read file {csv_file_path} with encoding: {self.encoding}, utf-8, and shift_jis"
        )

    @abstractmethod
    def _process_row(self, row) -> Transaction:
        pass

    def _rename_file_to_processed(self, csv_file_path: Path):
        if not csv_file_path.name.endswith(".processed.csv"):
            processed_file_name = f"{csv_file_path.stem}.processed.csv"
            processed_file_path = csv_file_path.parent / processed_file_name
            csv_file_path.rename(processed_file_path)


# 各銀行やクレジットカード会社ごとのサブクラス
class JapanPost(CsvFile):
    """ゆうちょ銀行の明細用クラス"""

    def __init__(self):
        super().__init__(target_file_path="bank/japan_post")

    def _process_row(self, row):
        transaction_date = datetime.strptime(row[0], "%Y%m%d").date().isoformat()
        if row[5] in [
            RAKUTEN_CARD,
            MITSUI_SUMITOMO_CARD,
        ]:  # クレジットカードの引き落としは除外
            return None

        if row[2]:
            if row[5] == COMPANY:
                t_type = "income"
                amount = row[2]
                category = "給与"
                payee = row[4]
            else:
                t_type = "income"
                amount = row[2]
                category = "お小遣い"
                payee = row[5] or row[4]
        else:
            if row[4] == "カード":  # カード引き出し
                t_type = "expense"
                amount = row[3]
                category = "その他"
                payee = "現金引き出し"
            else:
                t_type = "expense"
                amount = row[3]
                category = "その他"
                payee = row[5] or row[4]
        return Transaction(
            date=transaction_date,
            amount=amount,
            content=convert_string(payee),
            type=t_type,
            category=category,
            source="japan_post",
            transaction_type="bank",
        )


class Rakuten(CsvFile):
    """楽天クレジットカードの明細用クラス"""

    def __init__(self):
        super().__init__(target_file_path="credit_card/rakuten")

    def _process_row(self, row):
        try:
            transaction_date = datetime.strptime(row[0], "%Y/%m/%d").date().isoformat()
        except ValueError:
            logger.info(f"Skipping row due to invalid date: {row}")
            return None

        payee = row[1]
        amount = int(row[6])

        return Transaction(
            date=transaction_date,
            amount=amount,
            content=convert_string(payee),
            type="expense",
            category="その他",
            source="rakuten",
            transaction_type="credit_card",
        )


class MitsuiSumitomo(CsvFile):
    """三井住友クレジットカードの明細用クラス"""

    def __init__(self):
        super().__init__(
            encoding=["shift_jis", "utf-8"],
            target_file_path="credit_card/mitsui_sumitomo",
        )

    def _process_row(self, row):
        if not row[0]:
            logger.info(f"空の日付フィールドがある行をスキップしました: {row}")
            return None
        try:
            transaction_date = datetime.strptime(row[0], "%Y/%m/%d").date().isoformat()
        except ValueError:
            logger.info(f"無効な日付形式の行をスキップしました: {row}")
            return None

        payee = row[1].replace("\u3000", " ")
        if payee == "キャッシュバック（ポイント交換）":
            return None

        amount = int(row[2])

        return Transaction(
            date=transaction_date,
            amount=amount,
            content=convert_string(payee),
            type="expense",
            category="その他",
            source="mitsui_sumitomo",
            transaction_type="credit_card",
        )
