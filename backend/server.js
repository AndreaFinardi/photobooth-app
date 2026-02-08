const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO per notifiche in tempo reale
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const photoRoutes = require('./src/routes/photoRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/photos', photoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Photobooth API è attiva',
    database: 'PostgreSQL su localhost:5433',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('🔌 Nuovo client connesso:', socket.id);

  // Unisciti a una stanza
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} si è unito alla stanza ${roomId}`);
  });

  // Foto scattata in tempo reale
  socket.on('photo-taken', (data) => {
    io.to(data.roomId).emit('new-photo', {
      userId: data.userId,
      photoUrl: data.photoUrl,
      timestamp: new Date()
    });
  });

  // Notifica ora di scattare
  socket.on('reminder-sent', (roomId) => {
    io.to(roomId).emit('take-photo-reminder', {
      message: '📸 È ora di scattare la tua foto!',
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnesso:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server backend in esecuzione su porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: PostgreSQL su ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});