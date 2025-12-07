import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import NavAdmin from "../../components/NavAdmin";
import StatusModal from "../../components/StatusModal";
import { deleteInvalidPengaduan } from "../../services/api";
import { GrFormTrash } from "react-icons/gr";
import { FaWpforms } from "react-icons/fa6";
import Stempel from "../../assets/img/Stempel.png"

// Fungsi bantu untuk mengambil foto dari URL dan ubah ke Base64
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Gagal load gambar:", err);
    return null;
  }
};

function SemuaPengaduan() {
  const nav = useNavigate();
  const [pengaduan, setPengaduan] = useState([]);
  const [filteredPengaduan, setFilteredPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNIK, setSearchNIK] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); 
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [stats, setStats] = useState({
      menunggu: 0,
      diproses: 0,
      selesai: 0,
      tidakValid: 0,
    });

  const handleOpenModal = (p) => {
    setSelectedPengaduan(p);
    setIsModalOpen(true);
  };

  // Fetch semua pengaduan 
  const fetchAllPengaduan = async () => {
    try {
      setLoading(true);
      // Menggunakan apiClient (Axios) untuk GET data
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

  // Handler untuk menghapus permanen laporan yang statusnya 'Tidak Valid'
  const handleDeleteInvalid = async (idPengaduan) => {
    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "Hapus Permanen Laporan?",
      html: `<p>ID Laporan: <strong>${idPengaduan}</strong></p><p>Aksi ini tidak dapat dibatalkan dan foto akan dihapus dari server.</p>`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Permanen",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      // Panggil fungsi deleteInvalidPengaduan yang diimpor
      await deleteInvalidPengaduan(idPengaduan);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Laporan ID ${idPengaduan} berhasil dihapus secara permanen.`,
        confirmButtonColor: "#ea580c"
      });
      
      // Muat ulang data setelah penghapusan untuk memperbarui tabel
      fetchAllPengaduan();
    } catch (err) {
      const errorMessage =
        err.message ||
        "Gagal menghapus laporan. Pastikan statusnya 'Tidak Valid' dan Anda memiliki hak akses.";
      
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: errorMessage,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleStatusChange = async (id, newStatus, tanggapan_opsional) => {
    try {
      const res = await apiClient.put(`/pengaduan/${id}/status`, { status: newStatus, tanggapan_opsional });
      
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
  }

// DOWNLOAD PDF  
const handleDownloadOnePDF = async (p) => {
  const doc = new jsPDF();
  const black = [0, 0, 0];

  // KOP SURAT 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...black);
  doc.text("PEMERINTAH KECAMATAN PECANGGAN", 105, 15, { align: "center" });

  doc.setFontSize(13);
  doc.text("DINAS PELAYANAN PENGADUAN MASYARAKAT", 105, 21, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Jl. Jepara No. 23, Indonesia | Telp. (0000) 123456",
    105,
    27,
    { align: "center" }
  );

  // Garis
  doc.setLineWidth(1.5);
  doc.line(20, 32, 190, 32); 

  doc.setLineWidth(0.5);
  doc.line(20, 34, 190, 34);

  // JUDUL DOKUMEN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("LAPORAN PENGADUAN MASYARAKAT", 105, 48, { align: "center" });

  // Tanggal cetak
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 25, 58);

  // DATA LAPORAN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("A. DATA PENGADUAN", 20, 70);

  let y = 78;
  const rowHeight = 8;
  const labelX = 25;
  const colonX = 70;
  const valueX = 78;

  const data = [
    ["ID Pengaduan", `#${p.id_pengaduan}`],
    ["NIK", p.nik || "-"],
    ["Nama", p.nama || "-"],
    [
      "Tanggal Pengaduan",
      p.tgl_pengaduan
        ? new Date(p.tgl_pengaduan).toLocaleDateString("id-ID")
        : "-"
    ],
    ["Status", p.status || "-"],
    ["Judul Pengaduan", p.judul_pengaduan || "-"],
  ];

  data.forEach(([label, value]) => {
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, y - 6, 150, rowHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, labelX, y);

    doc.text(":", colonX, y);

    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, 80);
    doc.text(lines, valueX, y);

    const extraHeight = (lines.length - 1) * 4.8;
    y += rowHeight + extraHeight;
  });

  // ISI LAPORAN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("B. ISI LAPORAN", 20, y + 10);

  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const isiLines = doc.splitTextToSize(
    p.isi_laporan || p.isi || "-",
    165
  );

  doc.text(isiLines, 25, y);

  y += isiLines.length * 6 + 10;

  // FOTO BUKTI
  if (p.foto) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("C. FOTO BUKTI", 20, y);

    const imgY = y + 8;
    const base64 = await getBase64FromUrl(
      `http://localhost:5000/uploads/${p.foto}`
    );

    if (base64) {
      doc.addImage(base64, "JPEG", 25, imgY, 60, 45);
      y = imgY + 60;
    }
  }

// TANDA TANGAN 
const signY = 235;

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Disetujui Oleh,", 145, signY);

doc.setFont("helvetica", "normal");
doc.text("Admin/Petugas,", 150, signY + 6);

// STEMPEL
try {
  doc.addImage(
    Stempel,
    "PNG",
    125,           
    signY + 8,     
    34,            // ukuran stempel
    34
  );
} catch (err) {
  console.error("Stempel gagal dimuat:", err);
}

// Garis tanda tangan
doc.line(130, signY + 38, 188, signY + 38);

  // FOOTER 
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Sistem Pelaporan Pengaduan Masyarakat - Generated Automatically",
    105,
    285,
    { align: "center" }
  );

  // Simpan file
  doc.save(`laporan_pengaduan_${p.id_pengaduan}.pdf`);
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
                className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
                className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
              className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
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
                <thead className="bg-gray-300 text-gray-700 ">
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
                      <td className="px-3 py-2 text-sm text-gray-700 font-medium">
                        #{p.id_pengaduan}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {p.nik}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 max-w-xs truncate">
                        {p.judul_pengaduan}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {formatDate(p.tgl_pengaduan)}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm flex gap-2 flex-wrap">
                        {/* Tombol Lihat Detail */}
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700 transition text-xs"
                        >
                          <FaWpforms />
                        </button>

                        {/* Tombol Download PDF */}
                        <button
                          onClick={() => handleDownloadOnePDF(p)}
                          className="cursor-pointer flex justify-center items-center gap-1 px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-700 transition text-xs"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>

                        {/* TOMBOL HAPUS PERMANEN HANYA UNTUK 'Tidak Valid' */}
                        {p.status === "Tidak Valid" && (
                          <button
                            onClick={() => handleDeleteInvalid(p.id_pengaduan)}
                            className="cursor-pointer px-3 py-1 bg-red-500 text-white rounded shadow hover:bg-red-700 transition text-xs"
                            title="Hapus permanen laporan dan fotonya dari server"
                          >
                            <GrFormTrash size={14} />
                          </button>
                        )}
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
