const db = require('../config/database');

class Photo {
  // Crea nuova foto
  static async create(photoData) {
    const { user_id, room_id, photo_url, thumbnail_url, metadata, device_info, is_public } = photoData;
    
    const result = await db.query(
      `INSERT INTO photos (user_id, room_id, photo_url, thumbnail_url, metadata, device_info, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [user_id, room_id, photo_url, thumbnail_url, metadata, device_info, is_public || true]
    );
    
    return result.rows[0];
  }

  // Trova foto per ID
  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, u.email as user_email, u.full_name as user_name
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Ottieni tutte le foto di una stanza
  static async findByRoom(roomId, limit = 50) {
    const result = await db.query(
      `SELECT p.*, u.email as user_email, u.full_name as user_name
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.room_id = $1 AND p.is_public = TRUE
       ORDER BY p.taken_at DESC
       LIMIT $2`,
      [roomId, limit]
    );
    
    return result.rows;
  }

  // Ottieni tutte le foto di un utente
  static async findByUser(userId, limit = 100) {
    const result = await db.query(
      `SELECT p.*, r.room_name, r.room_code
       FROM photos p
       LEFT JOIN rooms r ON p.room_id = r.id
       WHERE p.user_id = $1
       ORDER BY p.taken_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }

  // Ottieni foto recenti per la libreria
  static async getRecentPhotos(userId, days = 30) {
    const result = await db.query(
      `SELECT p.*, u.email as user_email, u.full_name as user_name
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_public = TRUE 
         AND p.taken_at >= NOW() - INTERVAL '${days} days'
       ORDER BY p.taken_at DESC`,
      []
    );
    
    return result.rows;
  }

  // Aggiungi foto alla libreria personale
  static async addToLibrary(photoId, userId) {
    const result = await db.query(
      `INSERT INTO photo_library (photo_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (photo_id, user_id) DO NOTHING
       RETURNING *`,
      [photoId, userId]
    );
    
    return result.rows[0];
  }

  // Rimuovi foto dalla libreria
  static async removeFromLibrary(photoId, userId) {
    const result = await db.query(
      `DELETE FROM photo_library 
       WHERE photo_id = $1 AND user_id = $2 
       RETURNING *`,
      [photoId, userId]
    );
    
    return result.rows[0];
  }

  // Ottieni libreria personale
  static async getUserLibrary(userId) {
    const result = await db.query(
      `SELECT p.*, u.email as photographer_email, u.full_name as photographer_name
       FROM photo_library pl
       JOIN photos p ON pl.photo_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE pl.user_id = $1
       ORDER BY pl.added_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  // Controlla se la foto è nella libreria
  static async isInLibrary(photoId, userId) {
    const result = await db.query(
      `SELECT * FROM photo_library 
       WHERE photo_id = $1 AND user_id = $2`,
      [photoId, userId]
    );
    
    return result.rows.length > 0;
  }

  // Pulisci foto vecchie (eseguito da cron job)
  static async cleanupOldPhotos(daysToKeep = 30) {
    const result = await db.query(
      `DELETE FROM photos 
       WHERE taken_at < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING COUNT(*) as deleted_count`
    );
    
    return result.rows[0].deleted_count;
  }

  // Aggiorna visibilità foto
  static async updateVisibility(photoId, isPublic) {
    const result = await db.query(
      `UPDATE photos 
       SET is_public = $1 
       WHERE id = $2 
       RETURNING *`,
      [isPublic, photoId]
    );
    
    return result.rows[0];
  }
}

module.exports = Photo;