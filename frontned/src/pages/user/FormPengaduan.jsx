import {
  FileText,
  Calendar,
  Layers,
  MessageCircle,
  Image,
  MapPin,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import NavUser from "../../components/NavUser";

export default function FormPengaduan() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [filled, setFilled] = useState({
    judul: "",
    tanggal: "",
    isi: "",
    lokasi: "", // Added lokasi field
  });

  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleOpenGoogleMaps = () => {
    // Get user's current location first, then open Google Maps
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open Google Maps with current location as center
          const mapsUrl = 'https://www.google.com/maps/@${latitude},${longitude},15z';
          window.open(mapsUrl, "_blank");
          Swal.fire({
            icon: "info",
            title: "Pilih Lokasi",
            html: "<p>Pilih lokasi di Google Maps, kemudian copy koordinat (klik marker) dan paste di field lokasi</p>",
            confirmButtonColor: "#ea580c",
          });
        },
        () => {
          // If geolocation fails, open Google Maps without specific location
          window.open("https://www.google.com/maps", "_blank");
          Swal.fire({
            icon: "info",
            title: "Pilih Lokasi",
            html: "<p>Pilih lokasi di Google Maps, kemudian copy koordinat dan paste di field lokasi</p><p><small>Format: latitude, longitude (contoh: -6.200000, 106.816666)</small></p>",
            confirmButtonColor: "#ea580c",
          });
        }
      );
    } else {
      window.open("https://www.google.com/maps", "_blank");
      Swal.fire({
        icon: "info",
        title: "Pilih Lokasi",
        html: "<p>Pilih lokasi di Google Maps, kemudian copy koordinat dan paste di field lokasi</p><p><small>Format: latitude, longitude (contoh: -6.200000, 106.816666)</small></p>",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleSubmit = async () => {
    if (!filled.judul || !filled.tanggal || !filled.isi || !filled.lokasi) {
      Swal.fire({
        icon: "error",
        title: "Validasi Error",
        text: "Semua field wajib diisi.",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Validasi Error",
        text: "Foto wajib diupload.",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    const formData = new FormData();
    formData.append("nik", user.nik);
    formData.append("judul_pengaduan", filled.judul);
    formData.append("tgl_pengaduan", filled.tanggal);
    formData.append("isi_laporan", filled.isi);
    formData.append("lokasi", filled.lokasi); // Added lokasi to formData
    formData.append("foto", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pengaduan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Pengaduan berhasil dikirim!",
          confirmButtonColor: "#ea580c",
        });
        setFilled({ judul: "", tanggal: "", isi: "", lokasi: "" });
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.message || "Gagal mengirim pengaduan.",
          confirmButtonColor: "#ea580c",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan server: " + err.message,
        confirmButtonColor: "#ea580c",
      });
    }
  };

  useEffect(() => {
    let map, marker;
    if (isMapOpen) {
      map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -6.2, lng: 106.816666 },
        zoom: 13,
      });

      marker = new window.google.maps.Marker({
        position: map.getCenter(),
        map,
        draggable: true,
      });

      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        handleMapClick(position.lat(), position.lng());
      });
    }

    return () => {
      if (marker) {
        window.google.maps.event.clearInstanceListeners(marker);
      }
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [isMapOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavUser />

      <main className="ml-64 w-full min-h-screen bg-gray-100 p-10">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Buat Pengaduan
          </h1>
          <p className="text-gray-500 mb-10">
            Silakan isi detail pengaduan dengan lengkap.
          </p>

          <div className="space-y-8">
            {/* JUDUL */}
            <div className="relative">
              <FileText
                className="absolute left-5 top-4 text-gray-700"
                size={22}
              />
              <input
                id="judul"
                type="text"
                value={filled.judul}
                onChange={(e) =>
                  setFilled({ ...filled, judul: e.target.value })
                }
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              />
              <label
                htmlFor="judul"
                className={`absolute left-14 bg-white px-2 transition-all duration-200
            ${
              filled.judul
                ? "-top-3 text-xs text-orange-600"
                : "top-4 text-gray-400"
            }`}
              >
                Judul Pengaduan
              </label>
            </div>

            {/* TANGGAL */}
            <div className="relative">
              <Calendar
                className="absolute left-5 top-4 text-gray-700"
                size={22}
              />
              <input
                id="date"
                type="date"
                value={filled.tanggal}
                onChange={(e) =>
                  setFilled({ ...filled, tanggal: e.target.value })
                }
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              />
              <label
                htmlFor="date"
                className={`absolute left-14 bg-white px-2 transition-all duration-200
            ${
              filled.tanggal
                ? "-top-3 text-xs text-orange-600"
                : "top-4 text-gray-400"
            }`}
              >
                Tanggal Pengaduan
              </label>
            </div>

            {/* ISI */}
            <div className="relative">
              <MessageCircle
                className="absolute left-5 top-4 text-gray-700"
                size={22}
              />
              <textarea
                id="isi"
                rows="6"
                value={filled.isi}
                onChange={(e) => setFilled({ ...filled, isi: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              ></textarea>
              <label
                htmlFor="isi"
                className={`absolute left-14 bg-white px-2 transition-all duration-200
            ${
              filled.isi
                ? "-top-3 text-xs text-orange-600"
                : "top-4 text-gray-400"
            }`}
              >
                Isi Pengaduan
              </label>
            </div>

            {/* FOTO */}
            <div className="relative">
              <Image
                className="absolute left-5 top-3.5 text-gray-700"
                size={20}
              />
              <input
                type="file"
                ref={fileRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full rounded-xl bg-gray-50 border border-gray-300 pl-14 py-2.5 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              />
            </div>

            {/* KOORDINAT */}
            <div className="relative">
              <MapPin
                className="absolute left-5 top-4 text-gray-700"
                size={22}
              />

              <input
                id="lokasi"
                type="text"
                value={filled.lokasi}
                onChange={(e) =>
                  setFilled({ ...filled, lokasi: e.target.value })
                }
                placeholder="Latitude, Longitude (contoh: -6.200000, 106.816666)"
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              />

              <label
                htmlFor="lokasi"
                className={`absolute left-14 bg-white px-2 transition-all duration-200
            ${
              filled.lokasi
                ? "-top-3 text-xs text-orange-600"
                : "top-4 text-gray-400"
            }`}
              >
                Lokasi (Koordinat)
              </label>

              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="absolute right-3 top-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 shadow-sm transition"
              >
                Buka Maps
              </button>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() =>
                  setFilled({ judul: "", tanggal: "", isi: "", lokasi: "" })
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl bg-red hover:bg-gray-100 transition"
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 transition"
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