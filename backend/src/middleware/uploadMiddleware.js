const multer = require('multer');
const path = require('path');

// Configurazione per salvare temporaneamente le foto
const storage = multer.memoryStorage(); // Usa memoria invece di disco per Cloudinary

// Filtro per accettare solo immagini
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo immagini sono consentite (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

// Middleware per upload singola foto
const uploadSinglePhoto = upload.single('photo');

// Middleware per upload multipla
const uploadMultiplePhotos = upload.array('photos', 10); // Max 10 foto

module.exports = {
  uploadSinglePhoto,
  uploadMultiplePhotos
};