const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Crea nuovo utente
  static async create(userData) {
    const { email, password, full_name, phone } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, phone, created_at`,
      [email, hashedPassword, full_name, phone]
    );
    
    return result.rows[0];
  }

  // Trova utente per email
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Trova utente per ID
  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, full_name, phone, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Verifica password
  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  // Aggiorna profilo
  static async updateProfile(id, updateData) {
    const { full_name, phone } = updateData;
    
    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone) 
       WHERE id = $3 
       RETURNING id, email, full_name, phone`,
      [full_name, phone, id]
    );
    
    return result.rows[0];
  }

  // Ottieni statistiche utente
  static async getUserStats(userId) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM rooms WHERE created_by = $1) as rooms_created,
        (SELECT COUNT(*) FROM room_participants WHERE user_id = $1) as rooms_joined,
        (SELECT COUNT(*) FROM photos WHERE user_id = $1) as photos_taken,
        (SELECT COUNT(*) FROM photo_library WHERE user_id = $1) as photos_in_library`,
      [userId]
    );
    
    return result.rows[0];
  }
}

module.exports = User;