import { useAppContext } from "@/context/AppContext";
import { Transaction } from "@/types";
import { formatMonth } from "@/utils/formatting";
import { useMemo } from "react";

const usemonthlyTransactions = (): Transaction[] => {
  const { transactions, currentMonth } = useAppContext();
  //月間の取引データを取得
  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transaction.date.startsWith(formatMonth(currentMonth))
      ),
    [transactions, currentMonth]
  );
  return monthlyTransactions;
};

export default usemonthlyTransactions;
