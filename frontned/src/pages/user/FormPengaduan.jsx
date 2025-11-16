import { FileText, Calendar, Layers, MessageCircle, Image } from "lucide-react";
import { useState, useRef } from "react";
import NavUser from "../../components/NavUser";

export default function FormPengaduan() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [filled, setFilled] = useState({
    judul: "",
    tanggal: "",
    isi: "",
  });

  const [file, setFile] = useState(null);
  const fileRef = useRef(null); // <<< tambahan

  const handleSubmit = async () => {
    if (!filled.judul || !filled.tanggal || !filled.isi) {
      alert("Semua field wajib diisi.");
      return;
    }

    if (!file) {
      alert("Foto wajib diupload.");
      return;
    }

    const formData = new FormData();
    formData.append("nik", user.nik);
    formData.append("judul_pengaduan", filled.judul);
    formData.append("tgl_pengaduan", filled.tanggal);
    formData.append("isi_laporan", filled.isi);
    formData.append("foto", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pengaduan", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      console.log("DEBUG - Response dari backend:", data);
      console.log("DEBUG - data.success:", data.success);

      if (data.success) {
        alert("Pengaduan berhasil dikirim!");

        // RESET FIELD
        setFilled({ judul: "", tanggal: "", isi: "" });

        // RESET FILE
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";

      } else {
        alert(data.message || "Gagal mengirim pengaduan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavUser />

      <main className="ml-64 w-full p-10">
        <div className="max-w-3xl mx-auto mt-6 bg-white p-10 rounded-3xl shadow-lg">
          <h1 className="text-3xl font-bold text-orange-600 mb-1">Buat Pengaduan</h1>
          <p className="text-gray-500 mb-10">Silakan isi detail pengaduan dengan lengkap.</p>

          <div className="space-y-8">

            {/* JUDUL */}
            <div className="relative group">
              <FileText className="absolute left-4 top-4 text-orange-500" size={22} />
              <input
                type="text"
                value={filled.judul}
                onChange={(e) => setFilled({ ...filled, judul: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-4 pl-12 focus:ring-orange-200"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all 
                ${filled.judul ? "-top-2 text-xs text-orange-600" : "top-4 text-gray-400"}`}>
                Judul Pengaduan
              </label>
            </div>

            {/* TANGGAL */}
            <div className="relative group">
              <Calendar className="absolute left-4 top-4 text-orange-500" size={22} />
              <input
                type="date"
                value={filled.tanggal}
                onChange={(e) => setFilled({ ...filled, tanggal: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-4 pl-12"
              />
              <label className={`absolute left-12 bg-white px-1 transition-all
                ${filled.tanggal ? "-top-2 text-xs text-orange-600" : "top-4 text-gray-400"}`}>
                Tanggal Pengaduan
              </label>
            </div>

            {/* KATEGORI (disabling sesuai kode asli) */}
            <div className="relative">
              <Layers className="absolute left-4 top-4 text-orange-500" size={22} />
              <input
                type="text"
                placeholder="Kategori (opsional)"
                className="w-full border border-gray-300 rounded-xl p-4 pl-12"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Kategori akan diatur oleh admin</p>
            </div>

            {/* ISI */}
            <div className="relative">
              <MessageCircle className="absolute left-4 top-4 text-orange-500" size={22} />
              <textarea
                rows="5"
                value={filled.isi}
                onChange={(e) => setFilled({ ...filled, isi: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-4 pl-12"
              ></textarea>
              <label className={`absolute left-12 bg-white px-1 transition-all
                ${filled.isi ? "-top-2 text-xs text-orange-600" : "top-4 text-gray-400"}`}>
                Isi Pengaduan
              </label>
            </div>

            {/* FOTO */}
            <div className="relative">
              <Image className="absolute left-4 top-3.5 text-orange-500" size={20} />
              <input
                type="file"
                ref={fileRef} // <<< tambahan
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-xl pl-12 py-2"
              />
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() =>
                  setFilled({ judul: "", tanggal: "", isi: "" })
                }
                className="px-6 py-3 border rounded-xl"
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl"
              >
                Kirim Pengaduan
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
