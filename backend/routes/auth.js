const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');
const response = require('../response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const genToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

/**
 * Register masyarakat
 * body: { nik, nama, tglLahir, password, email, telp, alamat }
 */
router.post('/register', async (req, res) => {
  try {
    const { nik, nama, tglLahir, password, email, telp, alamat } = req.body;
    if (!nik || !nama || !tglLahir || !password || !email || !telp || !alamat) {
      return response(400, null, 'Semua field wajib diisi', res);
    }

    // Cek tglLahir / nik sudah ada
    const [exists] = await pool.query('SELECT nik, email FROM masyarakat WHERE nik = ? OR email = ?', [nik, email]);
    if (exists.length) return response(409, null, 'NIK atau email sudah terdaftar', res);

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO masyarakat (nik, nama, tglLahir, password, email, telp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nik, nama, tglLahir, hash, email, telp, alamat]
    );

    return response(201, null, 'Registrasi berhasil', res);
  } catch (err) {
    console.error(err);
    return response(500, null, 'Terjadi kesalahan server', res);
  }
});

/**
 * Login (bisa admin atau masyarakat)
 * Response: { token, role, user } inside payload
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return response(400, null, 'email dan password diperlukan', res);

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
        return response(200, { 
          token, 
          role: 'Admin', 
          user: { id_admin: admin.id_admin, email: admin.email, nama_admin: admin.nama_admin } 
        }, 'Login berhasil', res);
      }
    }

    // cek di tabel masyarakat
    const [userRows] = await pool.query('SELECT * FROM masyarakat WHERE email = ?', [email]);
    if (userRows.length) {
      const user = userRows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return response(401, null, 'Kredensial salah', res);

      const token = genToken({ role: 'Masyarakat', nik: user.nik, email: user.email });
      return response(200, { 
        token, 
        role: 'Masyarakat', 
        user: { nik: user.nik, email: user.email, nama: user.nama } 
      }, 'Login berhasil', res);
    }

    return response(401, null, 'User tidak ditemukan atau kredensial salah', res);
  } catch (err) {
    console.error(err);
    return response(500, null, 'Terjadi kesalahan server', res);
  }
});

module.exports = router;
