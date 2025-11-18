const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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

    // Check if complaint is locked by user (if column exists)
    try {
      const [checkRows] = await pool.query(
        'SELECT is_locked FROM pengaduan WHERE id_pengaduan = ?',
        [id]
      );
      if (checkRows.length > 0 && checkRows[0].is_locked === 1) {
        return response(
          400,
          null,
          "Pengaduan sudah dikunci oleh pengguna. Status tidak dapat diubah.",
          res
        );
      }
    } catch (errCheck) {
      // If column doesn't exist or other error, continue without lock enforcement
      if (errCheck && String(errCheck).includes('Unknown column')) {
        // ignore - DB doesn't have is_locked column
      } else {
        console.error('Error checking is_locked:', errCheck);
      }
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

// ==================== DELETE Endpoints ====================

router.delete("/:id/delete-invalid", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT status, foto FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );
    if (rows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }
    const { status: currentStatus, foto: fotoFilename } = rows[0];
    if (currentStatus.trim() !== "Tidak Valid") {
      return response(
        400,
        null,
        "Hanya pengaduan dengan status 'Tidak Valid' yang dapat dihapus",
        res
      );
    }
    const [result] = await pool.query(
      "DELETE FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );
    if (result.affectedRows > 0) {
      if (fotoFilename) {
          const filePath = path.join(__dirname, "../uploads/", fotoFilename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error menghapus file foto:", err);
          }
        });
      }
      return response(
        200,
        { id_pengaduan: id },
        "Pengaduan tidak valid berhasil dihapus",
        res
      );
    } else {
      return response(
        500,
        null,
        "Gagal menghapus pengaduan dari database (affected rows = 0)",
        res
      );
    }
  } catch (err) {
    console.error("Error delete invalid pengaduan:", err);
    return response(
      500,
      null,
      "Gagal menghapus pengaduan tidak valid. (Kesalahan server)",
      res
    );
  }
});

// USER endpoint: Tandai selesai / lock pengaduan (user confirms admin's 'Selesai')
router.post('/:id/confirm-complete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const nik = req.user.nik;

    // Get current pengaduan (try including is_locked if present)
    let rows;
    let needMigration = false;
    try {
      const result = await pool.query(
        'SELECT nik, status, is_locked FROM pengaduan WHERE id_pengaduan = ?',
        [id]
      );
      rows = result[0];
    } catch (errSelect) {
      // If column is_locked doesn't exist, fall back and signal migration required
      if (errSelect && String(errSelect).includes('Unknown column')) {
        needMigration = true;
        const result = await pool.query(
          'SELECT nik, status FROM pengaduan WHERE id_pengaduan = ?',
          [id]
        );
        rows = result[0];
      } else {
        throw errSelect;
      }
    }
    if (rows.length === 0) {
      return response(404, null, 'Pengaduan tidak ditemukan', res);
    }

    const pengaduan = rows[0];

    // Only owner can confirm
    if (String(pengaduan.nik) !== String(nik)) {
      return response(403, null, 'Anda tidak berhak melakukan aksi ini', res);
    }

    // Must be in 'Selesai' status
    if (pengaduan.status !== 'Selesai') {
      return response(400, null, "Hanya pengaduan dengan status 'Selesai' dapat ditandai selesai oleh pengguna", res);
    }

    // If migration is required (columns missing), return helpful message
    if (needMigration) {
      const migrationSql = `ALTER TABLE pengaduan\n  ADD COLUMN is_locked TINYINT(1) NOT NULL DEFAULT 0,\n  ADD COLUMN tanggal_tandai_selesai DATETIME NULL;`;
      return response(
        400,
        null,
        `Kolom 'is_locked' / 'tanggal_tandai_selesai' belum ada di tabel pengaduan. Silakan jalankan SQL migrasi berikut:\n${migrationSql}`,
        res
      );
    }

    // Check if already locked
    if (pengaduan.is_locked === 1) {
      return response(400, null, 'Pengaduan sudah ditandai selesai sebelumnya', res);
    }

    // Update to lock and set tanggal_tandai_selesai
    const [updateResult] = await pool.query(
      "UPDATE pengaduan SET is_locked = 1, tanggal_tandai_selesai = NOW() WHERE id_pengaduan = ?",
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return response(500, null, 'Gagal menandai selesai pengaduan', res);
    }

    return response(200, { id_pengaduan: id }, 'Pengaduan berhasil ditandai selesai oleh pengguna', res);
  } catch (err) {
    console.error('Error confirm-complete:', err);
    return response(500, null, 'Gagal menandai selesai pengaduan. (Kesalahan server)', res);
  }
});

module.exports = router;
