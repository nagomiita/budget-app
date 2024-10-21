import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@/calendar.css";
import { DatesSetArg, EventContentArg } from "@fullcalendar/core/index.js";
import { calculateDailyBalances } from "@/utils/financeCalculations";
import { Balance, CalenderContent } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useTheme } from "@mui/material";
import { isSameMonth } from "date-fns";
import usemonthlyTransactions from "@/hooks/usemonthlyTransactions";
import { useAppContext } from "@/context/AppContext";

interface CalenderProps {
  setCurrentDay: React.Dispatch<React.SetStateAction<string>>;
  currentDay: string;
  today: string;
  onDateClick: (dateInfo: DateClickArg) => void;
}

const Calender = ({
  setCurrentDay,
  currentDay,
  today,
  onDateClick,
}: CalenderProps) => {
  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div>
        <div className="money" id="event-income">
          {eventInfo.event.extendedProps.income}
        </div>
        <div className="money" id="event-expense">
          {eventInfo.event.extendedProps.expense}
        </div>
        <div className="money" id="event-balance">
          {eventInfo.event.extendedProps.balance}
        </div>
      </div>
    );
  };
  const monthlyTransactions = usemonthlyTransactions();
  const dailyBalances = calculateDailyBalances(monthlyTransactions);
  const createCalenderEvents = (
    dailyBalances: Record<string, Balance>
  ): CalenderContent[] => {
    return Object.keys(dailyBalances).map((date) => {
      const { income, expense, balance } = dailyBalances[date];
      return {
        start: date,
        income: formatCurrency(income),
        expense: formatCurrency(expense),
        balance: formatCurrency(balance),
      };
    });
  };

  const CalenderEvents = createCalenderEvents(dailyBalances);

  const { setCurrentMonth } = useAppContext();

  const handleDateSet = (datesetInfo: DatesSetArg) => {
    const currentMonth = datesetInfo.view.currentStart;
    setCurrentMonth(currentMonth);
    const todayDate = new Date();
    if (isSameMonth(todayDate, currentMonth)) {
      setCurrentDay(today);
    }
  };

  const theme = useTheme();

  const backgroundEvent = {
    start: currentDay,
    display: "background",
    backgroundColor: theme.palette.balanceColor.light,
  };

  return (
    <FullCalendar
      locale="ja"
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={[...CalenderEvents, backgroundEvent]}
      eventContent={renderEventContent}
      datesSet={handleDateSet}
      dateClick={onDateClick}
    />
  );
};

export default Calender;
