import BarChart from "@/components/BarChart";
import CategoryChart from "@/components/CategoryChart";
import MonthSelector from "@/components/MonthSelector";
import TransactionTable from "@/components/TransactionTable";
import { Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface ReportProps {
  currentMonth: Date;
  setcurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

const Report = ({ currentMonth, setcurrentMonth }: ReportProps) => {
  const commonPaperStyle = {
    height: { xs: "auto", md: "400px" },
    display: "flex",
    flexDirection: "column",
    p: 2,
  };
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <MonthSelector
          currentMonth={currentMonth}
          setcurrentMonth={setcurrentMonth}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={commonPaperStyle}>
          <CategoryChart />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={commonPaperStyle}>
          <BarChart />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TransactionTable />
      </Grid>
    </Grid>
  );
};

export default Report;
