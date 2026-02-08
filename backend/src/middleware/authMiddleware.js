const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Accesso negato. Token mancante.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const userResult = await db.query(
      'SELECT id, email, full_name, phone FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utente non trovato.' });
    }

    // Check session
    const sessionResult = await db.query(
      'SELECT * FROM user_sessions WHERE user_id = $1 AND session_token = $2 AND expires_at > NOW()',
      [decoded.userId, token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Sessione scaduta. Effettua il login.' });
    }

    // Attach user to request
    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      full_name: userResult.rows[0].full_name,
      phone: userResult.rows[0].phone
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token scaduto.' });
    }
    res.status(500).json({ error: 'Errore di autenticazione.' });
  }
};

// Middleware per verificare se l'utente è il creatore della stanza
const isRoomOwner = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM rooms WHERE id = $1 AND created_by = $2',
      [roomId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Non sei il proprietario di questa stanza.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware per verificare se l'utente è membro della stanza
const isRoomMember = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM room_participants 
       WHERE room_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [roomId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Non sei membro di questa stanza.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authMiddleware, isRoomOwner, isRoomMember };