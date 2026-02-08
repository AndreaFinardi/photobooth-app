const db = require('../config/database');

class Room {
  // Crea nuova stanza
  static async create(roomData) {
    const { room_code, room_name, created_by, settings } = roomData;
    
    const result = await db.query(
      `INSERT INTO rooms (room_code, room_name, created_by, settings) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [room_code, room_name, created_by, settings]
    );
    
    return result.rows[0];
  }

  // Trova stanza per codice
  static async findByCode(roomCode) {
    const result = await db.query(
      'SELECT * FROM rooms WHERE room_code = $1 AND is_active = TRUE',
      [roomCode]
    );
    return result.rows[0];
  }

  // Trova stanza per ID
  static async findById(id) {
    const result = await db.query(
      `SELECT r.*, u.email as creator_email, u.full_name as creator_name
       FROM rooms r
       JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Ottieni tutte le stanze di un utente
  static async findByUser(userId) {
    const result = await db.query(
      `SELECT DISTINCT r.*, 
              (SELECT COUNT(*) FROM room_participants rp WHERE rp.room_id = r.id AND rp.is_active = TRUE) as participant_count,
              (SELECT COUNT(*) FROM photos p WHERE p.room_id = r.id) as photo_count
       FROM rooms r
       LEFT JOIN room_participants rp ON r.id = rp.room_id
       WHERE r.created_by = $1 OR rp.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  // Aggiungi partecipante
  static async addParticipant(roomId, userId) {
    const result = await db.query(
      `INSERT INTO room_participants (room_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (room_id, user_id) 
       DO UPDATE SET is_active = TRUE, joined_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [roomId, userId]
    );
    
    return result.rows[0];
  }

  // Rimuovi partecipante
  static async removeParticipant(roomId, userId) {
    const result = await db.query(
      `UPDATE room_participants 
       SET is_active = FALSE 
       WHERE room_id = $1 AND user_id = $2 
       RETURNING *`,
      [roomId, userId]
    );
    
    return result.rows[0];
  }

  // Ottieni partecipanti attivi
  static async getActiveParticipants(roomId) {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.phone, rp.joined_at
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 AND rp.is_active = TRUE
       ORDER BY rp.joined_at`,
      [roomId]
    );
    
    return result.rows;
  }

  // Aggiorna impostazioni stanza
  static async updateSettings(roomId, settings) {
    const result = await db.query(
      `UPDATE rooms 
       SET settings = $1 
       WHERE id = $2 
       RETURNING *`,
      [settings, roomId]
    );
    
    return result.rows[0];
  }

  // Disattiva stanza
  static async deactivate(roomId) {
    const result = await db.query(
      `UPDATE rooms 
       SET is_active = FALSE 
       WHERE id = $1 
       RETURNING *`,
      [roomId]
    );
    
    return result.rows[0];
  }

  // Genera codice stanza univoco
  static async generateUniqueCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await db.query(
        'SELECT id FROM rooms WHERE room_code = $1',
        [code]
      );
      
      if (existing.rows.length === 0) {
        isUnique = true;
      }
    }
    
    return code;
  }
}

module.exports = Room;