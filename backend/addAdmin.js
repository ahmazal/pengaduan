const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "db_pengaduan",
});

async function addAdmin() {
  try {
    const nama_admin = "Admin Utama";
    const email = "admin@aduan.com";
    const passwordPlain = "admin123";

    // hash password
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    // insert ke tabel admin
    const [result] = await pool.query(
      "INSERT INTO admin (nama_admin, email, password) VALUES (?, ?, ?)",
      [nama_admin, email, hashedPassword]
    );

    console.log("Admin berhasil ditambahkan!");
    console.log("ID:", result.insertId);
    console.log("Email:", email);
    console.log("Password (plaintext):", passwordPlain);
  } catch (err) {
    console.error("Gagal menambahkan admin:", err.message);
  } finally {
    await pool.end();
  }
}

addAdmin();
