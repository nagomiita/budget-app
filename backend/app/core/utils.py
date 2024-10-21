import logging

def setup_logger():
    logger = logging.getLogger("FinanceLogger")
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger

def log_error(logger, message):
    logger.error(message)
