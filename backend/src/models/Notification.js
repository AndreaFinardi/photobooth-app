const db = require('../config/database');

class Notification {
  // Crea nuova notifica
  static async create(notificationData) {
    const { user_id, type, message, scheduled_for, room_id, status } = notificationData;
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, type, message, scheduled_for, room_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, type, message, scheduled_for || new Date(), room_id, status || 'pending']
    );
    
    return result.rows[0];
  }

  // Trova notifiche pendenti
  static async findPending() {
    const result = await db.query(
      `SELECT n.*, u.email, u.phone, r.room_name
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       LEFT JOIN rooms r ON n.room_id = r.id
       WHERE n.status = 'pending' 
         AND n.scheduled_for <= NOW()
       ORDER BY n.scheduled_for`,
      []
    );
    
    return result.rows;
  }

  // Ottieni notifiche di un utente
  static async findByUser(userId, limit = 50) {
    const result = await db.query(
      `SELECT n.*, r.room_name, r.room_code
       FROM notifications n
       LEFT JOIN rooms r ON n.room_id = r.id
       WHERE n.user_id = $1
       ORDER BY n.scheduled_for DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }

  // Aggiorna stato notifica
  static async updateStatus(id, status, sentAt = null) {
    const result = await db.query(
      `UPDATE notifications 
       SET status = $1, sent_at = COALESCE($2, sent_at) 
       WHERE id = $3 
       RETURNING *`,
      [status, sentAt, id]
    );
    
    return result.rows[0];
  }

  // Pianifica notifiche ricorrenti per una stanza
  static async scheduleRoomNotifications(roomId, intervalHours = 1) {
    const participants = await db.query(
      `SELECT u.id FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 AND rp.is_active = TRUE`,
      [roomId]
    );

    const notifications = [];
    const now = new Date();
    
    // Pianifica per le prossime 24 ore
    for (let i = 1; i <= 24; i++) {
      const scheduledTime = new Date(now.getTime() + (i * intervalHours * 60 * 60 * 1000));
      
      for (const participant of participants.rows) {
        notifications.push({
          user_id: participant.id,
          type: 'email',
          message: `📸 È ora di scattare la tua foto! Controlla la stanza.`,
          scheduled_for: scheduledTime,
          room_id: roomId,
          status: 'pending'
        });
      }
    }

    // Inserisci tutte le notifiche
    for (const notification of notifications) {
      await db.query(
        `INSERT INTO notifications (user_id, type, message, scheduled_for, room_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          notification.user_id,
          notification.type,
          notification.message,
          notification.scheduled_for,
          notification.room_id,
          notification.status
        ]
      );
    }
  }

  // Elimina notifiche vecchie
  static async cleanupOldNotifications(daysToKeep = 7) {
    const result = await db.query(
      `DELETE FROM notifications 
       WHERE scheduled_for < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING COUNT(*) as deleted_count`
    );
    
    return result.rows[0].deleted_count;
  }
}

module.exports = Notification;