import { Box } from "@mui/material";
import MonthlySummary from "@/components/MonthlySummary";
import TransactionMenu from "@/components/TransactionMenu";
import Calender from "@/components/Calender";
import TransactionForm from "@/components/TransactionForm";
import { Transaction } from "@/types";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { DateClickArg } from "@fullcalendar/interaction/index.js";
import { useAppContext } from "@/context/AppContext";
import usemonthlyTransactions from "@/hooks/usemonthlyTransactions";

const Home = () => {
  const today = format(new Date(), "yyy-MM-dd");
  const [currentDay, setCurrentDay] = useState(today);
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isMobile } = useAppContext();
  const monthlyTransactions = usemonthlyTransactions();

  const dailyTransactions = useMemo(() => {
    return monthlyTransactions.filter(
      (transaction) => transaction.date === currentDay
    );
  }, [monthlyTransactions, currentDay]);

  const onCloseForm = () => {
    setSelectedTransaction(null);

    if (isMobile) {
      setIsDialogOpen(!isDialogOpen);
    } else {
      setIsEntryDrawerOpen(!isEntryDrawerOpen);
    }
  };
  //フォームの開閉処理(内訳ボタンを押した時)
  const handleAddTransactionForm = () => {
    if (isMobile) {
      setIsDialogOpen(true);
    } else {
      if (selectedTransaction) {
        setSelectedTransaction(null);
      } else {
        setIsEntryDrawerOpen(!isEntryDrawerOpen);
      }
    }
  };
  //取引カードが選択された時
  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    if (isMobile) {
      setIsDialogOpen(true);
    } else {
      setIsEntryDrawerOpen(true);
    }
  };

  const handleDateClick = (dateInfo: DateClickArg) => {
    setCurrentDay(dateInfo.dateStr);
    setIsMobileDrawerOpen(true);
  };

  const handleCloseMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1 }}>
        <MonthlySummary />
        <Calender
          setCurrentDay={setCurrentDay}
          currentDay={currentDay}
          today={today}
          onDateClick={handleDateClick}
        />
      </Box>
      <Box>
        <TransactionMenu
          dailyTransactions={dailyTransactions}
          currentDay={currentDay}
          handleAddTransactionForm={handleAddTransactionForm}
          onSelectTransaction={handleSelectTransaction}
          open={isMobileDrawerOpen}
          onClose={handleCloseMobileDrawer}
        />
        <TransactionForm
          onCloseForm={onCloseForm}
          isEntryDrawerOpen={isEntryDrawerOpen}
          currentDay={currentDay}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </Box>
    </Box>
  );
};

export default Home;
