const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const pool = require("../config/db");
const response = require("../response");
const auth = require("../middleware/auth");

// Konfigurasi Multer untuk upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ==================== GET Endpoints ====================

// GET semua pengaduan
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan ORDER BY tgl_pengaduan DESC"
    );
    return response(200, rows, "Data pengaduan ditemukan", res);
  } catch (err) {
    console.error("Error:", err);
    return response(500, null, "Gagal mengambil pengaduan", res);
  }
});

// GET detail pengaduan by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );

    if (rows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }

    return response(200, rows[0], "Detail pengaduan ditemukan", res);
  } catch (err) {
    console.error("Error:", err);
    return response(500, null, "Gagal mengambil detail pengaduan", res);
  }
});

// GET pengaduan yang sudah selesai (untuk news/berita)
router.get("/berita/completed", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan WHERE status = 'Selesai' ORDER BY tgl_pengaduan DESC LIMIT 10"
    );
    return response(200, rows, "Data berita ditemukan", res);
  } catch (err) {
    console.error("Error:", err);
    return response(500, null, "Gagal mengambil data berita", res);
  }
});

// ==================== POST Endpoints ====================

// CREATE pengaduan baru (user)
router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const { nik, judul_pengaduan, tgl_pengaduan, isi_laporan, lokasi } = req.body;

    // Validasi input
    if (!nik || !judul_pengaduan || !tgl_pengaduan || !isi_laporan || !lokasi) {
      return response(400, null, "Data tidak lengkap", res);
    }

    if (!req.file) {
      return response(400, null, "Foto wajib diupload", res);
    }

    // Validasi NIK dari token
    const userNik = req.user.nik;
    if (nik !== userNik) {
      return response(403, null, "NIK tidak sesuai dengan user yang login", res);
    }

    const foto = req.file.filename;

    // Insert ke database
    const sql = `
      INSERT INTO pengaduan (nik, judul_pengaduan, tgl_pengaduan, isi_laporan, foto, lokasi, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')
    `;

    const [result] = await pool.query(sql, [
      nik,
      judul_pengaduan,
      tgl_pengaduan,
      isi_laporan,
      foto,
      lokasi,
    ]);

    return response(
      201,
      { id_pengaduan: result.insertId, status: "Menunggu" },
      "Pengaduan berhasil dibuat",
      res
    );
  } catch (err) {
    console.error("Error create pengaduan:", err);
    return response(500, null, "Kesalahan server saat membuat pengaduan", res);
  }
});

// ==================== PUT Endpoints ====================

// UPDATE status pengaduan (admin only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status
    const validStatus = ["Menunggu", "Diproses", "Selesai", "Tidak Valid"];
    if (!validStatus.includes(status)) {
      return response(400, null, "Status tidak valid", res);
    }

    // Update database
    const [result] = await pool.query(
      "UPDATE pengaduan SET status = ? WHERE id_pengaduan = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }

    return response(
      200,
      { id_pengaduan: id, status },
      "Status pengaduan berhasil diupdate",
      res
    );
  } catch (err) {
    console.error("Error update status:", err);
    return response(500, null, "Gagal update status pengaduan", res);
  }
});

module.exports = router;
