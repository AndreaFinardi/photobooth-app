const Room = require('../models/Room');
const db = require('../config/database');
const notificationScheduler = require('../services/notificationScheduler');

exports.createRoom = async (req, res) => {
  try {
    const { room_name, settings } = req.body;
    const userId = req.user.id;

    if (!room_name) {
      return res.status(400).json({ error: 'Il nome della stanza è richiesto' });
    }

    // Genera codice stanza univoco
    const room_code = await Room.generateUniqueCode();

    // Crea stanza
    const room = await Room.create({
      room_code,
      room_name,
      created_by: userId,
      settings: settings || { interval: 60, photo_retention_days: 30 }
    });

    // Aggiungi creatore come partecipante
    await Room.addParticipant(room.id, userId);

    // Pianifica notifiche per la stanza
    await notificationScheduler.scheduleRoomNotifications(room.id);

    res.status(201).json({
      message: 'Stanza creata con successo!',
      room,
      invite_code: room.room_code
    });
  } catch (error) {
    console.error('Errore creazione stanza:', error);
    res.status(500).json({ error: 'Errore durante la creazione della stanza' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { room_code } = req.body;
    const userId = req.user.id;

    if (!room_code) {
      return res.status(400).json({ error: 'Il codice della stanza è richiesto' });
    }

    // Trova stanza per codice
    const room = await Room.findByCode(room_code);
    if (!room) {
      return res.status(404).json({ error: 'Stanza non trovata o disattivata' });
    }

    // Aggiungi utente come partecipante
    const participant = await Room.addParticipant(room.id, userId);

    res.json({
      message: 'Ti sei unito alla stanza con successo!',
      room,
      participant
    });
  } catch (error) {
    console.error('Errore join stanza:', error);
    res.status(500).json({ error: 'Errore durante l\'ingresso nella stanza' });
  }
};

exports.getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.findByUser(req.user.id);

    res.json({
      rooms,
      count: rooms.length
    });
  } catch (error) {
    console.error('Errore recupero stanze:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle stanze' });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Stanza non trovata' });
    }

    const participants = await Room.getActiveParticipants(roomId);
    const isMember = participants.some(p => p.id === req.user.id);

    if (!isMember && room.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Non sei membro di questa stanza' });
    }

    res.json({
      room,
      participants,
      is_owner: room.created_by === req.user.id
    });
  } catch (error) {
    console.error('Errore dettagli stanza:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei dettagli della stanza' });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Stanza non trovata' });
    }

    // Non puoi lasciare una stanza se ne sei il creatore
    if (room.created_by === userId) {
      return res.status(400).json({ error: 'Il creatore non può lasciare la stanza. Disattivala invece.' });
    }

    const result = await Room.removeParticipant(roomId, userId);

    res.json({
      message: 'Hai lasciato la stanza con successo',
      result
    });
  } catch (error) {
    console.error('Errore lasciare stanza:', error);
    res.status(500).json({ error: 'Errore durante l\'uscita dalla stanza' });
  }
};

exports.deactivateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Stanza non trovata' });
    }

    if (room.created_by !== userId) {
      return res.status(403).json({ error: 'Solo il creatore può disattivare la stanza' });
    }

    const deactivatedRoom = await Room.deactivate(roomId);

    res.json({
      message: 'Stanza disattivata con successo',
      room: deactivatedRoom
    });
  } catch (error) {
    console.error('Errore disattivazione stanza:', error);
    res.status(500).json({ error: 'Errore durante la disattivazione della stanza' });
  }
};

exports.updateRoomSettings = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { settings } = req.body;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Stanza non trovata' });
    }

    if (room.created_by !== userId) {
      return res.status(403).json({ error: 'Solo il creatore può modificare le impostazioni' });
    }

    const updatedRoom = await Room.updateSettings(roomId, settings);

    res.json({
      message: 'Impostazioni aggiornate con successo',
      room: updatedRoom
    });
  } catch (error) {
    console.error('Errore aggiornamento impostazioni:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento delle impostazioni' });
  }
};