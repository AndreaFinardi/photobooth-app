console.log('🚀 SERVER.JS AVVIATO SU RENDER');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

/* =========================
   CORS
========================= */
const allowedOrigins = [
  'http://localhost:3000',
  'https://photobooth-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES
========================= */
const authRoutes = require('./src/routes/authRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const photoRoutes = require('./src/routes/photoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/photos', photoRoutes);

/* =========================
   HEALTH CHECK (OBBLIGATORIO)
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'photobooth-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('🔥 ERRORE SERVER:', err.message);
  res.status(500).json({
    error: 'Errore interno del server'
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🟢 Backend attivo su porta ${PORT}`);
  console.log(`🔗 Health check: /api/health`);
});
