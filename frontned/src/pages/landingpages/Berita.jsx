import { useEffect, useRef, useState } from "react";
import Title from "../../components/Title";
import apiClient from "../../api/apiClient";

const Berita = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrolRef = useRef(null);

  // Fetch berita dari backend
  const fetchBerita = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pengaduan/berita/completed");
      
      const data = Array.isArray(res.data)
        ? res.data[0]?.payload || []
        : res.data.payload || res.data.data || [];

      if (data.length > 0) {
        // Transform backend data ke format cards
        const transformedCards = data.map((item, index) => ({
          id: item.id_pengaduan,
          image: `http://localhost:5000/uploads/${item.foto}`,
          title: item.judul_pengaduan,
          judul: "Berita Terkini",
          description: item.judul_pengaduan,
          point: item.isi_laporan,
        }));

        setCards(transformedCards);
      } else {
        setCards(fallbackCards);
      }
    } catch (err) {
      console.error("Gagal fetch berita:", err);
      setCards(fallbackCards);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  useEffect(() => {
    const intervaled = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (cards.length || 1));
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
    setCurrentIndex((prev) => (prev === 0 ? (cards.length || 1) - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % (cards.length || 1));

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
