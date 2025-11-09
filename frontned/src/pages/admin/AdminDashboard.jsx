import React from "react";
import { useNavigate } from "react-router-dom";
import MasyarakatList from "../../components/MasyarakatList";

export default function AdminDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4 text-center">
          Admin Dashboard
        </h1>
        <p className="text-gray-700 mb-2">Selamat datang, {user.nama_admin}</p>
        <p className="text-gray-500 mb-4">Selamat datang di admin dahsboard</p>
        <MasyarakatList />
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
