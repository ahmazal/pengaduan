import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Gauge, FileText, Clock, User, LogOut } from "lucide-react";

export default function NavUser() {
  const nav = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(true);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  // ACTIVE ITEM
  const activeClass =
  "bg-indigo-100/70 text-indigo-700 border-l-4 border-indigo-400 shadow-sm font-semibold";

  // HOVER
  const hoverItem =
  "hover:bg-indigo-50/70 hover:scale-[1.02] cursor-pointer transition-all duration-200";


  // HALAMAN AKTIF
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen text-slate-900 flex flex-col transition-all duration-300 shadow shadow-indigo-200 pb-8 ${
          open ? "w-64 px-4" : "w-20 px-2"
        }`}
      >
        {/* Header */}
        <div className="relative py-6 w-full">
          <button
            onClick={() => setOpen(!open)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-200/60 cursor-pointer transition"
          >
            <Menu size={26} />
          </button>

          <div className="text-center">
            {open && (
              <button
                onClick={() => nav("/")}
                className="font-bold tracking-wide text-xl hover:brightness-110 cursor-pointer transition"
              >
                Masyarakat
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => nav("/user/dashboard")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:shadow
              ${hoverItem} ${isActive("/user/dashboard") ? activeClass : ""}`}
          >
            <Gauge size={20} />
            {open && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => nav("/user/buatpengaduan")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:shadow
              ${hoverItem} ${
              isActive("/user/buatpengaduan") ? activeClass : ""
            }`}
          >
            <FileText size={20} />
            {open && <span>Buat Pengaduan</span>}
          </button>

          <button
            onClick={() => nav("/user/riwayat")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:shadow
              ${hoverItem} ${isActive("/user/riwayat") ? activeClass : ""}`}
          >
            <Clock size={20} />
            {open && <span>Riwayat Pengaduan</span>}
          </button>

          <button
            onClick={() => nav("/user/profile")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:shadow
              ${hoverItem} ${isActive("/user/profile") ? activeClass : ""}`}
          >
            <User size={20} />
            {open && <span>Profil</span>}
          </button>
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-auto flex justify-center items-center gap-3 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 hover:scale-[1.02] cursor-pointer transition-all"
        >
          <LogOut size={20} />
          {open && <span>Logout</span>}
        </button>
      </aside>
    </>
  );
}
