import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@/calendar.css";
import { DatesSetArg, EventContentArg } from "@fullcalendar/core/index.js";
import { calculateDailyBalances } from "@/utils/financeCalculations";
import { Balance, CalenderContent, Transaction } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

interface CalenderProps {
  monthlyTransactions: Transaction[];
  setcurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  setCurrentDay: React.Dispatch<React.SetStateAction<string>>;
}

const Calender = ({
  monthlyTransactions,
  setcurrentMonth,
  setCurrentDay,
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

  const handleDateSet = (datesetInfo: DatesSetArg) => {
    setcurrentMonth(datesetInfo.view.currentStart);
  };

  const handleDateClick = (dateInfo: DateClickArg) => {
    setCurrentDay(dateInfo.dateStr);
  };

  return (
    <FullCalendar
      locale="ja"
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={CalenderEvents}
      eventContent={renderEventContent}
      datesSet={handleDateSet}
      dateClick={handleDateClick}
    />
  );
};

export default Calender;
