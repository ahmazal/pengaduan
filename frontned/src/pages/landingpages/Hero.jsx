import LighRays from "../../components/fixtures/LightRays";
import Title from "../../components/Title";
import { useNavigate } from "react-router-dom";
import { FcAdvertising, FcEngineering, FcPositiveDynamic } from "react-icons/fc";

function Hero() {
  const nav = useNavigate();

  const ListLayanan = [
    {
      symbol: <FcPositiveDynamic />,
      title: "Professional",
      data: "Layanan kami hadir untuk menampung dan menindaklanjuti setiap pengaduan masyarakat secara cepat, transparan, dan bertanggung jawab",
    },
    {
      symbol: <FcAdvertising />,
      title: "Prioritas",
      data: "Suara Anda berharga. Laporkan keluhan Anda, dan kami akan berupaya memberikan solusi terbaik",
    },
    {
      symbol: <FcEngineering />,
      title: "Flexible",
      data: "Sistem pengaduan masyarakat kami dirancang untuk memudahkan pelaporan, pemantauan, dan penyelesaian setiap aduan secara terukur",
    },
  ];

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "600px",
          position: "relative",
          position: "absolute",
          zIndex: "-10",
        }}
      >
        <LighRays
          raysOrigin="top-center"
          raysColor="#00b0f0"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div
        id="Beranda"
        className="flex min-h-screen justify-center items-center flex-col gap-4"
      >
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-bold flex flex-col">
            <span>Layanan Pengaduan</span>
            <span className="text-blue-500">Masyarakat</span>
          </h1>
          <h3 className="text-sm ">
            Sampaikan aspirasi anda dengan data yang aman terpercaya dengan
            mudah dan kami akan memastikan setiap aduan akan ditindak lanjuti
          </h3>
        </div>
        <div>
          <button
            onClick={() => nav("/user/buatpengaduan")}
            className="text-2xl font-bold border border-amber-500 px-4 py-2 rounded-full hover:bg-amber-500 hover:text-white duration-300 cursor-pointer"
          >
            ajukan aduan
          </button>
        </div>
      </div>

      <section className="relative">
        <Title
          title={"Layanan Kami"}
          subTitle={
            "Kami siap menerima setiap laporan dan keluhan Anda demi terciptanya pelayanan publik yang lebih baik"
          }
        />
        <div>
          <div className="flex items-center justify-center gap-4 px-8 py-4">
            {ListLayanan.map((item, i) => {
              return (
                <div
                  key={i}
                  className="flex flex-col text-center max-w-xs p-4 justify-between hover:-translate-y-1 duration-300"
                >
                  <h1 className="flex justify-center items-center text-4xl">
                    {item.symbol}
                  </h1>
                  <div className="min-h-16 flex justify-center items-center flex-col">
                    <h1>{item.title}</h1>
                    <h1 className="text-xs">{item.data}</h1>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
