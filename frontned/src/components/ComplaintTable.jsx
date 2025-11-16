import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

function ComplaintTable() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPengaduan = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/masyarakat/pengaduan');
        // Handle both old array format and new object format
        const pengaduan = Array.isArray(res.data)
          ? res.data[0]?.payload || []
          : (res.data.payload || res.data.data || []);
        setComplaints(Array.isArray(pengaduan) ? pengaduan : []);
      } catch (err) {
        console.error("Error fetching pengaduan:", err);
        setError(err.response?.data?.message || "Gagal mengambil data pengaduan");
      } finally {
        setLoading(false);
      }
    };

    fetchPengaduan();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-100 text-yellow-700";
      case "Diproses":
        return "bg-orange-100 text-orange-700";
      case "Selesai":
        return "bg-green-100 text-green-700";
      case "Tidak Valid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Daftar Pengaduan</h2>
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Daftar Pengaduan</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Daftar Pengaduan</h2>
        <p className="text-gray-500">Belum ada pengaduan. Silakan buat pengaduan baru.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Daftar Pengaduan</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-left">
            <th className="p-3">#</th>
            <th className="p-3">Judul</th>
            <th className="p-3">Tanggal</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.slice(0,5).map((c , idx) => (
            <tr key={c.id_pengaduan} className="border-b hover:bg-gray-50">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3 max-w-xs truncate">{c.judul_pengaduan}</td>
              <td className="p-3">{formatDate(c.tgl_pengaduan)}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    c.status
                  )}`}
                >
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintTable;
