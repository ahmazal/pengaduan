import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";

import DashboardRingkasan from "../../components/DashboardRingkasan.jsx";
import UserComplaintChart from "../../components/UserComplaintChart.jsx";
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
        </div>

        {/* Ringkasan */}
        <DashboardRingkasan />

        {/* Grafik */}
        <UserComplaintChart />

        {/* Tabel Pengaduan */}
        <ComplaintTable />
      </div>
    </div>
  );
}

export default UserDashboard;
