const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const auth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const { nik, judul_pengaduan, tgl_pengaduan, isi_laporan } = req.body;

    if (!nik || !judul_pengaduan || !tgl_pengaduan || !isi_laporan) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap" });
    }

    const foto = req.file ? req.file.filename : null;

    if (!foto) {
      return res.status(400).json({ success: false, message: "Foto wajib diupload" });
    }

    // Validasi NIK user dari token
    const userNik = req.user.nik;
    if (nik !== userNik) {
      return res.status(403).json({ success: false, message: "NIK tidak sesuai dengan user yang login" });
    }

    const sql = `
      INSERT INTO pengaduan (nik, judul_pengaduan, tgl_pengaduan, isi_laporan, foto, status)
      VALUES (?, ?, ?, ?, ?, 'Menunggu')
    `;

    const [result] = await pool.query(sql, [
      nik,
      judul_pengaduan,
      tgl_pengaduan,
      isi_laporan,
      foto
    ]);

    res.status(201).json({ 
      success: true, 
      message: "Pengaduan berhasil disimpan",
      id_pengaduan: result.insertId
    });
  } catch (err) {
    console.error("Error insert pengaduan:", err);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

module.exports = router;
