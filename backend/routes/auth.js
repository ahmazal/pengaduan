const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Helper: generate token
const genToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

/**
 * Register masyarakat
 * body: { nik, nama, tglLahir, password, email, telp, alamat }
 */
router.post('/register', async (req, res) => {
  try {
    const { nik, nama, tglLahir, password, email, telp, alamat } = req.body;
    if (!nik || !nama || !tglLahir || !password || !email || !telp || !alamat) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Cek tglLahir / nik sudah ada
    const [exists] = await pool.query('SELECT nik, email FROM masyarakat WHERE nik = ? OR email = ?', [nik, email]);
    if (exists.length) return res.status(409).json({ message: 'NIK atau email sudah terdaftar' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO masyarakat (nik, nama, tglLahir, password, email, telp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nik, nama, tglLahir, hash, email, telp, alamat]
    );

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * Login (bisa admin atau masyarakat)
 * Response: { token, role, user }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email dan password diperlukan' });

    // cek di tabel admin
    const [adminRows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (adminRows.length) {
      const admin = adminRows[0];
      // handle plain or bcrypt password stored
      let ok = false;
      if (admin.password && admin.password.startsWith('$2')) {
        ok = await bcrypt.compare(password, admin.password);
      } else {
        ok = password === admin.password;
      }
      if (ok) {
        const token = genToken({ role: 'Admin', id: admin.id_admin, email: admin.email });
        return res.json({ token, role: 'Admin', user: { id_admin: admin.id_admin, email: admin.email, nama_admin: admin.nama_admin, email: admin.email } });
      }
    }

    // cek di tabel masyarakat
    const [userRows] = await pool.query('SELECT * FROM masyarakat WHERE email = ?', [email]);
    if (userRows.length) {
      const user = userRows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Kredensial salah' });

      const token = genToken({ role: 'Masyarakat', nik: user.nik, email: user.email });
      return res.json({ token, role: 'Masyarakat', user: { nik: user.nik, email: user.email, nama: user.nama, email: user.email } });
    }

    return res.status(401).json({ message: 'User tidak ditemukan atau kredensial salah' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
