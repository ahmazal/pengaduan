import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../services/api";
import Swal from "sweetalert2"; // import sweetalert2
import BtnKembali from "../components/BtnKembali";

export default function Register() {
  const [form, setForm] = useState({
    nik: "",
    nama: "",
    tglLahir: "",
    password: "",
    email: "",
    telp: "",
    alamat: "",
  });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onChange = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await apiPost("/auth/register", form);
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Akun Anda telah dibuat. Silakan login untuk melanjutkan.",
        showConfirmButton: true,
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Login Sekarang",
      }).then(() => {
        nav("/login");
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text: "nik tersebut telah terdaftar",
        confirmButtonColor: "#dc2626",
      });
      setErr("Mohon masukkan data yang valid");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-transparent">
      <BtnKembali />
      <div className="bg-white p-8 rounded-sm w-full">
        <h2 className="text-3xl font-bold text-center text-zinc-600">
          Daftar Akun Masyarakat
        </h2>
        <p className="text-sm capitalize text-center text-zinc-600 mb-6">
          dan adukan keluhan anda
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap gap-4 justify-between"
        >
          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.nik}
              minLength={16}
              maxLength={16}
              onChange={onChange("nik")}
              placeholder="NIK"
              required
            />
          </div>

          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.nama}
              onChange={onChange("nama")}
              placeholder="Nama"
              required
            />
          </div>

          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.tglLahir}
              onChange={onChange("tglLahir")}
              type="date"
              required
            />
          </div>

          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.telp}
              onChange={onChange("telp")}
              placeholder="Nomor telepon"
              required
            />
          </div>

          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              type="email"
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.email}
              onChange={onChange("email")}
              placeholder="Email"
              required
            />
          </div>

          <div className="flex-1 min-w-[45%] w-full sm:w-[48%]">
            <input
              type="password"
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.password}
              onChange={onChange("password")}
              placeholder="Password"
              required
            />
          </div>

          <div className="w-full">
            <textarea
              className="w-full py-2 border-b focus:ring-0 focus:outline-none"
              value={form.alamat}
              onChange={onChange("alamat")}
              placeholder="Alamat"
              required
            />
          </div>

          {err && (
            <p className="w-full text-red-500 text-sm text-center">{err}</p>
          )}

          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-amber-600 text-white py-2 rounded-sm hover:bg-amber-700 transition"
            >
              Register
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
