const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const pool = require("../config/db");
const response = require("../response");
const auth = require("../middleware/auth");
const transporter = require("../config/mailer"); // harus export transporter

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

// ----------------- Helper: kirim email (HTML sederhana, biru) -----------------
async function sendEmailToUser(userEmail, subject, htmlContent) {
  if (!userEmail) {
    console.warn("sendEmailToUser: userEmail kosong, skip send");
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: htmlContent,
    });
    console.log("Email dikirim ke:", userEmail, "subject:", subject);
  } catch (err) {
    console.error("Gagal mengirim email ke", userEmail, err);
    // jangan lempar error ke caller supaya operasi utama tetap berhasil
  }
}

// Helper untuk ambil email & nama user berdasarkan nik
async function getUserByNik(nik) {
  const [rows] = await pool.query(
    "SELECT nik, nama, email FROM masyarakat WHERE nik = ?",
    [nik]
  );
  return rows[0] || null;
}

// ----------------- Routes -----------------

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

// CREATE pengaduan baru (user)
router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const { nik, judul_pengaduan, tgl_pengaduan, isi_laporan, lokasi } =
      req.body;

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
      return response(
        403,
        null,
        "NIK tidak sesuai dengan user yang login",
        res
      );
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

// UPDATE status pengaduan (admin only) + kirim email notifikasi status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tanggapan_opsional } = req.body; // tetap

    // Cek role admin
    if (req.user && req.user.role && req.user.role.toLowerCase() !== "admin") {
      return response(403, null, "Hanya admin yang dapat mengubah status", res);
    }

    // Validasi status
    const validStatus = ["Menunggu", "Diproses", "Selesai", "Tidak Valid"];
    if (!validStatus.includes(status)) {
      return response(400, null, "Status tidak valid", res);
    }

    // Cek lock
    try {
      const [checkRows] = await pool.query(
        "SELECT is_locked FROM pengaduan WHERE id_pengaduan = ?",
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
      if (errCheck && String(errCheck).includes("Unknown column")) {
      } else {
        console.error("Error checking is_locked:", errCheck);
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

    // Ambil data pengaduan
    const [pengRows] = await pool.query(
      "SELECT nik, judul_pengaduan FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );
    const peng = pengRows[0];

    // Ambil user email
    const user = await getUserByNik(peng.nik);
    const userEmail = user ? user.email : null;
    const userName = user ? user.nama : peng.nama || "";

    // TEMPLATE EMAIL GABUNGAN
    const subject = `Status Laporan Anda: ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color:#222;">
        <h2 style="color:#1e3a8a">Notifikasi Status Laporan</h2>
        <p>Hai <strong>${userName}</strong>,</p>
        <p>Status laporan Anda (<strong>${peng.judul_pengaduan}</strong>, ID: ${id})
        telah diubah menjadi: <strong>${status}</strong>.</p>

        ${
          tanggapan_opsional
            ? `
        <p><strong>Catatan dari Admin:</strong></p>
        <blockquote style="background:#f1f5f9;border-left:4px solid #1e3a8a;padding:10px;margin:10px 0;">
          ${tanggapan_opsional}
        </blockquote>
        `
            : ""
        }

        <p>Terima kasih telah menggunakan layanan pengaduan.</p>
      </div>
    `;

    // KIRIM EMAIL DI SINI SAJA
    await sendEmailToUser(userEmail, subject, html);

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


router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isi_tanggapan } = req.body;

    // cek role admin
    if (req.user && req.user.role && req.user.role.toLowerCase() !== "admin") {
      return response(403, null, "Hanya admin yang dapat membalas pengaduan", res);
    }

    if (!isi_tanggapan || String(isi_tanggapan).trim() === "") {
      return response(400, null, "Isi tanggapan wajib diisi", res);
    }

    // Pastikan pengaduan ada
    const [pengRows] = await pool.query(
      "SELECT nik, judul_pengaduan FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );
    if (pengRows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }
    const peng = pengRows[0];

    // Simpan tanggapan
    const idAdmin = req.user.id || req.user.id_admin || null;
    const tgl = new Date();

    const insertSql =
      "INSERT INTO tanggapan (id_pengaduan, tgl_tanggapan, tanggapan, id_admin) VALUES (?, ?, ?, ?)";
    await pool.query(insertSql, [
      id,
      tgl.toISOString().split("T")[0],
      isi_tanggapan,
      idAdmin,
    ]);

    // EMAIL DIHAPUS — karena notifikasi sudah dilakukan lewat PUT /status

    return response(
      200,
      { id_pengaduan: id },
      "Tanggapan berhasil disimpan",
      res
    );
  } catch (err) {
    console.error("Error reply pengaduan:", err);
    return response(500, null, "Gagal mengirim tanggapan", res);
  }
});


// DELETE pengaduan yang berstatus 'Tidak Valid' (admin/petugas only) + kirim email notifikasi reject
router.delete("/:id/delete-invalid", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Pastikan pengaduan ada dan dapat dihapus
    const [rows] = await pool.query(
      "SELECT status, foto, nik, judul_pengaduan FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );

    if (rows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }

    const {
      status: currentStatus,
      foto: fotoFilename,
      nik,
      judul_pengaduan,
    } = rows[0];

    if (currentStatus.trim() !== "Tidak Valid") {
      return response(
        400,
        null,
        "Hanya pengaduan dengan status 'Tidak Valid' yang dapat dihapus",
        res
      );
    }

    // Hapus dari DB
    const [result] = await pool.query(
      "DELETE FROM pengaduan WHERE id_pengaduan = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      // Hapus file foto jika ada
      if (fotoFilename) {
        const filePath = path.join(__dirname, "../uploads/", fotoFilename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error menghapus file foto:", err);
          }
        });
      }

      // Ambil email user berdasarkan nik
      const user = await getUserByNik(nik);
      const userEmail = user ? user.email : null;
      const userName = user ? user.nama : "";

      // Kirim email notifikasi laporan tidak valid (jika tersedia email)
      const subject = `Laporan Anda Ditolak: ${judul_pengaduan}`;
      const html = `
        <div style="font-family: Arial, sans-serif; color:#222;">
          <h2 style="color:#1e3a8a">Laporan Tidak Valid</h2>
          <p>Hai <strong>${userName}</strong>,</p>
          <p>Laporan Anda dengan judul <strong>${judul_pengaduan}</strong> (ID: ${id}) telah dinyatakan <strong>tidak valid</strong> dan telah dihapus oleh admin.</p>
          <p>Jika Anda merasa ini keliru, silakan ajukan kembali laporan dengan informasi yang lebih lengkap.</p>
        </div>
      `;
      await sendEmailToUser(userEmail, subject, html);

      return response(
        200,
        { id_pengaduan: id },
        "Pengaduan tidak valid berhasil dihapus dan user diberi notifikasi",
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
router.post("/:id/confirm-complete", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const nik = req.user.nik;

    // Get current pengaduan (try including is_locked if present)
    let rows;
    let needMigration = false;
    try {
      const result = await pool.query(
        "SELECT nik, status, is_locked FROM pengaduan WHERE id_pengaduan = ?",
        [id]
      );
      rows = result[0];
    } catch (errSelect) {
      // If column is_locked doesn't exist, fall back and signal migration required
      if (errSelect && String(errSelect).includes("Unknown column")) {
        needMigration = true;
        const result = await pool.query(
          "SELECT nik, status FROM pengaduan WHERE id_pengaduan = ?",
          [id]
        );
        rows = result[0];
      } else {
        throw errSelect;
      }
    }
    if (rows.length === 0) {
      return response(404, null, "Pengaduan tidak ditemukan", res);
    }

    const pengaduan = rows[0];

    // Only owner can confirm
    if (String(pengaduan.nik) !== String(nik)) {
      return response(403, null, "Anda tidak berhak melakukan aksi ini", res);
    }

    // Must be in 'Selesai' status
    if (pengaduan.status !== "Selesai") {
      return response(
        400,
        null,
        "Hanya pengaduan dengan status 'Selesai' dapat ditandai selesai oleh pengguna",
        res
      );
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
      return response(
        400,
        null,
        "Pengaduan sudah ditandai selesai sebelumnya",
        res
      );
    }

    // Update to lock and set tanggal_tandai_selesai
    const [updateResult] = await pool.query(
      "UPDATE pengaduan SET is_locked = 1, tanggal_tandai_selesai = NOW() WHERE id_pengaduan = ?",
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return response(500, null, "Gagal menandai selesai pengaduan", res);
    }

    return response(
      200,
      { id_pengaduan: id },
      "Pengaduan berhasil ditandai selesai oleh pengguna",
      res
    );
  } catch (err) {
    console.error("Error confirm-complete:", err);
    return response(
      500,
      null,
      "Gagal menandai selesai pengaduan. (Kesalahan server)",
      res
    );
  }
});

module.exports = router;
 
