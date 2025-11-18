import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";
import StatusModal from "../../components/StatusModal";
import NavAdmin from "../../components/NavAdmin";
import ComplaintChartAll from "../../components/ComplaintChartAll";

export default function AdminDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [pengaduan, setPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [stats, setStats] = useState({
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    tidakValid: 0,
  });
  const fetchPengaduan = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pengaduan");
      // Handle both old array format and new object format
      const finalData = Array.isArray(res.data)
        ? res.data[0]?.payload || []
        : (res.data.payload || res.data.data || []);

      setPengaduan(finalData);

      setStats({
        menunggu: finalData.filter((p) => p.status === "Menunggu").length,
        diproses: finalData.filter((p) => p.status === "Diproses").length,
        selesai: finalData.filter((p) => p.status === "Selesai").length,
        tidakValid: finalData.filter((p) => p.status === "Tidak Valid").length,
      });
    } catch (err) {
      console.error("Gagal fetch:", err);
      setPengaduan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengaduan();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleOpenModal = (p) => {
    setSelectedPengaduan(p);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await apiClient.put(`/pengaduan/${id}/status`, { status: newStatus });
      
      setPengaduan((prev) =>
        prev.map((p) =>
          p.id_pengaduan === id ? { ...p, status: newStatus } : p
        )
      );

      const updatedPengaduan = pengaduan.map((p) =>
        p.id_pengaduan === id ? { ...p, status: newStatus } : p
      );

      setStats({
        menunggu: updatedPengaduan.filter((p) => p.status === "Menunggu").length,
        diproses: updatedPengaduan.filter((p) => p.status === "Diproses").length,
        selesai: updatedPengaduan.filter((p) => p.status === "Selesai").length,
        tidakValid: updatedPengaduan.filter((p) => p.status === "Tidak Valid").length,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status pengaduan berhasil diupdate!",
        confirmButtonColor: "#4f46e5"
      });
    } catch (err) {
      console.error("Gagal update status:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengupdate status pengaduan",
        confirmButtonColor: "#4f46e5"
      });
    }
  };

  // Filter pengaduan berdasarkan search dan status
  const filteredPengaduan = pengaduan.filter((p) => {
    const matchSearch =
      p.id_pengaduan.toString().includes(searchTerm) ||
      p.nik.includes(searchTerm) ||
      p.judul_pengaduan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
  {/* Sidebar */}
  <div className="hidden md:block">
    <NavAdmin />
  </div>

  {/* Mobile Sidebar Toggle */}
  <button
    onClick={() => setShowSidebar(true)}
    className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white px-3 py-2 rounded-lg shadow"
  >
    ☰ Menu
  </button>

  {/* MAIN CONTENT */}
  <main className="flex-1 p-4 md:p-10 md:ml-64 space-y-10">
    <h1 className="text-xl md:text-3xl font-bold text-indigo-600 mb-4">
      Selamat datang, {user.nama_admin}
    </h1>

    {/* CHART */}
    <div className="bg-white p-6 md:p-8 shadow-lg rounded-2xl">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
        Analitik Pengaduan
      </h2>
      <ComplaintChartAll />
    </div>

    {/* TABLE */}
    <div className="bg-white p-6 md:p-8 shadow-lg rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Daftar Pengaduan
        </h2>
        <button
          onClick={fetchPengaduan}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm shadow"
        >
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan ID, NIK, atau Judul..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Semua">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
          <option value="Tidak Valid">Tidak Valid</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : filteredPengaduan.length === 0 ? (
        <p className="text-gray-500">Tidak ada pengaduan ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">NIK</th>
                <th className="p-3 text-left">Judul</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPengaduan.map((p) => (
                <tr key={p.id_pengaduan} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.id_pengaduan}</td>
                  <td className="p-3">{p.nik}</td>
                  <td className="p-3 truncate max-w-xs">{p.judul_pengaduan}</td>
                  <td className="p-3">{formatDate(p.tgl_pengaduan)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-white text-xs font-medium
                        ${
                          p.status === "Menunggu"
                            ? "bg-blue-500"
                            : p.status === "Diproses"
                            ? "bg-yellow-500"
                            : p.status === "Selesai"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }
                      `}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs"
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-gray-500 text-sm mt-4">
        Menampilkan {filteredPengaduan.length} dari {pengaduan.length} pengaduan
      </p>
    </div>
  </main>

  {/* Modal */}
  <StatusModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    pengaduan={selectedPengaduan}
    onStatusChange={handleStatusChange}
  />
</div>

  );
}

function CardStatus({ title, color, count }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-md`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-4xl font-bold mt-2">{count}</p>
    </div>
  );
}
