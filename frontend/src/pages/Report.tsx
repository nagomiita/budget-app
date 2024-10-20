import BarChart from "@/components/BarChart";
import CategoryChart from "@/components/CategoryChart";
import MonthSelector from "@/components/MonthSelector";
import TransactionTable from "@/components/TransactionTable";
import { Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";

const Report = () => {
  const commonPaperStyle = {
    height: "400px",
    display: "flex",
    flexDirection: "column",
    p: 2,
  };
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <MonthSelector />
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
