import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "日別収支",
    },
  },
};

const labels = [
  "2024-01-10",
  "2024-01-11",
  "2024-01-12",
  "2024-01-13",
  "2024-01-14",
  "2024-01-15",
  "2024-01-16",
];

const data = {
  labels,
  datasets: [
    {
      label: "支出",
      data: [200, 300, 400, 300, 200, 333, 444],
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "収入",
      data: [200, 300, 400, 300, 200, 333, 444],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const BarChart = () => {
  return <Bar options={options} data={data} />;
};

export default BarChart;
