import { Line, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UserComplaintChart() {
  const [chartDataLine, setChartDataLine] = useState({
    labels: [],
    datasets: [{
      label: "Pengaduan Anda",
      data: [],
      borderWidth: 2,
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      tension: 0.4,
    }],
  });

  const [chartDataBar, setChartDataBar] = useState({
    labels: ["Menunggu", "Diproses", "Selesai", "Tidak Valid"],
    datasets: [{
      label: "Jumlah Pengaduan",
      data: [0, 0, 0, 0],
      backgroundColor: [
        "rgba(59, 130, 246, 0.7)",
        "rgba(234, 179, 8, 0.7)",
        "rgba(34, 197, 94, 0.7)",
        "rgba(239, 68, 68, 0.7)",
      ],
      borderColor: [
        "#3b82f6",
        "#eab308",
        "#22c55e",
        "#ef4444",
      ],
      borderWidth: 2,
    }],
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    tidakValid: 0,
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/masyarakat/pengaduan');
        
        // Handle both response formats
        const pengaduan = Array.isArray(res.data)
          ? res.data[0]?.payload || []
          : (res.data.payload || res.data.data || []);

        // LINE CHART: Last 30 days 
        const today = new Date();
        const labels = [];
        const counts = [];

        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          });
          labels.push(dateStr);

          const count = pengaduan.filter(p => {
            const pDate = new Date(p.tgl_pengaduan).toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            });
            return pDate === dateStr;
          }).length;
          counts.push(count);
        }

        setChartDataLine({
          labels,
          datasets: [{
            label: "Pengaduan Anda",
            data: counts,
            borderWidth: 2,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            tension: 0.4,
            fill: true,
          }],
        });

        // BAR CHART: Status distribution 
        const menungguCount = pengaduan.filter(p => p.status === "Menunggu").length;
        const diprosesCount = pengaduan.filter(p => p.status === "Diproses").length;
        const selesaiCount = pengaduan.filter(p => p.status === "Selesai").length;
        const tidakValidCount = pengaduan.filter(p => p.status === "Tidak Valid").length;

        setChartDataBar({
          labels: ["Menunggu", "Diproses", "Selesai", "Tidak Valid"],
          datasets: [{
            label: "Jumlah Pengaduan",
            data: [menungguCount, diprosesCount, selesaiCount, tidakValidCount],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(234, 179, 8, 0.7)",
              "rgba(34, 197, 94, 0.7)",
              "rgba(239, 68, 68, 0.7)",
            ],
            borderColor: [
              "#3b82f6",
              "#eab308",
              "#22c55e",
              "#ef4444",
            ],
            borderWidth: 2,
          }],
        });

        // Statistics 
        setStats({
          total: pengaduan.length,
          menunggu: menungguCount,
          diproses: diprosesCount,
          selesai: selesaiCount,
          tidakValid: tidakValidCount,
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
      <div className="flex justify-center items-center pt-8 h-[400px]">
        <p className="text-gray-500">Memuat data grafik...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Line Chart - 30 Days Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tren Pengaduan Anda (30 Hari Terakhir)
        </h3>
        <div style={{ height: "350px" }}>
          <Line 
            data={chartDataLine}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Bar Chart - Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribusi Status Pengaduan Anda
        </h3>
        <div style={{ height: "300px" }}>
          <Bar 
            data={chartDataBar}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
