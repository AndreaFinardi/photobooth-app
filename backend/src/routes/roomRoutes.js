const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware, isRoomMember, isRoomOwner } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Tutte le rotte richiedono autenticazione
router.use(authMiddleware);

// Validatori
const createRoomValidator = [
  body('room_name').notEmpty().withMessage('Nome stanza è richiesto'),
  body('settings').optional().isObject()
];

const joinRoomValidator = [
  body('room_code').notEmpty().withMessage('Codice stanza è richiesto')
];

// Crea nuova stanza
router.post('/create', createRoomValidator, roomController.createRoom);

// Unisciti a stanza esistente
router.post('/join', joinRoomValidator, roomController.joinRoom);

// Ottieni tutte le stanze dell'utente
router.get('/my-rooms', roomController.getUserRooms);

// Dettagli stanza specifica
router.get('/:roomId', isRoomMember, roomController.getRoomDetails);

// Lascia stanza
router.delete('/:roomId/leave', isRoomMember, roomController.leaveRoom);

// Disattiva stanza (solo proprietario)
router.delete('/:roomId/deactivate', isRoomOwner, roomController.deactivateRoom);

// Aggiorna impostazioni stanza
router.put('/:roomId/settings', isRoomOwner, 
  body('settings').isObject(),
  roomController.updateRoomSettings
);

// Ottieni partecipanti stanza
router.get('/:roomId/participants', isRoomMember, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const participants = await Room.getActiveParticipants(req.params.roomId);
    res.json({ participants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Espelli partecipante (solo proprietario)
router.delete('/:roomId/participants/:userId', isRoomOwner, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const result = await Room.removeParticipant(req.params.roomId, req.params.userId);
    res.json({ message: 'Partecipante rimosso', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Genera nuovo codice stanza (solo proprietario)
router.post('/:roomId/regenerate-code', isRoomOwner, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const newCode = await Room.generateUniqueCode();
    
    await require('../config/database').query(
      'UPDATE rooms SET room_code = $1 WHERE id = $2',
      [newCode, req.params.roomId]
    );

    res.json({ 
      message: 'Codice rigenerato',
      new_code: newCode 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ottieni foto della stanza (redirect a photo routes)
router.get('/:roomId/photos', isRoomMember, (req, res) => {
  res.redirect(`/api/photos/room/${req.params.roomId}`);
});

module.exports = router;