import React from "react";
import { useNavigate } from "react-router-dom";

export default function NavUser() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <aside className="min-w-64 bg-indigo-50 shadow-lg shadow-black p-6 flex flex-col min-h-screen fixed">
      <button 
      onClick={() => nav("/")}
      className="text-2xl cursor-pointer font-bold text-indigo-800 mb-8 white bg-indigo-300-center">
        Masyarakat
      </button>

      <nav className="flex flex-col gap-4 text-white">
        <button
          onClick={() => nav("/user/dashboard")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 hover:text-white text-black bg-indigo-300 transition"
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => nav("/user/buatpengaduan")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 hover:text-white text-black bg-indigo-300 transition"
        >
          📝 Buat Pengaduan
        </button>

        <button
          onClick={() => nav("/user/riwayat")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 hover:text-white text-black bg-indigo-300 transition"
        >
          📋 Riwayat Pengaduan
        </button>

        <button
          onClick={() => nav("/user/profil")}
          className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 hover:text-white text-black bg-indigo-300 transition"
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
