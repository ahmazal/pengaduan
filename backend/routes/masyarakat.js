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

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM masyarakat");
    response(200, rows, "data berhasil diambil", res);
  } catch (error) {
    response(500, null, "data gagal diambil", res);
  }
});

// GET pengaduan by NIK (untuk user dashboard)
router.get("/pengaduan", auth, async (req, res) => {
  try {
    const nik = req.user.nik;
    const [rows] = await pool.query(
      `
  SELECT p.*, m.nama, m.email
  FROM pengaduan p
  JOIN masyarakat m ON p.nik = m.nik
  WHERE p.nik = ?
  ORDER BY p.tgl_pengaduan DESC
  `,
      [nik]
    );
    response(200, rows, "pengaduan berhasil diambil", res);
  } catch (error) {
    console.error("Error:", error);
    response(500, null, "pengaduan gagal diambil", res);
  }
});

// UPDATE pengaduan lengkap (user hanya bisa edit pengaduan miliknya)
router.put("/pengaduan/:id", auth, upload.single("foto"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nik, judul_pengaduan, tgl_pengaduan, isi_laporan, status } =
      req.body;
    const userNik = req.user.nik;

    // Cek apakah pengaduan ada
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );

    if (rows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }

    // Cek apakah user adalah pemilik pengaduan
    if (rows[0].nik !== userNik) {
      return response(
        403,
        null,
        "Anda tidak berhak mengubah pengaduan ini",
        res
      );
    }

    // Validasi input
    if (!nik || !judul_pengaduan || !tgl_pengaduan || !isi_laporan) {
      return response(400, null, "Data tidak lengkap", res);
    }

    // Gunakan foto lama atau foto baru
    let foto = rows[0].foto;
    if (req.file) {
      foto = req.file.filename;
    }

    // Update database
    const [result] = await pool.query(
      `UPDATE pengaduan 
        SET nik = ?, judul_pengaduan = ?, tgl_pengaduan = ?, isi_laporan = ?, foto = ?, status = ? 
        WHERE id_pengaduan = ?`,
      [nik, judul_pengaduan, tgl_pengaduan, isi_laporan, foto, status, id]
    );

    if (result.affectedRows === 0) {
      return response(500, null, "Gagal update pengaduan", res);
    }

    return response(
      200,
      {
        id_pengaduan: id,
        nik,
        judul_pengaduan,
        tgl_pengaduan,
        isi_laporan,
        foto,
        status,
      },
      "Pengaduan berhasil diupdate",
      res
    );
  } catch (error) {
    console.error("Error update pengaduan:", error);
    response(500, null, "Gagal mengupdate pengaduan", res);
  }
});

module.exports = router;
