from csv_file import JapanPost, MitsuiSumitomo, Rakuten
from uploader import FinanceUploader

if __name__ == "__main__":
    rakuten = Rakuten()
    japan_post = JapanPost()
    mitsui_sumitomo = MitsuiSumitomo()
    uploader = FinanceUploader("http://localhost:8000/api")
    jp_transactions = japan_post.process_files()
    rakuten_transactions = rakuten.process_files()
    ms_transactions = mitsui_sumitomo.process_files()

    for transactions in jp_transactions + rakuten_transactions + ms_transactions:
        uploader.post(transactions)
