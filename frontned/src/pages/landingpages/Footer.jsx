import { FaWhatsapp, FaInstagram, FaSquareTwitter } from "react-icons/fa6";
import { FaSquareFacebook } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Brand Section */}
        <section>
          <h1 className="text-3xl font-bold text-amber-500 mb-3">LaporKang</h1>
          <p className="text-gray-400 leading-relaxed">
            LaporKang adalah sebuah website pengaduan masyarakat dengan
            transparansi dan keamanan yang terjamin.
          </p>
        </section>

        {/* Social Section */}
        <section>
          <h1 className="text-xl font-semibold text-amber-500 mb-3 uppercase">
            Ikuti Kami
          </h1>
          <div className="flex gap-4 text-2xl">
            <span className="hover:text-green-400 cursor-pointer transition">
              <FaWhatsapp />
            </span>
            <span className="hover:text-pink-500 cursor-pointer transition">
              <FaInstagram />
            </span>
            <span className="hover:text-blue-500 cursor-pointer transition">
              <FaSquareFacebook />
            </span>
            <span className="hover:text-sky-400 cursor-pointer transition">
              <FaSquareTwitter />
            </span>
          </div>
        </section>
      </div>

      {/* Bottom */}
      <div className="text-center text-gray-500 text-sm mt-10 pt-5 border-t border-gray-700">
        © {new Date().getFullYear()} LaporKang — Semua hak cipta dilindungi.
      </div>
    </footer>
  );
}

export default Footer;
