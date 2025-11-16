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
      <aside className="w-64 bg-indigo-950 shadow-xl border-r p-6 flex flex-col fixed h-screen">
        <h2 className="text-2xl font-bold text-indigo-200 mb-8 text-center">
          Administrator
        </h2>

        <nav className="flex flex-col gap-4">
          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/listAduan")}
          >
            📝 Pengaduan
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
            onClick={() => nav("/admin/analytics")}
          >
            📈 Analitik
          </button>

          <button
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-white hover:text-black transition"
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