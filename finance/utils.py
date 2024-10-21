import logging
import unicodedata


def setup_logger():
    logger = logging.getLogger("FinanceLogger")
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


def convert_string(input_str: str) -> str:
    # 半角のハイフンを全角の伸ばし棒に置換
    input_str = input_str.replace("-", "ｰ")

    # 半角を全角に変換
    fullwidth_str = unicodedata.normalize("NFKC", input_str)

    return fullwidth_str
