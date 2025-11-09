import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          Dashboard Masyarakat
        </h1>
        <p className="text-gray-700 mb-2">Halo, {user.nama}</p>
        <p className="text-gray-500 mb-4">selamat datang di user dashboard</p>
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
