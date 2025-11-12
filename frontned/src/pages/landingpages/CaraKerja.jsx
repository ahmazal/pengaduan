import Title from "../../components/Title";

function CaraKerja() {
  const steps = [
    {
      title: "Buat akun",
      desc: "Mulai proses dengan mengisi formulir awal",
      side: "left",
    },
    {
      title: "Login",
      desc: "Tunggu verifikasi dari petugas",
      side: "right",
    },
    {
      title: "Langkah 3",
      desc: "Pantau status laporan Anda secara berkala",
      side: "left",
    },
    {
      title: "Langkah 3",
      desc: "Pantau status laporan Anda secara berkala",
      side: "right",
    },
  ];

  return (
    <div id="Carakerja">
      <Title title={"Cara Kerja"} subTitle={"cara melakukan pengaduan"} />
      <div className="relative flex flex-col items-center py-10">
        {/* Garis utama */}
        <div className="absolute left-1/2 top-0 h-full w-1 bg-gray-300 transform -translate-x-1/2"></div>

        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center w-full mb-10 ${
              step.side === "left" ? "justify-start" : "justify-end"
            }`}
          >
            {step.side === "left" ? (
              <>
                {/* Kiri */}
                <div className="w-1/2 px-4 text-right">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>

                {/* Titik */}
                <div className="relative flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full border-4 border-white z-10">{index+1}</div>

                {/* Kosong kanan */}
                <div className="w-1/2"></div>
              </>
            ) : (
              <>
                {/* Kosong kiri */}
                <div className="w-1/2"></div>

                {/* Titik */}
                <div className="relative flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full border-4 border-white z-10">{index+1}</div>

                {/* Kanan */}
                <div className="w-1/2 px-4 text-left">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaraKerja;
