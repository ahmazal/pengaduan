import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function DashboardRingkasan() {
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/masyarakat/pengaduan');
        // Response format: [{ payload: data, message, metaData }]
        const pengaduan = res.data[0]?.payload || [];
        
        const stats = {
          total: pengaduan.length,
          menunggu: pengaduan.filter(p => p.status === 'Menunggu').length,
          diproses: pengaduan.filter(p => p.status === 'Diproses').length,
          selesai: pengaduan.filter(p => p.status === 'Selesai').length,
        };
        setStats(stats);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const items = [
    { label: "Total Pengaduan", value: stats.total, bg: "bg-blue-500/90", link: "#" },
    { label: "Menunggu Diproses", value: stats.menunggu, bg: "bg-rose-500/90", link: "#" },
    { label: "Sedang Diproses", value: stats.diproses, bg: "bg-amber-400/90", link: "#" },
    { label: "Selesai", value: stats.selesai, bg: "bg-emerald-500/90", link: "#" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((it, i) => (
        <a
          key={i}
          href={it.link}
          className={`block p-5 rounded-xl ${it.bg} text-white shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{it.label}</p>
              <p className="text-3xl font-bold mt-2">{loading ? "-" : it.value}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              {/* icon placeholder */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
