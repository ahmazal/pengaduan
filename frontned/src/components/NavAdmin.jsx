import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { TbReportAnalytics } from "react-icons/tb";
import { IoAnalyticsOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { LogOut } from "lucide-react";
import { MdAdminPanelSettings } from "react-icons/md";

function NavAdmin() {
  const nav = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  // ACTIVE ITEM (sama seperti sidebar masyarakat)
  const activeClass =
    "bg-indigo-100/70 text-indigo-700 border-l-4 border-indigo-400 shadow-sm font-semibold";

  // HOVER ITEM (sama seperti masyarakat)
  const hoverItem =
    "hover:bg-indigo-50/70 hover:scale-[1.02] cursor-pointer transition-all duration-200";

  // CEK HALAMAN AKTIF
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="fixed h-screen w-64 bg-white shadow shadow-indigo-200 flex flex-col p-6">
        
        {/* Header */}
        <button
          onClick={() => nav("/")}
          className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-900 mb-8 text-center cursor-pointer hover:brightness-110 transition"
        >
          <MdAdminPanelSettings size={28} />
          Administrator
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">

          {/* Dashboard */}
          <button
            onClick={() => nav("/admin/dashboard")}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg 
            ${hoverItem} ${
              isActive("/admin/dashboard") ? activeClass : ""
            }`}
          >
            <AiOutlineDashboard size={20} />
            Dashboard
          </button>

          {/* Pengaduan */}
          <button
            onClick={() => nav("/admin/listAduan")}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg 
            ${hoverItem} ${
              isActive("/admin/listAduan") ? activeClass : ""
            }`}
          >
            <TbReportAnalytics size={20} />
            Pengaduan
          </button>

          {/* Analitik */}
          <button
            onClick={() => nav("/admin/analytics")}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg 
            ${hoverItem} ${
              isActive("/admin/analytics") ? activeClass : ""
            }`}
          >
            <IoAnalyticsOutline size={20} />
            Analitik
          </button>

          {/* Profil */}
          <button
            onClick={() => nav("/admin/profile")}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg 
            ${hoverItem} ${
              isActive("/admin/profile") ? activeClass : ""
            }`}
          >
            <CiUser size={20} />
            Profil
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

export default NavAdmin;
