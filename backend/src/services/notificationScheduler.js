const cron = require('node-cron');
const db = require('../config/database');
const emailService = require('./emailService');
const smsService = require('./smsService');

class NotificationScheduler {
  constructor() {
    // Avvia lo scheduler quando il server parte
    this.start();
  }

  start() {
    // Esegui ogni minuto per controllare notifiche in scadenza
    cron.schedule('* * * * *', async () => {
      await this.processPendingNotifications();
    });

    // Pulisci notifiche vecchie ogni giorno alle 3:00
    cron.schedule('0 3 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    // Pulisci foto vecchie ogni giorno alle 4:00
    cron.schedule('0 4 * * *', async () => {
      await this.cleanupOldPhotos();
    });

    console.log('⏰ Scheduler notifiche avviato');
  }

  async processPendingNotifications() {
    try {
      const now = new Date();
      
      // Recupera notifiche pendenti scadute
      const notifications = await db.query(
        `SELECT n.*, u.email, u.phone, u.full_name, r.room_name, r.room_code
         FROM notifications n
         JOIN users u ON n.user_id = u.id
         LEFT JOIN rooms r ON n.room_id = r.id
         WHERE n.status = 'pending' 
         AND n.scheduled_for <= $1
         ORDER BY n.scheduled_for ASC
         LIMIT 50`, // Processa max 50 alla volta
        [now]
      );

      console.log(`🔔 Trovate ${notifications.rows.length} notifiche da processare`);

      for (const notification of notifications.rows) {
        try {
          let sent = false;

          // Invia notifica in base al tipo
          if (notification.type === 'email' && notification.email) {
            await emailService.sendPhotoReminder(
              notification.email,
              notification.full_name,
              notification.room_name || 'Generale',
              notification.room_code || 'N/A'
            );
            sent = true;
          } 
          else if (notification.type === 'sms' && notification.phone) {
            const result = await smsService.sendPhotoReminderSMS(
              notification.phone,
              notification.full_name,
              notification.room_name || 'Generale',
              notification.room_code || 'N/A'
            );
            sent = result.success;
          }

          // Aggiorna stato notifica
          if (sent) {
            await db.query(
              `UPDATE notifications 
               SET status = 'sent', sent_at = $1 
               WHERE id = $2`,
              [new Date(), notification.id]
            );
            
            console.log(`✅ Notifica ${notification.type} inviata a ${notification.email || notification.phone}`);
          } else {
            await db.query(
              `UPDATE notifications SET status = 'failed' WHERE id = $1`,
              [notification.id]
            );
            
            console.log(`❌ Invio notifica ${notification.id} fallito`);
          }
        } catch (error) {
          console.error(`❌ Errore elaborazione notifica ${notification.id}:`, error);
          
          await db.query(
            `UPDATE notifications SET status = 'failed' WHERE id = $1`,
            [notification.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Errore nel processamento notifiche:', error);
    }
  }

  async scheduleRoomNotifications(roomId) {
    try {
      // Recupera informazioni stanza
      const roomResult = await db.query(
        `SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE`,
        [roomId]
      );

      if (roomResult.rows.length === 0) return;

      const room = roomResult.rows[0];
      const settings = typeof room.settings === 'string' 
        ? JSON.parse(room.settings) 
        : room.settings;
      
      const intervalMinutes = settings?.interval || 60; // Default ogni ora

      // Recupera tutti i partecipanti attivi
      const participants = await db.query(
        `SELECT u.id, u.email, u.phone, u.full_name
         FROM room_participants rp
         JOIN users u ON rp.user_id = u.id
         WHERE rp.room_id = $1 AND rp.is_active = TRUE`,
        [roomId]
      );

      // Pianifica notifiche per le prossime 24 ore
      const now = new Date();
      
      for (let hour = 1; hour <= 24; hour++) {
        const scheduledTime = new Date(now.getTime() + (hour * intervalMinutes * 60000));
        
        for (const participant of participants.rows) {
          // Notifica email
          await db.query(
            `INSERT INTO notifications 
             (user_id, type, message, scheduled_for, room_id, status) 
             VALUES ($1, $2, $3, $4, $5, 'pending')`,
            [
              participant.id,
              'email',
              `📸 È ora di scattare la tua foto nella stanza ${room.room_name}!`,
              scheduledTime,
              roomId
            ]
          );

          // Notifica SMS se disponibile
          if (participant.phone) {
            await db.query(
              `INSERT INTO notifications 
               (user_id, type, message, scheduled_for, room_id, status) 
               VALUES ($1, $2, $3, $4, $5, 'pending')`,
              [
                participant.id,
                'sms',
                `Foto time! Stanza: ${room.room_name}, Codice: ${room.room_code}`,
                scheduledTime,
                roomId
              ]
            );
          }
        }
      }

      console.log(`⏰ Notifiche pianificate per la stanza "${room.room_name}" (${participants.rows.length} partecipanti)`);
    } catch (error) {
      console.error('❌ Errore nella pianificazione notifiche:', error);
    }
  }

  async cancelRoomNotifications(roomId) {
    try {
      const result = await db.query(
        `UPDATE notifications 
         SET status = 'cancelled' 
         WHERE room_id = $1 AND status = 'pending'`,
        [roomId]
      );

      console.log(`🗑️  Cancellate ${result.rowCount} notifiche per la stanza ${roomId}`);
    } catch (error) {
      console.error('❌ Errore cancellazione notifiche:', error);
    }
  }

  async cleanupOldNotifications() {
    try {
      // Cancella notifiche inviate più di 7 giorni fa
      const result = await db.query(
        `DELETE FROM notifications 
         WHERE (status = 'sent' AND sent_at < NOW() - INTERVAL '7 days')
         OR (status = 'failed' AND scheduled_for < NOW() - INTERVAL '3 days')
         OR (status = 'cancelled')`,
        []
      );

      console.log(`🧹 Pulisci notifiche: rimosse ${result.rowCount} notifiche vecchie`);
    } catch (error) {
      console.error('❌ Errore pulizia notifiche:', error);
    }
  }

  async cleanupOldPhotos() {
    try {
      // Per ogni stanza con impostazioni di retention
      const rooms = await db.query(
        `SELECT id, settings->>'photo_retention_days' as retention_days 
         FROM rooms WHERE is_active = TRUE`
      );

      let totalDeleted = 0;

      for (const room of rooms.rows) {
        const retentionDays = parseInt(room.retention_days) || 30;
        
        const result = await db.query(
          `DELETE FROM photos 
           WHERE room_id = $1 
           AND taken_at < NOW() - INTERVAL '${retentionDays} days'`,
          [room.id]
        );

        totalDeleted += result.rowCount;
        
        if (result.rowCount > 0) {
          console.log(`🗑️  Stanza ${room.id}: rimosse ${result.rowCount} foto vecchie (>${retentionDays} giorni)`);
        }
      }

      console.log(`🧹 Pulizia foto completata: ${totalDeleted} foto rimosse`);
    } catch (error) {
      console.error('❌ Errore pulizia foto:', error);
    }
  }
}

module.exports = new NotificationScheduler();