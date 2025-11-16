import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ComplaintChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Jumlah Laporan",
        data: [12, 5, 20],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="flex justify-center items-center pt-8 h-[300px]">
      <Line data={data}/>
    </div>
  );
}
