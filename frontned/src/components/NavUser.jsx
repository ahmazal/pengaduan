import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Gauge, FileText, Clock, User, LogOut } from "lucide-react";

export default function NavUser() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const [open, setOpen] = useState(true);

  const hoverItem =
    "hover:bg-indigo-200/60 hover:scale-[1.02] cursor-pointer transition-all duration-200";

  return (
    <>
    
    <aside
      className={`fixed top-0 left-0 h-screen bg-indigo-50 text-slate-900 flex flex-col transition-all duration-300 shadow-xl shadow-indigo-400 pb-8 ${
        open ? "w-64 px-4" : "w-20 px-2"
      }`}
    >
      {/* Header */}
      <div className="relative py-6 w-full">
        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-200/60 cursor-pointer transition"
        >
          <Menu size={26} />
        </button>

        {/* Judul */}
        <div className="text-center">
          {open && (
            <button
              onClick={() => nav("/")}
              className="font-bold text-indigo-800 tracking-wide text-xl hover:brightness-110 cursor-pointer transition"
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
          className={`flex items-center gap-3 px-3 py-2 rounded-lg shadow ${hoverItem}`}
        >
          <Gauge size={20} />
          {open && <span>Dashboard</span>}
        </button>

        <button
          onClick={() => nav("/user/buatpengaduan")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg shadow ${hoverItem}`}
        >
          <FileText size={20} />
          {open && <span>Buat Pengaduan</span>}
        </button>

        <button
          onClick={() => nav("/user/riwayat")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg shadow ${hoverItem}`}
        >
          <Clock size={20} />
          {open && <span>Riwayat Pengaduan</span>}
        </button>

        <button
          onClick={() => nav("/user/profil")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg shadow ${hoverItem}`}
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