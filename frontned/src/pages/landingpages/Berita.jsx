import { useEffect, useRef, useState } from "react";
import jln from "../../assets/img/JlnRusak.jpg";
import kriminalitas from "../../assets/img/kriminalitas.jpg";
import pelayanan from "../../assets/img/pelayanan.jpg";
import fasilitas from "../../assets/img/fasilitas.jpg";
import Title from "../../components/Title";

const Berita = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrolRef = useRef(null);

  const cards = [
    {
      id: 1,
      image: jln,
      title: "jalan rusak",
      judul: "Berita Terkini",
      description: "jalan rusak",
      point:
        "Permukaan jalan banyak berlubang dan retak, beberapa bagian mengalami penurunan profil (ambles). Lubang-lubang tersebut berukuran sedang hingga besar sehingga menyulitkan kendaraan roda dua dan roda empat, serta berpotensi menyebabkan kecelakaan terutama pada malam hari ketika penerangan minim. Genangan air sering terbentuk setelah hujan, memperparah kerusakan.",
    },
    {
      id: 2,
      image: kriminalitas,
      title: "Klitih",
      judul: "Berita Terkini",
      description: "Terjadi aksi penyerangan",
      point:
        "Terjadi tindakan klitih di wilayah Desa Cihuy pada malam hari di sekitar area jalan utama. Pelaku diduga sekelompok remaja yang melakukan tindakan intimidasi dan mencoba menyerang pengguna jalan dengan benda tumpul. Kejadian ini membuat warga merasa tidak aman, terutama saat beraktivitas pada malam hari. Mohon pihak berwenang melakukan patroli, pendataan, dan penindakan agar kondisi kembali aman serta mencegah kejadian serupa terulang.",
    },
    {
      id: 3,
      image: fasilitas,
      title: "fasilitas",
      judul: "Berita Terkini",
      description: "Fasilitas Rusak",
      point:
        "Rambu lalu lintas di area perempatan Desa Cihuy mengalami kerusakan. Tiangnya miring dan permukaan rambunya pudar serta tergores sehingga tanda tidak terlihat jelas oleh pengendara. Kondisi ini membuat banyak pengendara tidak menyadari larangan tersebut dan tetap melakukan putar arah, yang mengakibatkan potensi konflik lalu lintas.",
    },
    {
      id: 4,
      image: pelayanan,
      title: "pelayanan",
      judul: "Berita Terkini",
      description: "Pelayanan Buruk",
      point:
        "Pelayanan publik di kantor Desa Cihuy dirasakan kurang baik oleh warga. Beberapa keluhan yang muncul meliputi proses pelayanan yang lambat, kurangnya kejelasan informasi, serta sikap petugas yang dianggap kurang responsif ketika warga meminta bantuan atau penjelasan. Warga sering harus menunggu terlalu lama meskipun antrean tidak ramai. Selain itu, beberapa permohonan administrasi desa juga tidak dikerjakan sesuai batas waktu yang dijanjikan.",
    },
  ];

  useEffect(() => {
    const intervaled = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(intervaled);
  }, [cards.length]);

  useEffect(() => {
    const el = scrolRef.current;
    if (!el) return;
    const cardEl = el.querySelector(".card");
    if (!cardEl) return;
    const cardWidth = cardEl.offsetWidth + 12;
    el.scrollTo({ left: currentIndex * cardWidth, behavior: "smooth" });
  }, [currentIndex]);

  const goToSlide = (index) => setCurrentIndex(index);
  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % cards.length);

  return (
    <div id="Berita">
      <Title
        title={"Berita terkini"}
        subTitle={"aduan yang baru baru ini sudah di selesaikan"}
      />
      <section  className="flex flex-col">
        <div
          id="Service"
          className="w-full min-h-screen px-4 sm:px-8 lg:px-14 py-8 relative"
        >
          {/* Tombol Navigasi */}
          <button
            onClick={goToPrevious}
            className="absolute shadow-lg shadow-gray-300 left-2 sm:left-4 lg:left-20 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-gray-100 p-2 sm:p-3 rounded transition"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute shadow-lg shadow-gray-300 right-2 sm:right-4 lg:right-20 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-gray-100 p-2 sm:p-3 rounded transition"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel */}
          <div
            ref={scrolRef}
            className="w-full overflow-x-auto scroll-smooth scrollbar-hide"
          >
            <div className="flex gap-4 pb-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`card flex flex-col sm:flex-row w-full min-w-[90%] sm:min-w-[600px] md:min-w-[800px] lg:min-w-[1000px] h-auto sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden shrink-0 transition-all duration-300 ${
                    index === currentIndex ? "scale-[1.01]" : ""
                  }`}
                >
                  <div className="flex-1 w-full sm:w-1/2">
                    <img
                      className="w-full h-64 sm:h-full object-cover"
                      src={card.image}
                      alt={card.title}
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center flex-col p-4 sm:p-6 space-y-3 text-center">
                    <p className="text-xs sm:text-sm tracking-[0.15em]">
                      {card.judul}
                    </p>
                    <p className="text-lg sm:text-2xl font-semibold">
                      {card.description}
                    </p>
                    <p className="text-xs sm:text-sm">{card.point}</p>
                    <div className="px-4 py-2 bg-green-200 rounded-full border border-green-950">
                      <h1 className="text-green-900">Selesai</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicator */}
          <div className="flex flex-col items-center mt-6 sm:mt-10">
            <div className="flex justify-center space-x-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-black scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Berita;
