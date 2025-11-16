const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const masyarakatRoutes = require('./routes/masyarakat');
const pengaduanRoutes = require('./routes/pengaduan');

const app = express();
app.use(cors());
app.use(express.json());

// folder upload agar foto bisa dilihat
app.use("/uploads", express.static("uploads"));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/masyarakat', masyarakatRoutes);
app.use('/api/pengaduan', pengaduanRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
