const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const notifications = await db.query(
      `SELECT n.*, r.room_name, r.room_code
       FROM notifications n
       LEFT JOIN rooms r ON n.room_id = r.id
       WHERE n.user_id = $1
       ORDER BY n.scheduled_for DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Conta notifiche non lette
    const unreadCount = await db.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1 AND status IN ('pending', 'sent')`,
      [userId]
    );

    res.json({
      notifications: notifications.rows,
      pagination: {
        total: unreadCount.rows[0].count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Errore recupero notifiche:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle notifiche' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE notifications 
       SET status = 'read' 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notifica non trovata' });
    }

    res.json({
      message: 'Notifica segnata come letta',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Errore aggiornamento notifica:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della notifica' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE notifications 
       SET status = 'read' 
       WHERE user_id = $1 AND status IN ('pending', 'sent')`,
      [userId]
    );

    res.json({
      message: 'Tutte le notifiche segnate come lette',
      updated_count: result.rowCount
    });
  } catch (error) {
    console.error('Errore aggiornamento notifiche:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento delle notifiche' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notifica non trovata' });
    }

    res.json({
      message: 'Notifica eliminata',
      deleted_notification: result.rows[0]
    });
  } catch (error) {
    console.error('Errore eliminazione notifica:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione della notifica' });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'read') as read,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) as total
       FROM notifications 
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      stats: stats.rows[0],
      summary: {
        unread: parseInt(stats.rows[0].pending) + parseInt(stats.rows[0].sent),
        total: parseInt(stats.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Errore statistiche notifiche:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle statistiche' });
  }
};