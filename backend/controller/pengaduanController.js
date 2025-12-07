const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// Notifikasi laporan invalid
exports.rejectPengaduan = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    "SELECT email FROM pengaduan WHERE id_pengaduan = ?",
    [id]
  );
  if (rows.length === 0)
    return res.status(404).json({ message: "Data tidak ditemukan" });

  await db.query("DELETE FROM pengaduan WHERE id_pengaduan = ?", [id]);

  await sendEmail(
    rows[0].email,
    "Laporan Tidak Valid",
    "Laporan Anda tidak valid dan telah dihapus oleh admin."
  );

  res.json({ message: "Laporan dihapus & email notifikasi dikirim" });
};

// Notifikasi ketika admin membalas
exports.replyPengaduan = async (req, res) => {
  const { id } = req.params;
  const { balasan } = req.body;

  const [rows] = await db.query(
    "SELECT email FROM pengaduan WHERE id_pengaduan = ?",
    [id]
  );

  await sendEmail(
    rows[0].email,
    "Balasan Admin",
    `Balasan untuk laporan Anda:\n\n${balasan}`
  );

  res.json({ message: "Balasan dikirim ke user via email" });
};

// Notifikasi perubahan status laporan
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const [rows] = await db.query(
    "SELECT email FROM pengaduan WHERE id_pengaduan = ?",
    [id]
  );

  await db.query("UPDATE pengaduan SET status = ? WHERE id_pengaduan = ?", [
    status,
    id,
  ]);

  await sendEmail(
    rows[0].email,
    "Status Laporan Berubah",
    `Status laporan Anda sekarang: ${status}`
  );

  res.json({ message: "Status diperbarui & email notifikasi dikirim" });
};
