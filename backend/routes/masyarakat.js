const express = require('express')
const router = express.Router();
const pool = require('../config/db');
const response = require('../response');
const auth = require('../middleware/auth');

router.get('/', async(req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM masyarakat');
    response(200, rows, "data berhasil diambil", res)
  } catch (error) {
    response(500, null, "data gagal diambil", res)
  }
})

// GET pengaduan by NIK (untuk user dashboard)
router.get('/pengaduan', auth, async(req, res) => {
  try {
    const nik = req.user.nik;
    const [rows] = await pool.query(
      'SELECT * FROM pengaduan WHERE nik = ? ORDER BY tgl_pengaduan DESC',
      [nik]
    );
    response(200, rows, "pengaduan berhasil diambil", res)
  } catch (error) {
    console.error("Error:", error);
    response(500, null, "pengaduan gagal diambil", res)
  }
})

module.exports = router