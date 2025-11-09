const express = require('express')
const router = express.Router();
const pool = require('../config/db');
const response = require('../response');

router.get('/', async(req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM masyarakat');
    response(200, rows, "data berhasil diambil", res)
  } catch (error) {
    response(500, null, "data gagal diambil", res)
  }
})

module.exports = router