import { useEffect, useState } from "react";
import { ChevronLeft, Search, Filter, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import apiClient from "../../api/apiClient";
import Swal from "sweetalert2";
import NavUser from "../../components/NavUser";
import { FaWpforms } from "react-icons/fa6";

// Fungsi bantu ambil foto bukti dari server (ubah ke base64)
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

function DetailItem({ label, value, multiline }) {
  return (
    <div className="border p-3 rounded bg-gray-50">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-gray-800 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function ListAduan() {
  const nav = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchNik, setSearchNik] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");

  // === modal detail & edit state (dari fitur yang diminta) ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id_pengaduan: null,
    nik: "",
    judul_pengaduan: "",
    tgl_pengaduan: "",
    status: "Menunggu",
    isi_laporan: "",
    foto: null,
    fotoPreview: null,
  });
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [fileError, setFileError] = useState("");

  const openDetailModal = (item) => {
    setSelectedComplaint(item);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedComplaint(null);
    setIsModalOpen(false);
  };

  const openEditFromDetail = () => {
    if (!selectedComplaint) return;
    setEditForm({
      id_pengaduan: selectedComplaint.id_pengaduan,
      nik: selectedComplaint.nik || "",
      judul_pengaduan: selectedComplaint.judul_pengaduan || "",
      tgl_pengaduan: selectedComplaint.tgl_pengaduan || selectedComplaint.created_at || "",
      status: selectedComplaint.status || "Menunggu",
      isi_laporan: selectedComplaint.isi_laporan || "",
      foto: null,
      fotoPreview: selectedComplaint.foto ? `http://localhost:5000/uploads/${selectedComplaint.foto}` : null,
    });
    setEditErrors({});
    setFileError("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditForm((f) => ({ ...f, foto: null }));
    setFileError("");
  };

  // file select handler for edit
  function handleFileSelect(e) {
    setFileError("");
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setEditForm((s) => ({ ...s, foto: null, fotoPreview: null }));
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowed.includes(f.type)) {
      setFileError("Tipe file tidak valid. Hanya gambar (jpg/png/gif/webp).");
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (f.size > maxBytes) {
      setFileError("Ukuran file terlalu besar. Maksimum 5 MB.");
      return;
    }
    // set file and preview
    const url = URL.createObjectURL(f);
    setEditForm((s) => ({ ...s, foto: f, fotoPreview: url }));
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateEdit(form) {
    const errs = {};
    if (!form.judul_pengaduan || form.judul_pengaduan.trim().length < 3) {
      errs.judul_pengaduan = "Judul minimal 3 karakter.";
    }
    if (!form.tgl_pengaduan || form.tgl_pengaduan.trim() === "") {
      errs.tgl_pengaduan = "Tanggal harus diisi.";
    }
    if (!form.isi_laporan || form.isi_laporan.trim().length < 5) {
      errs.isi_laporan = "Isi laporan minimal 5 karakter.";
    }
    return errs;
  }

  async function saveEdit(e) {
    e.preventDefault();
    setFileError("");
    const errs = validateEdit(editForm);
    if (Object.keys(errs).length) {
      setEditErrors(errs);
      return;
    }

    try {
      setSavingEdit(true);
      const id = editForm.id_pengaduan;
      let res;
      if (editForm.foto) {
        const fd = new FormData();
        fd.append("nik", editForm.nik);
        fd.append("judul_pengaduan", editForm.judul_pengaduan);
        fd.append("tgl_pengaduan", editForm.tgl_pengaduan);
        fd.append("status", editForm.status);
        fd.append("isi_laporan", editForm.isi_laporan);
        fd.append("foto", editForm.foto);
        res = await apiClient.put(`/masyarakat/pengaduan/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          nik: editForm.nik,
          judul_pengaduan: editForm.judul_pengaduan,
          tgl_pengaduan: editForm.tgl_pengaduan,
          status: editForm.status,
          isi_laporan: editForm.isi_laporan,
        };
        res = await apiClient.put(`/masyarakat/pengaduan/${id}`, payload);
      }

      const updated =
        (res && res.data && (res.data.payload || res.data.data || res.data)) ||
        editForm;

      const updatedObj = {
        ...selectedComplaint,
        ...updated,
        id_pengaduan: updated.id_pengaduan ?? editForm.id_pengaduan,
        judul_pengaduan: updated.judul_pengaduan ?? editForm.judul_pengaduan,
        tgl_pengaduan: updated.tgl_pengaduan ?? editForm.tgl_pengaduan,
        status: updated.status ?? editForm.status,
        isi_laporan: updated.isi_laporan ?? editForm.isi_laporan,
        foto: updated.foto ?? (editForm.foto && editForm.foto.name) ?? selectedComplaint.foto ?? null,
      };

      // Update local state: complaints and filteredComplaints
      setComplaints((prev) =>
        prev.map((it) =>
          (it.id_pengaduan ?? it.id) === (updatedObj.id_pengaduan ?? editForm.id_pengaduan)
            ? { ...it, ...updatedObj }
            : it
        )
      );

      setFilteredComplaints((prev) =>
        prev.map((it) =>
          (it.id_pengaduan ?? it.id) === (updatedObj.id_pengaduan ?? editForm.id_pengaduan)
            ? { ...it, ...updatedObj }
            : it
        )
      );

      // update selected in modal
      setSelectedComplaint((s) => ({ ...s, ...updatedObj }));

      // close edit modal
      setIsEditOpen(false);
      setSavingEdit(false);
    } catch (err) {
      console.error("Error saving edit:", err);
      setSavingEdit(false);
      const msg = err?.response?.data?.message || "Gagal menyimpan perubahan.";
      alert(msg);
    }
  }

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

  const handleConfirmComplete = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Tandai selesai",
        text: "Anda yakin ingin menandai pengaduan ini sebagai selesai? Aksi ini akan mengunci pengaduan.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, tandai selesai",
      });

      if (!confirm.isConfirmed) return;

      const res = await apiClient.post(`/pengaduan/${id}/confirm-complete`);
      // handle response wrapper
      const data = res.data || res;
      Swal.fire({ icon: "success", text: data.message || "Berhasil ditandai selesai" });
      // refresh list
      setLoading(true);
      const r = await apiClient.get("/masyarakat/pengaduan");
      const pengaduan = Array.isArray(r.data)
        ? r.data[0]?.payload || []
        : (r.data.payload || r.data.data || []);
      setComplaints(Array.isArray(pengaduan) ? pengaduan : []);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Gagal menandai selesai";
      Swal.fire({ icon: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

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

  // Fungsi download PDF elegan
  const handleDownloadOnePDF = async (p) => {
    const doc = new jsPDF();
    const orange = [230, 120, 30];
    const gray = [80, 80, 80];

    // Header oranye
    doc.setFillColor(...orange);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN PENGADUAN MASYARAKAT", 105, 18, { align: "center" });

    // Tanggal cetak
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 40);

    const data = [
      ["ID Pengaduan", `#${p.id_pengaduan}`],
      ["NIK Pelapor", p.nik || "-"],
      ["Nama Pelapor", p.nama || "-"],
      ["Tanggal Pengaduan", formatDate(p.tgl_pengaduan)],
      ["Status", p.status || "-"],
      ["Judul Pengaduan", p.judul_pengaduan || "-"],
      ["Isi Laporan", p.isi_laporan || p.isi || "-"],
    ];

    let y = 55;
    let contentHeight = 0;
    data.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(value, 120);
      contentHeight += 10 + (lines.length - 1) * 5;
    });
    const hasPhoto = !!p.foto;
    if (hasPhoto) contentHeight += 80;
    const boxHeight = contentHeight + 20;

    doc.setDrawColor(...orange);
    doc.roundedRect(10, 45, 190, boxHeight, 3, 3);

    data.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...orange);
      doc.text(`${label}:`, 16, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(value, 120);
      doc.text(lines, 70, y);
      y += 10 + (lines.length - 1) * 5;
    });

    // Tambahkan foto bukti (jika ada)
    if (hasPhoto) {
      const imageUrl = `http://localhost:5000/uploads/${p.foto}`;
      const base64Image = await getBase64FromUrl(imageUrl);
      if (base64Image) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...orange);
        doc.text("Foto Bukti:", 16, y + 10);
        doc.addImage(base64Image, "JPEG", 16, y + 15, 70, 50);
        y += 70;
      }
    }

    // Footer tanda tangan
    doc.setDrawColor(...orange);
    doc.line(10, 45 + boxHeight + 10, 200, 45 + boxHeight + 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text("Mengetahui,", 140, 45 + boxHeight + 25);
    doc.text("Pelapor", 140, 45 + boxHeight + 55);
    doc.line(140, 45 + boxHeight + 56, 190, 45 + boxHeight + 56);

    // Footer kecil
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Sistem Pelaporan Pengaduan Masyarakat - Generated Automatically",
      105,
      285,
      { align: "center" }
    );

    doc.save(`laporan_pengaduan_${p.id_pengaduan}.pdf`);
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
                    <th className="px-6 py-3 text-center font-semibold">No</th>
                    <th className="px-6 py-3 text-center font-semibold">NIK</th>
                    <th className="px-6 py-3 text-center font-semibold">Judul</th>
                    <th className="px-6 py-3 text-center font-semibold">Tanggal</th>
                    <th className="px-6 py-3 text-center font-semibold">Status</th>
                    <th className="px-6 py-3 text-center font-semibold">Aksi</th>
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-center flex-wrap">
                          {complaint.status === "Selesai" ? (
                            complaint.is_locked === 1 || complaint.is_locked === true ? (
                              <div className="text-sm text-green-700">
                                Dikunci • {complaint.tanggal_tandai_selesai ? formatDate(complaint.tanggal_tandai_selesai) : "-"}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleConfirmComplete(complaint.id_pengaduan)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Tandai Selesai
                              </button>
                            )
                          ) : (
                            <div className="text-sm text-gray-600">-</div>
                          )}
                          <button
                            onClick={() => handleDownloadOnePDF(complaint)}
                            className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium transition-all whitespace-nowrap"
                            title="Download PDF"
                          >
                            <Download size={16} />
                            Download
                          </button>

                          {/* Lihat Detail button (ditambahkan, tidak mengubah logika lain) */}
                          <button
                            onClick={() => openDetailModal(complaint)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-all whitespace-nowrap"
                            title="Lihat Detail"
                          >
                            <FaWpforms />
                            Lihat Detail
                          </button>
                        </div>
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
                  <div className="mt-3 flex flex-col gap-2">
                    {complaint.status === "Selesai" ? (
                      complaint.is_locked === 1 || complaint.is_locked === true ? (
                        <div className="text-sm text-green-700">
                          Dikunci • {complaint.tanggal_tandai_selesai ? formatDate(complaint.tanggal_tandai_selesai) : "-"}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmComplete(complaint.id_pengaduan)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Tandai Selesai
                        </button>
                      )
                    ) : null}
                    <button
                      onClick={() => handleDownloadOnePDF(complaint)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-all"
                      title="Download PDF"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>

                    {/* Lihat Detail mobile */}
                    <button
                      onClick={() => openDetailModal(complaint)}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-all"
                      title="Lihat Detail"
                    >
                      Lihat Detail
                    </button>
                  </div>
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

      {/* ============== MODAL DETAIL (DIGABUNGKAN) ============== */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">

          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-200"
            onClick={closeDetailModal}
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-3xl transform transition-all duration-200 opacity-100 scale-100">
            <div className="bg-white rounded-xl shadow-2xl overflow-auto max-h-[90vh]">

              {/* Header */}
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Detail Pengaduan #{selectedComplaint.id_pengaduan ?? ""}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    NIK: {selectedComplaint.nik ?? "-"}
                  </p>
                </div>

                {/* Only top close button */}
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Tutup
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* ----------- KIRI: Foto + Status + Lokasi ----------- */}
                  <div className="space-y-4">

                    {/* Foto */}
                    {selectedComplaint.foto ? (
                      <img
                        src={`http://localhost:5000/uploads/${selectedComplaint.foto}`}
                        alt={selectedComplaint.judul_pengaduan || "Foto pengaduan"}
                        className="w-full h-64 object-cover rounded-md border"
                        onError={(e) => { e.currentTarget.src = ""; }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border">
                        Tidak ada foto
                      </div>
                    )}

                    {/* Status + Tanggal */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          selectedComplaint.status
                        )}`}
                      >
                        {selectedComplaint.status}
                      </span>

                      <div className="text-sm text-gray-600">
                        {selectedComplaint.tgl_pengaduan
                          ? formatDate(selectedComplaint.tgl_pengaduan)
                          : (selectedComplaint.created_at ?? "-")}
                      </div>
                    </div>

                    {/* Lokasi */}
                    <div>
                      <h4 className="text-sm text-gray-500">Lokasi</h4>
                      <p className="text-gray-800">{selectedComplaint.lokasi || "-"}</p>
                    </div>
                  </div>

                  {/* ----------- KANAN: Detail Informasi ----------- */}
                  <div className="space-y-4">

                    <div className="border p-3 rounded bg-gray-50">
                      <div className="text-xs text-gray-500">ID Pengaduan</div>
                      <div className="mt-1 text-gray-800">
                        {selectedComplaint.id_pengaduan ?? "-"}
                      </div>
                    </div>

                    <div className="border p-3 rounded bg-gray-50">
                      <div className="text-xs text-gray-500">Judul Pengaduan</div>
                      <div className="mt-1 text-gray-800">
                        {selectedComplaint.judul_pengaduan}
                      </div>
                    </div>

                    <div className="border p-3 rounded bg-gray-50">
                      <div className="text-xs text-gray-500">Isi Laporan</div>
                      <div className="mt-1 text-gray-800 whitespace-pre-wrap">
                        {selectedComplaint.isi_laporan}
                      </div>
                    </div>

                    <div className="border p-3 rounded bg-gray-50">
                      <div className="text-xs text-gray-500">Foto (filename)</div>
                      <div className="mt-1 text-gray-800">{selectedComplaint.foto || "-"}</div>
                    </div>

                    <div className="border p-3 rounded bg-gray-50">
                      <div className="text-xs text-gray-500">Created At</div>
                      <div className="mt-1 text-gray-800">{selectedComplaint.created_at || "-"}</div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Footer: Edit button bottom-right */}
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={openEditFromDetail}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Edit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* ============== END MODAL DETAIL ============== */}

      {/* ============== EDIT MODAL ============== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={closeEditModal}
          />

          <div className="relative w-full max-w-2xl transform transition-all duration-200 opacity-100 scale-100">
            <div className="bg-white rounded-xl shadow-2xl overflow-auto max-h-[90vh]">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold">Edit Pengaduan #{editForm.id_pengaduan}</h3>
                <button onClick={closeEditModal} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">Batal</button>
              </div>

              <form onSubmit={saveEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">NIK</label>
                    <input readOnly value={editForm.nik} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Tanggal</label>
                    <input
                      name="tgl_pengaduan"
                      value={editForm.tgl_pengaduan}
                      disabled
                      onChange={handleEditChange}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {editErrors.tgl_pengaduan && <p className="text-sm text-red-600 mt-1">{editErrors.tgl_pengaduan}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Judul Pengaduan</label>
                  <input
                    name="judul_pengaduan"
                    value={editForm.judul_pengaduan}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                  />
                  {editErrors.judul_pengaduan && <p className="text-sm text-red-600 mt-1">{editErrors.judul_pengaduan}</p>}
                </div>

                <div>
                  <h1 className="text-xs text-gray-600">Status</h1>
                  <p>{editForm.status}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Isi Laporan</label>
                  <textarea
                    name="isi_laporan"
                    value={editForm.isi_laporan}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 min-h-[120px]"
                  />
                  {editErrors.isi_laporan && <p className="text-sm text-red-600 mt-1">{editErrors.isi_laporan}</p>}
                </div>

                <div>
                  <label className="text-xs text-gray-600">Unggah Foto (opsional, max 5MB)</label>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="mt-2" />
                  {fileError && <p className="text-sm text-red-600 mt-1">{fileError}</p>}
                  {editForm.fotoPreview && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-700">Preview:</div>
                      <img src={editForm.fotoPreview} alt="preview" className="max-h-36 rounded mt-2 border" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded border">Batal</button>
                  <button type="submit" disabled={savingEdit} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                    {savingEdit ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
