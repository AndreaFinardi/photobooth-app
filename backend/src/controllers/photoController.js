const Photo = require('../models/Photo');
const { uploadToCloudinary } = require('../config/cloudinary');
const Room = require('../models/Room');

exports.uploadPhoto = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { is_public = true, metadata } = req.body;

    // Verifica se l'utente è membro della stanza
    const room = await Room.findById(roomId);
    const participants = await Room.getActiveParticipants(roomId);
    const isMember = participants.some(p => p.id === userId);

    if (!isMember && room.created_by !== userId) {
      return res.status(403).json({ error: 'Non sei membro di questa stanza' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nessuna foto fornita' });
    }

    let photoUrl, thumbnailUrl;

    // Usa Cloudinary se configurato, altrimenti salva base64
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, {
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      photoUrl = result.secure_url;

      // Crea thumbnail
      const thumbnailResult = await uploadToCloudinary(req.file.buffer, {
        transformation: [
          { width: 300, height: 200, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      thumbnailUrl = thumbnailResult.secure_url;
    } else {
      // Fallback a base64 (solo per sviluppo)
      const base64Image = req.file.buffer.toString('base64');
      photoUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      thumbnailUrl = photoUrl;
    }

    // Salva foto nel database
    const photo = await Photo.create({
      user_id: userId,
      room_id: roomId,
      photo_url: photoUrl,
      thumbnail_url: thumbnailUrl,
      metadata: metadata ? JSON.parse(metadata) : {},
      device_info: req.headers['user-agent'],
      is_public: is_public
    });

    // Aggiungi automaticamente alla libreria personale
    await Photo.addToLibrary(photo.id, userId);

    res.status(201).json({
      message: 'Foto caricata con successo!',
      photo
    });
  } catch (error) {
    console.error('Errore upload foto:', error);
    res.status(500).json({ error: 'Errore durante il caricamento della foto' });
  }
};

exports.getRoomPhotos = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Verifica se l'utente è membro della stanza
    const room = await Room.findById(roomId);
    const participants = await Room.getActiveParticipants(roomId);
    const isMember = participants.some(p => p.id === userId);

    if (!isMember && room.created_by !== userId) {
      return res.status(403).json({ error: 'Non sei membro di questa stanza' });
    }

    const photos = await Photo.findByRoom(roomId, parseInt(limit));

    res.json({
      photos,
      count: photos.length,
      room_name: room.room_name
    });
  } catch (error) {
    console.error('Errore recupero foto stanza:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle foto' });
  }
};

exports.getUserPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const photos = await Photo.findByUser(userId, parseInt(limit));

    res.json({
      photos,
      count: photos.length
    });
  } catch (error) {
    console.error('Errore recupero foto utente:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle foto' });
  }
};

exports.getPhotoDetails = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Foto non trovata' });
    }

    // Controlla se la foto è pubblica o se l'utente è il proprietario
    if (!photo.is_public && photo.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Accesso non autorizzato a questa foto' });
    }

    res.json({
      photo,
      in_library: await Photo.isInLibrary(photoId, req.user.id)
    });
  } catch (error) {
    console.error('Errore dettagli foto:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei dettagli della foto' });
  }
};

exports.addToLibrary = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user.id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Foto non trovata' });
    }

    if (!photo.is_public) {
      return res.status(403).json({ error: 'Non puoi aggiungere una foto privata alla libreria' });
    }

    const libraryItem = await Photo.addToLibrary(photoId, userId);

    res.json({
      message: 'Foto aggiunta alla libreria',
      library_item: libraryItem
    });
  } catch (error) {
    console.error('Errore aggiunta alla libreria:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiunta alla libreria' });
  }
};

exports.removeFromLibrary = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user.id;

    const result = await Photo.removeFromLibrary(photoId, userId);

    if (!result) {
      return res.status(404).json({ error: 'Foto non trovata nella libreria' });
    }

    res.json({
      message: 'Foto rimossa dalla libreria',
      removed_item: result
    });
  } catch (error) {
    console.error('Errore rimozione dalla libreria:', error);
    res.status(500).json({ error: 'Errore durante la rimozione dalla libreria' });
  }
};

exports.getUserLibrary = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Puoi vedere solo la tua libreria o quella pubblica di altri
    if (parseInt(userId) !== currentUserId) {
      const libraryPhotos = await Photo.getUserLibrary(userId);
      const publicPhotos = libraryPhotos.filter(photo => photo.is_public);
      
      return res.json({
        photos: publicPhotos,
        count: publicPhotos.length,
        is_own_library: false
      });
    }

    const libraryPhotos = await Photo.getUserLibrary(userId);

    res.json({
      photos: libraryPhotos,
      count: libraryPhotos.length,
      is_own_library: true
    });
  } catch (error) {
    console.error('Errore recupero libreria:', error);
    res.status(500).json({ error: 'Errore durante il recupero della libreria' });
  }
};

exports.updatePhotoVisibility = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { is_public } = req.body;
    const userId = req.user.id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Foto non trovata' });
    }

    if (photo.user_id !== userId) {
      return res.status(403).json({ error: 'Puoi modificare solo le tue foto' });
    }

    const updatedPhoto = await Photo.updateVisibility(photoId, is_public);

    res.json({
      message: 'Visibilità foto aggiornata',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Errore aggiornamento visibilità:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della visibilità' });
  }
};