const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authMiddleware, isRoomMember } = require('../middleware/authMiddleware');
const { uploadSinglePhoto } = require('../middleware/uploadMiddleware');

// Tutte le rotte richiedono autenticazione
router.use(authMiddleware);

// Upload foto in una stanza
router.post('/room/:roomId/upload', isRoomMember, uploadSinglePhoto, photoController.uploadPhoto);

// Ottieni tutte le foto di una stanza
router.get('/room/:roomId', isRoomMember, photoController.getRoomPhotos);

// Ottieni tutte le foto di un utente
router.get('/user/:userId', photoController.getUserPhotos);

// Dettagli foto specifica
router.get('/:photoId', photoController.getPhotoDetails);

// Aggiungi foto alla libreria personale
router.post('/:photoId/library', photoController.addToLibrary);

// Rimuovi foto dalla libreria personale
router.delete('/:photoId/library', photoController.removeFromLibrary);

// Ottieni libreria personale
router.get('/library/:userId', photoController.getUserLibrary);

// Aggiorna visibilità foto
router.put('/:photoId/visibility', photoController.updatePhotoVisibility);

// Elimina foto (solo proprietario)
router.delete('/:photoId', async (req, res) => {
  try {
    const Photo = require('../models/Photo');
    const photo = await Photo.findById(req.params.photoId);
    
    if (!photo) {
      return res.status(404).json({ error: 'Foto non trovata' });
    }
    
    if (photo.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Puoi eliminare solo le tue foto' });
    }
    
    // Elimina da Cloudinary se configurato
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const { deleteFromCloudinary } = require('../config/cloudinary');
      try {
        // Estrai public_id dall'URL
        const urlParts = photo.photo_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        await deleteFromCloudinary(`photobooth-app/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Errore eliminazione Cloudinary:', cloudinaryError);
      }
    }
    
    // Elimina dal database
    await require('../config/database').query(
      'DELETE FROM photos WHERE id = $1 RETURNING id',
      [req.params.photoId]
    );
    
    res.json({ message: 'Foto eliminata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Libreria condivisa (foto recenti pubbliche)
router.get('/shared/recent', async (req, res) => {
  try {
    const Photo = require('../models/Photo');
    const photos = await Photo.getRecentPhotos(req.user.id, 30);
    
    res.json({
      photos,
      count: photos.length,
      period: 'ultimi 30 giorni'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cerca foto per data o metadati
router.get('/search', async (req, res) => {
  try {
    const { query, room_id, start_date, end_date, limit = 50 } = req.query;
    const userId = req.user.id;
    
    let sql = `
      SELECT p.*, u.full_name as user_name, r.room_name
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN rooms r ON p.room_id = r.id
      WHERE p.is_public = TRUE
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filtro per stanza
    if (room_id) {
      sql += ` AND p.room_id = $${paramCount}`;
      params.push(room_id);
      paramCount++;
    }
    
    // Filtro per data
    if (start_date) {
      sql += ` AND p.taken_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }
    
    if (end_date) {
      sql += ` AND p.taken_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }
    
    // Ricerca nel metadata
    if (query) {
      sql += ` AND (
        u.full_name ILIKE $${paramCount} 
        OR r.room_name ILIKE $${paramCount}
        OR p.metadata::text ILIKE $${paramCount}
      )`;
      params.push(`%${query}%`);
      paramCount++;
    }
    
    sql += ` ORDER BY p.taken_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    
    const result = await require('../config/database').query(sql, params);
    
    res.json({
      photos: result.rows,
      count: result.rows.length,
      query: query || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;