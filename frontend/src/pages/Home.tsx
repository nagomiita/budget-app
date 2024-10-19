import { Box } from "@mui/material";
import MonthlySummary from "@/components/MonthlySummary";
import TransactionMenu from "@/components/TransactionMenu";
import Calender from "@/components/Calender";
import TransactionForm from "@/components/TransactionForm";
import { Transaction } from "@/types";
import { useState } from "react";
import { format } from "date-fns";
import { Schema } from "@/validations/schema";

interface HomeProps {
  monthlyTransactions: Transaction[];
  setcurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  onSaveTransaction: (transaction: Schema) => Promise<void>;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
}

const Home = ({
  monthlyTransactions,
  setcurrentMonth,
  onSaveTransaction,
  onDeleteTransaction,
}: HomeProps) => {
  const today = format(new Date(), "yyy-MM-dd");
  const [currentDay, setCurrentDay] = useState(today);
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const dailyTransactions = monthlyTransactions.filter((transaction) => {
    return transaction.date === currentDay;
  });

  const onCloseForm = () => {
    setSelectedTransaction(null);
    setIsEntryDrawerOpen(!isEntryDrawerOpen);
  };
  //フォームの開閉処理(内訳ボタンを押した時)
  const handleAddTransactionForm = () => {
    if (selectedTransaction) {
      setSelectedTransaction(null);
    } else {
      setIsEntryDrawerOpen(!isEntryDrawerOpen);
    }
  };
  //取引カードが選択された時
  const handleSelectTransaction = (transaction: Transaction) => {
    setIsEntryDrawerOpen(true);
    setSelectedTransaction(transaction);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1 }}>
        <MonthlySummary monthlyTransactions={monthlyTransactions} />
        <Calender
          monthlyTransactions={monthlyTransactions}
          setcurrentMonth={setcurrentMonth}
          setCurrentDay={setCurrentDay}
          currentDay={currentDay}
          today={today}
        />
      </Box>
      <Box>
        <TransactionMenu
          dailyTransactions={dailyTransactions}
          currentDay={currentDay}
          handleAddTransactionForm={handleAddTransactionForm}
          onSelectTransaction={handleSelectTransaction}
        />
        <TransactionForm
          onCloseForm={onCloseForm}
          isEntryDrawerOpen={isEntryDrawerOpen}
          currentDay={currentDay}
          onSaveTransaction={onSaveTransaction}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </Box>
    </Box>
  );
};

export default Home;
