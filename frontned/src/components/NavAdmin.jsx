import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineDashboard } from "react-icons/ai";
import { TbReportAnalytics } from "react-icons/tb";
import { IoAnalyticsOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";

function NavAdmin() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <>
      {/* ======================== Sidebar ======================== */}
      <aside className="w-64 bg-indigo-50 shadow-xl shadow-indigo-200 p-6 flex flex-col fixed h-screen">
        <button 
        onClick={() => nav("/")}
        className="text-2xl cursor-pointer font-bold text-indigo-800 mb-8 text-center">
          Administrator
        </button>

        <nav className="flex flex-col gap-4">
          <button
            className="text-left flex items-center gap-4 cursor-pointer px-4 py-2 rounded-lg hover:bg-indigo-200 shadow text-black transition"
            onClick={() => nav("/admin/dashboard")}
          >
            <span><AiOutlineDashboard /></span> 
            Dashboard
          </button>

          <button
            className="text-left flex items-center gap-4 cursor-pointer px-4 py-2 rounded-lg hover:bg-indigo-200 shadow text-black transition"
            onClick={() => nav("/admin/listAduan")}
          >
            <span><TbReportAnalytics /></span>
            Pengaduan
          </button>

          <button
            className="text-left flex items-center gap-4 cursor-pointer px-4 py-2 rounded-lg hover:bg-indigo-200 shadow text-black transition"
            onClick={() => nav("/admin/analytics")}
          >
            <span><IoAnalyticsOutline /></span>
            Analitik
          </button>

          <button
            className="text-left flex items-center gap-4 cursor-pointer px-4 py-2 rounded-lg hover:bg-indigo-200 shadow text-black transition"
            onClick={() => nav("/admin/profil")}
          >
            <span><CiUser /></span>
            Profil
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-500 cursor-pointer text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>
    </>
  )
}

export default NavAdmin