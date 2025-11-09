import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../services/api";
import login from "../assets/img/login.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/login", { email, password });

      // validasi hasil respons
      if (!res || !res.token || !res.role) {
        throw new Error("Respons server tidak valid");
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("user", JSON.stringify(res.user));

      // redirect sesuai role
      if (res.role === "Admin") {
        nav("/admin/dashboard", { replace: true });
      } else {
        nav("/user/dashboard", { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat login";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen">
      {/* Gambar sisi kiri */}
      <div className="w-full hidden sm:flex md:w-1/2 h-64 md:h-screen relative items-center">
        <img
          src={login}
          alt="login"
          className="object-cover w-full h-full brightness-85"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-14 text-gray-100 backdrop-blur-sm md:bg-transparent">
          <h2 className="text-sm md:text-base">
            Selamat datang di pengaduan masyarakat
          </h2>
          <h1 className="text-xl md:text-3xl font-bold">
            Silahkan login dahulu
          </h1>
          <p className="text-xs md:text-sm max-w-sm">
            Segera laporkan keluhan anda dengan privasi data anda yang terjamin
            aman
          </p>
        </div>
      </div>

      {/* Form login sisi kanan */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex justify-center">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-700 mb-6">
            Login Akun
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 border-b border-gray-400 focus:border-amber-600 focus:ring-0 focus:outline-none text-sm md:text-base"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 border-b border-gray-400 focus:border-amber-600 focus:ring-0 focus:outline-none text-sm md:text-base"
                placeholder="Password"
                required
              />
            </div>

            {err && (
              <p className="text-red-500 text-sm border border-red-300 rounded px-4 py-2 bg-red-50">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700"
              } text-white py-2 rounded-sm transition`}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
