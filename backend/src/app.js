const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: process.env.APP_URL || '*',
  credentials: true
}));
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/photos', photoRoutes);

/* =========================
   FALLBACK
========================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
