import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, CheckCircle } from "lucide-react";

export default function StatusModal({ isOpen, onClose, pengaduan, onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [tanggapan, setTanggapan] = useState("");

  // Tetap sinkronkan status yang dipilih saat properti pengaduan berubah
  useEffect(() => {
    setSelectedStatus(pengaduan?.status || "");
  }, [pengaduan]);

  const handleSubmit = async () => {
    if (selectedStatus === pengaduan?.status) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {

      await onStatusChange(pengaduan?.id_pengaduan, selectedStatus, tanggapan);


      // KIRIM TANGGAPAN

      if (tanggapan.trim() !== "") {
        try {
          await fetch(
            `http://localhost:5000/api/pengaduan/${pengaduan.id_pengaduan}/reply`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ isi_tanggapan: tanggapan }),
            }
          );
        } catch (err) {
          console.error("Gagal mengirim tanggapan:", err);
        }
      }
    

      setSuccessMessage("Status berhasil diubah!");
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setTanggapan("");
      }, 1000);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !pengaduan) return null;

  const statusOptions = [
    { value: "Menunggu", label: "Menunggu", color: "bg-blue-500", description: "Pengaduan baru, belum diproses" },
    { value: "Diproses", label: "Sedang Diproses", color: "bg-yellow-500", description: "Admin sedang menangani pengaduan" },
    { value: "Selesai", label: "Selesai", color: "bg-green-600", description: "Pengaduan telah ditangani dan selesai" },
    { value: "Tidak Valid", label: "Tidak Valid", color: "bg-red-600", description: "Pengaduan tidak memenuhi kriteria" },
  ];

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ubah Status Pengaduan</h2>
            <p className="text-gray-500 text-sm mt-1">
              ID Pengaduan: <span className="font-semibold text-gray-700">#{pengaduan.id_pengaduan}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Detail */}
        <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Judul Pengaduan</p>
              <p className="font-semibold text-gray-800 text-base mt-1">{pengaduan.judul_pengaduan}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">NIK Pelapor</p>
              <p className="font-semibold text-gray-800 text-base mt-1">{pengaduan.nik}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Tanggal Laporan</p>
              <p className="font-semibold text-gray-800 text-base mt-1">
                {new Date(pengaduan.tgl_pengaduan).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Status Saat Ini</p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold gap-2 ${
                    pengaduan.status === "Menunggu"
                      ? "bg-blue-500"
                      : pengaduan.status === "Diproses"
                      ? "bg-yellow-500"
                      : pengaduan.status === "Selesai"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {pengaduan.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Isi Pengaduan */}
        <div className="mb-6">
          <p className="text-gray-800 font-semibold mb-2 text-xs uppercase tracking-wider">Isi Pengaduan</p>
          <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto border border-gray-200">
            <p className="text-gray-700 text-sm leading-relaxed">{pengaduan.isi_laporan}</p>
          </div>
        </div>

        {/* Gambar */}
        {pengaduan.foto && (
          <div className="mb-6">
            <p className="text-gray-800 font-semibold mb-2 text-xs uppercase tracking-wider">Lampiran Gambar</p>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex justify-center items-center">
              <img
                src={`http://localhost:5000/uploads/${pengaduan.foto}`}
                alt="Bukti Pengaduan"
                className="max-w-full max-h-80 rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 my-6"></div>

        {/* Status Options */}
        <div className="mb-6">
          <p className="text-gray-800 font-semibold mb-4">Pilih Status Baru</p>
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition hover:shadow-md"
                style={{
                  borderColor: selectedStatus === option.value ? "#4F46E5" : "#E5E7EB",
                  backgroundColor: selectedStatus === option.value ? "#F0F4FF" : "#FAFBFC",
                }}
              >
                <div className="shrink-0 mr-3 mt-1">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${option.color} text-white px-3 py-1 rounded text-xs font-semibold`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>


        {/*     TEXTAREA TANGGAPAN BARU     */}
        
        <div className="mb-6 mt-4">
          <p className="text-gray-800 font-semibold mb-2 text-sm">Tanggapan Admin (opsional)</p>
          <textarea
            value={tanggapan}
            onChange={(e) => setTanggapan(e.target.value)}
            placeholder="Tulis tanggapan untuk dikirim ke pelapor..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
            rows={4}
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 font-medium"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedStatus === pengaduan?.status}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
