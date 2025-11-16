import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import NavAdmin from "../../components/NavAdmin";
import StatusModal from "../../components/StatusModal";

function SemuaPengaduan() {
  const nav = useNavigate();
  const [pengaduan, setPengaduan] = useState([]);
  const [filteredPengaduan, setFilteredPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNIK, setSearchNIK] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest atau oldest
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const handleOpenModal = (p) => {
    setSelectedPengaduan(p);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id_pengaduan, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.put(`/pengaduan/${id_pengaduan}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const updatedPengaduan = pengaduan.map(p =>
        p.id_pengaduan === id_pengaduan ? { ...p, status: newStatus } : p
      );
      setPengaduan(updatedPengaduan);
      setFilteredPengaduan(updatedPengaduan);
    } catch (err) {
      console.error("Gagal update status:", err);
      throw err;
    }
  };

  // Fetch semua pengaduan
  const fetchAllPengaduan = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pengaduan");

      // Handle both old array format dan new object format
      const finalData = Array.isArray(res.data)
        ? res.data[0]?.payload || []
        : res.data.payload || res.data.data || [];

      setPengaduan(finalData);
      setFilteredPengaduan(finalData);
    } catch (err) {
      console.error("Gagal fetch:", err);
      setPengaduan([]);
      setFilteredPengaduan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPengaduan();
  }, []);

  // Filter dan sorting
  useEffect(() => {
    let result = [...pengaduan];

    // Filter by NIK
    if (searchNIK.trim()) {
      result = result.filter((p) =>
        p.nik.toLowerCase().includes(searchNIK.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "Semua") {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Sort by date
    if (sortOrder === "newest") {
      result.sort(
        (a, b) => new Date(b.tgl_pengaduan) - new Date(a.tgl_pengaduan)
      );
    } else {
      result.sort(
        (a, b) => new Date(a.tgl_pengaduan) - new Date(b.tgl_pengaduan)
      );
    }

    setFilteredPengaduan(result);
  }, [searchNIK, sortOrder, filterStatus, pengaduan]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Menunggu":
        return "bg-blue-100 text-blue-700";
      case "Diproses":
        return "bg-yellow-100 text-yellow-700";
      case "Selesai":
        return "bg-green-100 text-green-700";
      case "Tidak Valid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <NavAdmin />

      {/* Main Content */}
      <div className="flex-3/4 ml-64 mx-auto px-6 py-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Semua Pengaduan</h2>
          <p className="text-gray-600 mt-2">
            Total: {filteredPengaduan.length} pengaduan
          </p>
        </div>

        {/* Statistics Summary */}
        {filteredPengaduan.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-700 text-sm font-semibold">Menunggu</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  filteredPengaduan.filter((p) => p.status === "Menunggu")
                    .length
                }
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-700 text-sm font-semibold">Diproses</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  filteredPengaduan.filter((p) => p.status === "Diproses")
                    .length
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-700 text-sm font-semibold">Selesai</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredPengaduan.filter((p) => p.status === "Selesai").length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-700 text-sm font-semibold">Tidak Valid</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  filteredPengaduan.filter((p) => p.status === "Tidak Valid")
                    .length
                }
              </p>
            </div>
          </div>
        )}
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by NIK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cari berdasarkan NIK
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Masukkan NIK..."
                  value={searchNIK}
                  onChange={(e) => setSearchNIK(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Tidak Valid">Tidak Valid</option>
              </select>
            </div>

            {/* Sort by Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urutkan
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchNIK("");
                setFilterStatus("Semua");
                setSortOrder("newest");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Pengaduan Table/List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">Memuat data pengaduan...</p>
          </div>
        ) : filteredPengaduan.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">
              Tidak ada pengaduan yang sesuai dengan filter
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-orange-600 to-orange-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      NIK Pelapor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Judul
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPengaduan.map((p, index) => (
                    <tr
                      key={p.id_pengaduan}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        #{p.id_pengaduan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {p.nik}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {p.judul_pengaduan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(p.tgl_pengaduan)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* StatusModal */}
      <StatusModal
        isOpen={isModalOpen}
        pengaduan={selectedPengaduan}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default SemuaPengaduan;
