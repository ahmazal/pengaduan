import React, { useEffect, useState } from "react";
import NavUser from "../NavUser";
import NavAdmin from "../NavAdmin";

export default function UserProfile() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");

  const [user, setUser] = useState({
    nama: stored.nama || "",
    email: stored.email || "",
    nik: stored.nik || "",
    foto: stored.foto || null,
    password: stored.password || "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(stored.foto || null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const role = localStorage.getItem("role") || "user";

  const [tab, setTab] = useState("account");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const saveProfile = () => {
    const updated = { ...user };
    if (file && preview) updated.foto = preview;

    localStorage.setItem("user", JSON.stringify(updated));
    alert("Data profil berhasil diperbarui");
  };

  const getAvatarLetter = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const updatePassword = () => {
    if (!oldPass) return setPassError("Password lama wajib diisi");
    if (oldPass !== user.password) return setPassError("Password lama salah");
    if (newPass.length < 6) return setPassError("Minimal 6 karakter");
    if (newPass !== confirmPass) return setPassError("Konfirmasi tidak cocok");

    const updated = { ...user, password: newPass };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setPassError("");
    alert("Password berhasil diperbarui");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {role === "Admin" ? <NavAdmin /> : <NavUser />}
      {/* MAIN */}
      <div className="flex-1 pl-64">
        {/* HEADER */}
        <div className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        {/* COVER GRADIENT */}
        <div className="relative h-48 w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-linear-to-br 
            from-yellow-300 via-pink-300 to-cyan-300 
            opacity-80 backdrop-blur-3xl"
          ></div>

          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-6 left-10 w-16 h-16 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-20 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-6 left-32 w-20 h-20 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-2 right-10 w-28 h-28 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-6 -mt-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT CARD */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-amber-600 transition">
                      {getAvatarLetter()}
                    </div>
                  )}
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <span
                  className="px-3 py-2 rounded-md text-white font-medium 
                  bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 shadow"
                >
                  Upload Foto
                </span>
              </label>

              <h2 className="text-lg font-semibold mt-4">{user.nama}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>

            {/* RIGHT CARD */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
              {/* TABS */}
              <div className="flex gap-6 border-b mb-6 text-gray-600">
                <button
                  className={`pb-2 ${
                    tab === "account"
                      ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                      : "hover:text-blue-600"
                  }`}
                  onClick={() => setTab("account")}
                >
                  Pengaturan Akun
                </button>

                <button
                  className={`pb-2 ${
                    tab === "password"
                      ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                      : "hover:text-blue-600"
                  }`}
                  onClick={() => setTab("password")}
                >
                  Ubah Password
                </button>
              </div>

              {/* ACCOUNT SETTINGS */}
              {tab === "account" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Nama</label>
                    <input
                      className="w-full border p-2 mt-1 rounded"
                      value={user.nama}
                      disabled
                      onChange={(e) =>
                        setUser({ ...user, nama: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Email</label>
                    <input
                      className="w-full border p-2 mt-1 rounded"
                      value={user.email}
                      disabled
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">NIK</label>
                    <input
                      className="w-full border p-2 mt-1 rounded"
                      value={user.nik}
                      disabled
                      onChange={(e) =>
                        setUser({ ...user, nik: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Negara</label>
                    <select className="w-full border p-2 mt-1 rounded">
                      <option>Indonesia</option>
                    </select>
                  </div>

                  {/* <button
                    onClick={saveProfile}
                    className="col-span-2 mt-4 px-6 py-3 text-white rounded font-medium
                    bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 shadow"
                  >
                    Update
                  </button> */}
                </div>
              )}

              {/* UBAH PASSWORD */}
              {tab === "password" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Password Lama</label>
                    <input
                      type="password"
                      className="w-full border p-2 mt-1 rounded"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm">Password Baru</label>
                    <input
                      type="password"
                      className="w-full border p-2 mt-1 rounded"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm">Konfirmasi Password</label>
                    <input
                      type="password"
                      className="w-full border p-2 mt-1 rounded"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>

                  {passError && (
                    <p className="text-red-600 text-sm">{passError}</p>
                  )}

                  <button
                    onClick={updatePassword}
                    className="px-6 py-3 text-white rounded font-medium bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 shadow"
                  >
                    Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
