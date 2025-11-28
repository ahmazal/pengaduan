import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.png";

function Navbar() {
  const [isActive, setIsActive] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.log("Error parsing user data");
      }
    }
  }, []);

  useEffect(() => {
    const HandleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 80) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
      setLastScroll(currentScroll);
    };
    window.addEventListener("scroll", HandleScroll);
    return () => window.removeEventListener("scroll", HandleScroll);
  }, [lastScroll]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    Navigate("/", { replace: true });
  };

  const handleToDashboard = () => {
    const role = localStorage.getItem("role");
    if (role === "Admin") Navigate("/admin/dashboard");
    else Navigate("/user/dashboard");
    setShowDropdown(false);
  };

  // =========== AVATAR FIRST LETTER FROM EMAIL ===========
  const getAvatarLetter = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`w-full z-30 fixed ${
        isActive ? "-translate-y-full" : "translate-y-0"
      } duration-300`}
    >
      <div className="px-4 py-2 flex justify-between items-center rounded-b-2xl">
        <div className="flex items-center justify-center px-3 py-1 gap-2">
          <div className="min-w-8 max-w-8 rounded-full overflow-hidden">
            <img src={logo} alt="logo" className="w-full h-full" />
          </div>
          <h2 className="text-xl text-amber-500 font-bold">LaporKang</h2>
        </div>

        <div className="flex shadow items-center border rounded-full px-4 py-2 border-zinc-100 gap-4 text-zinc-800 bg-white/20 backdrop-blur-sm">
          <button
            className="relative flex flex-col uppercase text-xs font-bold tracking-wider group overflow-hidden"
            onClick={() => scrollToSection("Beranda")}>
            <span className="block translate-y-0 group-hover:-translate-y-full transition-transform duration-300">
              Beranda
            </span>
            <span className="absolute left-0 top-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              Beranda
            </span>
          </button>
          <button
            className="relative flex flex-col uppercase text-xs font-bold tracking-wider group overflow-hidden"
            onClick={() => scrollToSection("Carakerja")}>
            <span className="block translate-y-0 group-hover:-translate-y-full transition-transform duration-300">
              Cara Kerja
            </span>
            <span className="absolute left-0 top-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              Cara Kerja
            </span>
          </button>
          <button
            className="relative flex flex-col uppercase text-xs font-bold tracking-wider group overflow-hidden"
            onClick={() => scrollToSection("Berita")}>
            <span className="block translate-y-0 group-hover:-translate-y-full transition-transform duration-300">
              Berita
            </span>
            <span className="absolute left-0 top-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              Berita
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="cursor-pointer focus:outline-none"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-amber-600 transition">
                  {getAvatarLetter()}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.nama || user?.nama_admin || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={handleToDashboard}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => Navigate("/Login")}
                className="cursor-pointer border border-transparent bg-amber-500 px-3 py-1 rounded-full text-white hover:bg-amber-600 transition"
              >
                Login
              </button>
              <span
                onClick={() => Navigate("/Register")}
                className="cursor-pointer border border-amber-500 px-3 py-1 rounded-full hover:bg-amber-50 transition"
              >
                Register
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
