import React, { useState } from "react";

export default function StatusModal({ isOpen, onClose, pengaduan, onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState(pengaduan?.status || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedStatus === pengaduan?.status) {
      onClose();
      return;
    }

    setIsLoading(true);
    await onStatusChange(pengaduan?.id_pengaduan, selectedStatus);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !pengaduan) return null;

  const statusOptions = [
    { value: "Menunggu", label: "Menunggu", color: "bg-blue-500", description: "Pengaduan baru, belum diproses" },
    { value: "Diproses", label: "Sedang Diproses", color: "bg-yellow-500", description: "Admin sedang menangani pengaduan" },
    { value: "Selesai", label: "Selesai", color: "bg-green-600", description: "Pengaduan telah ditangani dan selesai" },
    { value: "Tidak Valid", label: "Tidak Valid", color: "bg-red-600", description: "Pengaduan tidak memenuhi kriteria" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ubah Status Pengaduan</h2>
          <p className="text-gray-500 text-sm mt-1">ID: {pengaduan.id_pengaduan}</p>
        </div>

        {/* Detail Pengaduan */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Judul Pengaduan</p>
              <p className="font-semibold text-gray-800">{pengaduan.judul_pengaduan}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">NIK Pelapor</p>
              <p className="font-semibold text-gray-800">{pengaduan.nik}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tanggal Laporan</p>
              <p className="font-semibold text-gray-800">
                {new Date(pengaduan.tgl_pengaduan).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status Saat Ini</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium mt-1 ${
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

        {/* Isi Pengaduan */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Isi Pengaduan</p>
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
            <p className="text-gray-700 text-sm">{pengaduan.isi_laporan}</p>
          </div>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <p className="text-gray-800 font-semibold mb-3">Pilih Status Baru</p>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
                style={{
                  borderColor: selectedStatus === option.value ? "#4F46E5" : "#E5E7EB",
                  backgroundColor: selectedStatus === option.value ? "#EEF2FF" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 mr-3 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`${option.color} text-white px-2 py-1 rounded text-xs font-semibold`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
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
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
