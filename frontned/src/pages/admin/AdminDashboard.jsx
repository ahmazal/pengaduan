import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import StatusModal from "../../components/StatusModal";

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

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

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

      alert("Status pengaduan berhasil diupdate!");
    } catch (err) {
      console.error("Gagal update status:", err);
      alert("Gagal mengupdate status pengaduan");
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
      {/* ======================== Sidebar ======================== */}
      <aside className="w-64 bg-indigo-950 shadow-xl border-r p-6 flex flex-col fixed h-screen">
        <h2 className="text-2xl font-bold text-indigo-200 mb-8 text-center">
          Administrator
        </h2>

        <nav className="flex flex-col gap-4">
          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/pengaduan")}
          >
            📝 Pengaduan
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/profil")}
          >
            👤 Profil
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* ======================== MAIN CONTENT ======================== */}
      <main className="ml-64 flex-1 p-10 space-y-10">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">
          Selamat datang, {user.nama_admin}
        </h1>

        {/* ======================== SUMMARY CARDS ======================== */}
        <div className="bg-white p-8 shadow-lg rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Ringkasan Status Pengaduan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardStatus
              title="Menunggu"
              color="bg-blue-500"
              count={stats.menunggu}
            />

            <CardStatus
              title="Diproses"
              color="bg-yellow-500"
              count={stats.diproses}
            />

            <CardStatus
              title="Selesai"
              color="bg-green-600"
              count={stats.selesai}
            />

            <CardStatus
              title="Tidak Valid"
              color="bg-red-600"
              count={stats.tidakValid}
            />
          </div>
        </div>

        {/* ======================== TABLE CARD ======================== */}
        <div className="bg-white p-8 shadow-lg rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Pengaduan</h2>
            <button
              onClick={fetchPengaduan}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Search dan Filter */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Cari berdasarkan ID, NIK, atau Judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Tidak Valid">Tidak Valid</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : filteredPengaduan.length === 0 ? (
            <p className="text-gray-500">
              {pengaduan.length === 0 ? "Tidak ada pengaduan tersedia." : "Tidak ada pengaduan yang cocok dengan filter."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-500 text-white">
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
                      <td className="p-3 text-center text-sm font-semibold">{p.id_pengaduan}</td>
                      <td className="p-3 text-center text-sm">{p.nik}</td>
                      <td className="p-3 max-w-xs truncate text-sm">{p.judul_pengaduan}</td>
                      <td className="p-3 text-center text-sm">{formatDate(p.tgl_pengaduan)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-white text-sm font-medium
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
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
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

      {/* Status Modal */}
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
