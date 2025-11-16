import { useEffect, useState } from "react";
import { ChevronLeft, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import NavUser from "../../components/NavUser";

export default function ListAduan() {
  const nav = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchNik, setSearchNik] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");

  // Fetch semua pengaduan user
  useEffect(() => {
    const fetchPengaduan = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/masyarakat/pengaduan");
        
        // Handle both response formats
        const pengaduan = Array.isArray(res.data)
          ? res.data[0]?.payload || []
          : (res.data.payload || res.data.data || []);
        
        setComplaints(Array.isArray(pengaduan) ? pengaduan : []);
      } catch (err) {
        console.error("Error fetching pengaduan:", err);
        setError("Gagal mengambil data pengaduan");
      } finally {
        setLoading(false);
      }
    };

    fetchPengaduan();
  }, []);

  // Filter dan sort pengaduan
  useEffect(() => {
    let filtered = complaints;

    // Filter by status
    if (filterStatus !== "Semua") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Search by NIK
    if (searchNik.trim()) {
      filtered = filtered.filter((c) => c.nik.includes(searchNik));
    }

    // Sort
    if (sortBy === "terbaru") {
      filtered.sort((a, b) => new Date(b.tgl_pengaduan) - new Date(a.tgl_pengaduan));
    } else if (sortBy === "terlama") {
      filtered.sort((a, b) => new Date(a.tgl_pengaduan) - new Date(b.tgl_pengaduan));
    }

    setFilteredComplaints(filtered);
  }, [complaints, filterStatus, searchNik, sortBy]);

  const getStatusColor = (status) => {
    const colors = {
      "Menunggu": "bg-blue-100 text-blue-700 border-blue-300",
      "Diproses": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Selesai": "bg-green-100 text-green-700 border-green-300",
      "Tidak Valid": "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavUser />

      <main className="ml-64 w-full p-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Semua Pengaduan</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Pengaduan</p>
            <p className="text-2xl font-bold text-gray-800">{complaints.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Menunggu</p>
            <p className="text-2xl font-bold text-blue-600">
              {complaints.filter((c) => c.status === "Menunggu").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Diproses</p>
            <p className="text-2xl font-bold text-yellow-600">
              {complaints.filter((c) => c.status === "Diproses").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Selesai</p>
            <p className="text-2xl font-bold text-green-600">
              {complaints.filter((c) => c.status === "Selesai").length}
            </p>
          </div>
        </div>

        {/* Filter dan Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search NIK */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari NIK..."
                value={searchNik}
                onChange={(e) => setSearchNik(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Semua</option>
                <option>Menunggu</option>
                <option>Diproses</option>
                <option>Selesai</option>
                <option>Tidak Valid</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchNik("");
                setFilterStatus("Semua");
                setSortBy("terbaru");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Memuat data pengaduan...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {complaints.length === 0
                ? "Belum ada pengaduan. Silakan buat pengaduan baru."
                : "Tidak ada pengaduan yang sesuai dengan filter."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">#</th>
                    <th className="px-6 py-3 text-left font-semibold">NIK</th>
                    <th className="px-6 py-3 text-left font-semibold">Judul</th>
                    <th className="px-6 py-3 text-left font-semibold">Tanggal</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint, idx) => (
                    <tr
                      key={complaint.id_pengaduan}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-700">{idx + 1}</td>
                      <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                        {complaint.nik}
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                        {complaint.judul_pengaduan}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(complaint.tgl_pengaduan)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden p-4 space-y-4">
              {filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint.id_pengaduan}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-600 text-sm">#{idx + 1}</span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 mb-2">
                    {complaint.judul_pengaduan}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">NIK: {complaint.nik}</p>
                  <p className="text-sm text-gray-600">
                    Tanggal: {formatDate(complaint.tgl_pengaduan)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Info */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          Menampilkan {filteredComplaints.length} dari {complaints.length} pengaduan
        </div>
      </main>
    </div>
  );
}