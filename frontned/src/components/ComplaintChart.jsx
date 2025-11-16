import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
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
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: "Jumlah Laporan",
      data: [],
      borderWidth: 2,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
    }],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/masyarakat/pengaduan');
        // Handle both response formats
        const pengaduan = Array.isArray(res.data)
          ? res.data[0]?.payload || []
          : (res.data.payload || res.data.data || []);

        // Group by tanggal (last 7 days)
        const today = new Date();
        const labels = [];
        const counts = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('id-ID');
          labels.push(dateStr);

          const count = pengaduan.filter(p => {
            const pDate = new Date(p.tgl_pengaduan).toLocaleDateString('id-ID');
            return pDate === dateStr;
          }).length;
          counts.push(count);
        }

        setChartData({
          labels,
          datasets: [{
            label: "Jumlah Laporan",
            data: counts,
            borderWidth: 2,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
          }],
        });
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center pt-8 h-[300px]">
        <p className="text-gray-500">Memuat data grafik...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center pt-8 h-[300px]">
      <Line data={chartData} />
    </div>
  );
}
