import React from "react";
import { useNavigate } from "react-router-dom";

export default function NavUser() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <aside className="min-w-64 bg-indigo-950 shadow-xl border-r p-6 flex flex-col min-h-screen fixed">
      <h2 className="text-2xl font-bold text-indigo-200 mb-8 text-center">
        Masyarakat
      </h2>

      <nav className="flex flex-col gap-4 text-white">
        <button
          onClick={() => nav("/user/dashboard")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 hover:text-black transition"
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => nav("/user/buatpengaduan")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 hover:text-black transition"
        >
          📝 Buat Pengaduan
        </button>

        <button
          onClick={() => nav("/user/pengaduan")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 hover:text-black transition"
        >
          📄 Pengaduan Saya
        </button>

        <button
          onClick={() => nav("/user/profil")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 hover:text-black transition"
        >
          👤 Profil
        </button>
      </nav>

      <button
        onClick={logout}
        className="mt-auto bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </aside>
  );
}
