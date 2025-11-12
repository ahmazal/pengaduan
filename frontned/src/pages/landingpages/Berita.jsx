import { TfiHelpAlt } from "react-icons/tfi"
import Title from "../../components/Title"
import { RiUserVoiceLine } from "react-icons/ri"
import { GrSystem } from "react-icons/gr"

function Berita() {
  const ListLayanan = [
      {
        symbol: <TfiHelpAlt />,
        title: "Professional",
        data: "Layanan kami hadir untuk menampung dan menindaklanjuti setiap pengaduan masyarakat secara cepat, transparan, dan bertanggung jawab"
      },
      {
        symbol: <RiUserVoiceLine />,
        title: "prioritaskan",
        data: "Suara Anda berharga. Laporkan keluhan Anda, dan kami akan berupaya memberikan solusi terbaik"
      },
      {
        symbol: <GrSystem />,
        title: "title",
        data: "Sistem pengaduan masyarakat kami dirancang untuk memudahkan pelaporan, pemantauan, dan penyelesaian setiap aduan secara terukur"
      },
    ]

  return (
    <div id="Berita">
      <Title 
      title={"Berita terkini"}
      subTitle={"aduan yang baru baru ini sudah di selesaikan"}
      />
      <div>
        <div className="flex items-center justify-center gap-4 px-8 py-4">
          {ListLayanan.map((item, i) => {
            return (
              <div key={i} className="flex-1/3 shadow-md min-h-48 flex flex-col rounded-sm p-4 justify-between hover:-translate-y-1 duration-300">
                <h1 className="flex justify-center items-center text-4xl">{item.symbol}</h1>
                <div className="min-h-16">
                <h1>{item.title}</h1>
                  <h1 className="text-xs">{item.data}</h1>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Berita