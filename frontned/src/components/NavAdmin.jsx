import React from 'react'
import { useNavigate } from 'react-router-dom'

function NavAdmin() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <>
      {/* ======================== Sidebar ======================== */}
      <aside className="w-64 bg-indigo-50 shadow-lg shadow-black p-6 flex flex-col fixed h-screen">
        <button 
        onClick={() => nav("/")}
        className="text-2xl cursor-pointer font-bold text-indigo-800 mb-8 text-center">
          Administrator
        </button>

        <nav className="flex flex-col gap-4">
          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 bg-indigo-300 text-black hover:text-white transition"
            onClick={() => nav("/admin/dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 bg-indigo-300 text-black hover:text-white transition"
            onClick={() => nav("/admin/listAduan")}
          >
            📝 Pengaduan
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 bg-indigo-300 text-black hover:text-white transition"
            onClick={() => nav("/admin/analytics")}
          >
            📈 Analitik
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-800 bg-indigo-300 text-black hover:text-white transition"
            onClick={() => nav("/admin/profil")}
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
    </>
  )
}

export default NavAdmin