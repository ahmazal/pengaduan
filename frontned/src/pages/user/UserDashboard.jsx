import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";

import DashboardRingkasan from "../../components/DashboardRingkasan.jsx";
import ComplaintChart from "../../components/ComplaintChart.jsx";
import ComplaintTable from "../../components/ComplaintTable.jsx";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import NavUser from "../../components/NavUser.jsx";

function UserDashboard() {
  return (
    <div className="relative flex min-h-screen">
      <NavUser />
      <div className="ml-72">
        {/* HEADER DASHBOARD */}
        <div className="flex-3/4 items-center justify-between mb-6">
          {/* Judul */}
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Ringkasan */}
        <DashboardRingkasan />

        {/* Grafik */}
        <ComplaintChart />

        {/* Tabel Pengaduan */}
        <ComplaintTable />
      </div>
    </div>
  );
}

export default UserDashboard;
