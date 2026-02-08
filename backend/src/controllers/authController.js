const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/database');
const { validationResult } = require('express-validator');


/* =========================
   REGISTER
========================= */
exports.register = async (req, res) => {
  try {

    // ✅ QUI: controllo errori di validazione (PRIMA di usare req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password e nome sono richiesti' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    const user = await User.create({
      email,
      password,        // ✅ password in chiaro (hash nel model)
      full_name,
      phone
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await db.query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    );

    res.status(201).json({
      message: 'Registrazione completata con successo',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone
      },
      token
    });

  } catch (err) {
    console.error('Errore registrazione:', err);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
};


/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password richieste' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await db.query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    );

    res.json({
      message: 'Login effettuato con successo',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone
      },
      token
    });

  } catch (err) {
    console.error('Errore login:', err);
    res.status(500).json({ error: 'Errore durante il login' });
  }
};

/* =========================
   LOGOUT
========================= */
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await db.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [token]
      );
    }

    res.json({ message: 'Logout effettuato con successo' });
  } catch (err) {
    console.error('Errore logout:', err);
    res.status(500).json({ error: 'Errore durante il logout' });
  }
};

/* =========================
   PROFILE
========================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Errore profilo:', err);
    res.status(500).json({ error: 'Errore recupero profilo' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;

    const user = await User.updateProfile(req.user.id, {
      full_name,
      phone
    });

    res.json({
      message: 'Profilo aggiornato',
      user
    });
  } catch (err) {
    console.error('Errore update profilo:', err);
    res.status(500).json({ error: 'Errore aggiornamento profilo' });
  }
};

/* =========================
   EXTRA (STUB NECESSARI)
========================= */
exports.refreshToken = async (req, res) => {
  res.status(501).json({ error: 'Refresh token non implementato' });
};

exports.forgotPassword = async (req, res) => {
  res.json({
    message: 'Se l’email esiste, riceverai le istruzioni'
  });
};

exports.resetPassword = async (req, res) => {
  res.json({
    message: 'Password aggiornata'
  });
};

exports.getUserStats = async (req, res) => {
  res.json({
    stats: {
      rooms: 0,
      photos: 0
    }
  });
};
