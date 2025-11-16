import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import apiClient from "../../api/apiClient";
import NavAdmin from "../../components/NavAdmin";
import ComplaintChartAll from "../../components/ComplaintChartAll";

export default function AnalyticsPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    tidakValid: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/pengaduan");
        
        // Handle both response formats
        const pengaduan = Array.isArray(res.data)
          ? res.data[0]?.payload || []
          : (res.data.payload || res.data.data || []);

        setStats({
          total: pengaduan.length,
          menunggu: pengaduan.filter(p => p.status === "Menunggu").length,
          diproses: pengaduan.filter(p => p.status === "Diproses").length,
          selesai: pengaduan.filter(p => p.status === "Selesai").length,
          tidakValid: pengaduan.filter(p => p.status === "Tidak Valid").length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <NavAdmin />

      <main className="ml-64 flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-indigo-600">Analitik Pengaduan Lengkap</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-lg shadow p-6">
            <p className="text-sm opacity-90">Total Pengaduan</p>
            <p className="text-4xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg shadow p-6">
            <p className="text-sm opacity-90">Menunggu</p>
            <p className="text-4xl font-bold mt-2">{stats.menunggu}</p>
            <p className="text-xs opacity-75 mt-2">{((stats.menunggu / stats.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg shadow p-6">
            <p className="text-sm opacity-90">Diproses</p>
            <p className="text-4xl font-bold mt-2">{stats.diproses}</p>
            <p className="text-xs opacity-75 mt-2">{((stats.diproses / stats.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg shadow p-6">
            <p className="text-sm opacity-90">Selesai</p>
            <p className="text-4xl font-bold mt-2">{stats.selesai}</p>
            <p className="text-xs opacity-75 mt-2">{((stats.selesai / stats.total) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg shadow p-6">
            <p className="text-sm opacity-90">Tidak Valid</p>
            <p className="text-4xl font-bold mt-2">{stats.tidakValid}</p>
            <p className="text-xs opacity-75 mt-2">{((stats.tidakValid / stats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-lg shadow p-8">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <ComplaintChartAll />
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Tingkat Penyelesaian:</span>
                <span className="font-semibold text-green-600">
                  {stats.total > 0 ? ((stats.selesai / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Rata-rata per Status:</span>
                <span className="font-semibold text-indigo-600">
                  {stats.total > 0 ? (stats.total / 4).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Pengaduan Valid:</span>
                <span className="font-semibold text-blue-600">
                  {stats.total - stats.tidakValid}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Status Tertinggi:</span>
                <span className="font-semibold text-yellow-600">
                  {Math.max(stats.menunggu, stats.diproses, stats.selesai, stats.tidakValid)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Status Dalam Proses:</span>
                <span className="font-semibold text-orange-600">
                  {stats.menunggu + stats.diproses}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Persentase Tidak Valid:</span>
                <span className="font-semibold text-red-600">
                  {stats.total > 0 ? ((stats.tidakValid / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
