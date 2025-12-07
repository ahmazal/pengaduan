import { FileText, Calendar, MessageCircle, Image, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import NavUser from "../../components/NavUser";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

// ICON LEAFLET
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function FormPengaduan() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [filled, setFilled] = useState({
    judul: "",
    tanggal: "",
    isi: "",
    lokasi: "",
  });

  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);

  // AUTOCOMPLETE SEARCH 
  function SearchControl({ setSelectedPos, setFilled }) {
    const map = useMapEvents({});

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider: provider,
        style: "bar",
        autoComplete: true,
        autoCompleteDelay: 200,
        searchLabel: "Cari lokasi...",
        keepResult: true,
        showMarker: false,
      });

      map.addControl(searchControl);

      // hasil pencarian
      map.on("geosearch/showlocation", (result) => {
        const { x, y, label } = result.location;

        // marker 
        setSelectedPos([y, x]);

        // isi otomatis alamat 
        setFilled((prev) => ({
          ...prev,
          lokasi: label,
        }));

        map.setView([y, x], 17);
      });

      return () => map.removeControl(searchControl);
    }, []);

    return null;
  }

  // ambil ALAMAT OTOMATIS
  function ClickMap() {
    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        setSelectedPos([lat, lng]);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();

          setFilled((prev) => ({
            ...prev,
            lokasi: data.display_name || `${lat}, ${lng}`,
          }));
        } catch {
          setFilled((prev) => ({
            ...prev,
            lokasi: `${lat}, ${lng}`,
          }));
        }
      },
    });

    return null;
  }


  // SUBMIT
  const handleSubmit = async () => {
    if (!filled.judul || !filled.tanggal || !filled.isi || !filled.lokasi) {
      return Swal.fire({
        icon: "error",
        title: "Validasi Error",
        text: "Semua field wajib diisi.",
        confirmButtonColor: "#ea580c",
      });
    }

    if (!file) {
      return Swal.fire({
        icon: "error",
        title: "Validasi Error",
        text: "Foto wajib diupload.",
        confirmButtonColor: "#ea580c",
      });
    }

    const formData = new FormData();
    formData.append("nik", user.nik);
    formData.append("judul_pengaduan", filled.judul);
    formData.append("tgl_pengaduan", filled.tanggal);
    formData.append("isi_laporan", filled.isi);
    formData.append("lokasi", filled.lokasi);
    formData.append("foto", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pengaduan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!data.success)
        return Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.message || "Gagal mengirim pengaduan.",
          confirmButtonColor: "#ea580c",
        });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengaduan berhasil dikirim!",
        confirmButtonColor: "#ea580c",
      });

      setFilled({ judul: "", tanggal: "", isi: "", lokasi: "" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan server: " + err.message,
        confirmButtonColor: "#ea580c",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavUser />

      <main className="ml-64 w-full min-h-screen bg-gray-100 p-10">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow border border-gray-200">
          <h1 className="text-3xl font-bold mb-1">Buat Pengaduan</h1>
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
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14"
              />
              <label
                htmlFor="judul"
                className={`absolute left-14 bg-white px-2 transition-all duration-200 ${
                  filled.judul
                    ? "-top-3 text-xs text-orange-600"
                    : "top-4 text-gray-400"
                }`}
              >
                Judul Pengaduan
              </label>
            </div>

            {/* Tanggal */}
            <div className="relative ">
              <Calendar
                className="absolute left-5 top-4 text-gray-700" 
                size={22}
              />
              <input
                id="tanggal"
                type="date"
                value={filled.tanggal}
                onChange={(e) =>
                  setFilled({ ...filled, tanggal: e.target.value })
                }
                className=" cursor-pointer w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14"
              />
              <label
                htmlFor="tanggal"
                className={`absolute left-14 bg-white px-2 transition-all duration-200  ${
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
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14"
              />
              <label
                htmlFor="isi"
                className={`absolute left-14 bg-white px-2 transition-all duration-200 ${
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
                className="cursor-pointer absolute left-5 top-3.5 text-gray-700"
                size={20}
              />
              <input
                type="file"
                ref={fileRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="cursor-pointer w-full rounded-xl bg-gray-50 border border-gray-300 pl-14 py-2.5"
              />
            </div>

            {/* LOKASI */}
            <div className="relative">
              <MapPin
                className="absolute left-5 top-4 text-gray-700"
                size={22}
              />

              <input
                id="lokasi"
                type="text"
                value={filled.lokasi}
                readOnly
                className="w-full rounded-xl bg-gray-50 border border-gray-300 p-4 pl-14"
                placeholder="Klik tombol pilih lokasi → pilih titik di peta"
              />

              <label
                htmlFor="lokasi"
                className={`absolute left-14 bg-white px-2 transition-all duration-200 ${
                  filled.lokasi
                    ? "-top-3 text-xs text-orange-600"
                    : "top-4 text-gray-400"
                }`}
              >
                
              </label>

              {/* OPEN MAP BUTTON */}
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="cursor-pointer absolute right-3 top-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Pilih Lokasi
              </button>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() =>
                  setFilled({ judul: "", tanggal: "", isi: "", lokasi: "" })
                }
                className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-xl"
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="cursor-pointer px-8 py-3 bg-orange-600 text-white rounded-xl"
              >
                Kirim Pengaduan
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* LEAFLET*/}
      {isMapOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl w-[90%] max-w-2xl relative">
            <h2 className="text-lg font-semibold mb-2">Pilih Lokasi</h2>

            <div className="h-[350px] rounded overflow-hidden">
              <MapContainer
                center={[-6.2, 106.816666]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* SEARCH BAR */}
                <SearchControl
                  setSelectedPos={setSelectedPos}
                  setFilled={setFilled}
                />

                <ClickMap />

                {selectedPos && <Marker position={selectedPos} />}
              </MapContainer>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsMapOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
