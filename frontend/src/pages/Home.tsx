import { Box } from "@mui/material";
import MonthlySummary from "@/components/MonthlySummary";
import TransactionMenu from "@/components/TransactionMenu";
import Calender from "@/components/Calender";
import TransactionForm from "@/components/TransactionForm";
import { Transaction } from "@/types";
import { useState } from "react";
import { format } from "date-fns";

interface HomeProps {
  monthlyTransactions: Transaction[];
  setcurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

const Home = ({ monthlyTransactions, setcurrentMonth }: HomeProps) => {
  const today = format(new Date(), "yyy-MM-dd");
  const [currentDay, setCurrentDay] = useState(today);
  const dailyTransactions = monthlyTransactions.filter((transaction) => {
    return transaction.date === currentDay;
  });
  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1 }}>
        <MonthlySummary monthlyTransactions={monthlyTransactions} />
        <Calender
          monthlyTransactions={monthlyTransactions}
          setcurrentMonth={setcurrentMonth}
          setCurrentDay={setCurrentDay}
        />
      </Box>
      <Box>
        <TransactionMenu
          dailyTransactions={dailyTransactions}
          currentDay={currentDay}
        />
        <TransactionForm />
      </Box>
    </Box>
  );
};

export default Home;
