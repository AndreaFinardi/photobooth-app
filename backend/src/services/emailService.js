const nodemailer = require('nodemailer');
require('dotenv').config();

// Crea transporter per l'invio email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connessione email
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Errore configurazione email:', error);
  } else {
    console.log('✅ Server email pronto per l\'invio');
  }
});

// Invia promemoria per foto
const sendPhotoReminder = async (to, userName, roomName, roomCode) => {
  try {
    const mailOptions = {
      from: `"Photobooth App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `📸 È ora di scattare la tua foto nella stanza ${roomName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .btn { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .code { background: #eee; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; margin: 15px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📸 Photobooth App</h1>
              <p>È tempo di scattare!</p>
            </div>
            <div class="content">
              <h2>Ciao ${userName}!</h2>
              <p>È il momento di scattare la tua foto nella stanza <strong>${roomName}</strong>.</p>
              <p>Tutti i partecipanti stanno scattando la loro foto ora. Non perderti!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="code">${roomCode}</div>
                <p><small>Codice stanza</small></p>
              </div>
              
              <a href="${process.env.APP_URL}/room/${roomCode}/camera" class="btn">
                📷 Vai alla Fotocamera
              </a>
              
              <p>Ricorda: ogni ora una nuova foto viene richiesta per mantenere vivo il momento!</p>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>💡 Suggerimento:</strong> Assicurati di dare il permesso alla fotocamera quando richiesto.</p>
              </div>
            </div>
            <div class="footer">
              <p>Questa email è stata inviata automaticamente da Photobooth App.</p>
              <p>Non rispondere a questa email. Se non vuoi più ricevere promemoria, lascia la stanza dalle impostazioni.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ciao ${userName}!\n\nÈ ora di scattare la tua foto nella stanza ${roomName}.\n\nCodice stanza: ${roomCode}\n\nVai a: ${process.env.APP_URL}/room/${roomCode}/camera\n\nPhotobooth App`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email inviata a ${to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    throw error;
  }
};

// Invia email di benvenuto
const sendWelcomeEmail = async (to, userName) => {
  try {
    const mailOptions = {
      from: `"Photobooth App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Benvenuto in Photobooth App, ${userName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .btn { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📸 Photobooth App</h1>
              <p>Benvenuto nella community!</p>
            </div>
            <div class="content">
              <h2>Ciao ${userName}!</h2>
              <p>Grazie per esserti registrato a Photobooth App.</p>
              <p>Ora puoi:</p>
              <ul>
                <li>Creare stanze e invitare amici</li>
                <li>Scattare foto ogni ora con i partecipanti</li>
                <li>Esplorare la libreria condivisa</li>
                <li>Ricevere promemoria ogni ora per scattare foto</li>
              </ul>
              
              <a href="${process.env.APP_URL}/dashboard" class="btn">
                🚀 Inizia Ora
              </a>
              
              <p>Se hai domande, non esitare a contattarci.</p>
            </div>
            <div class="footer">
              <p>Questa email è stata inviata automaticamente da Photobooth App.</p>
              <p>© ${new Date().getFullYear()} Photobooth App. Tutti i diritti riservati.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ciao ${userName}!\n\nGrazie per esserti registrato a Photobooth App.\n\nOra puoi creare stanze, scattare foto ogni ora con i partecipanti e esplorare la libreria condivisa.\n\nVai a: ${process.env.APP_URL}/dashboard\n\nPhotobooth App`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email di benvenuto inviata a ${to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Errore invio email di benvenuto:', error);
    throw error;
  }
};

// Invia email di reset password
const sendPasswordResetEmail = async (to, userName, resetToken) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Photobooth App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `🔐 Reset Password - Photobooth App`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .btn { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Photobooth App</h1>
              <p>Reset Password</p>
            </div>
            <div class="content">
              <h2>Ciao ${userName}!</h2>
              <p>Hai richiesto il reset della password per il tuo account Photobooth App.</p>
              
              <a href="${resetLink}" class="btn">
                🔑 Reimposta Password
              </a>
              
              <div class="warning">
                <p><strong>⚠️ Importante:</strong> Questo link scadrà tra 1 ora.</p>
                <p>Se non hai richiesto il reset della password, puoi ignorare questa email.</p>
              </div>
              
              <p>Link alternativo: ${resetLink}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ciao ${userName}!\n\nHai richiesto il reset della password per il tuo account Photobooth App.\n\nClicca qui per reimpostare: ${resetLink}\n\nQuesto link scadrà tra 1 ora.\n\nSe non hai richiesto il reset, ignora questa email.\n\nPhotobooth App`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email di reset password inviata a ${to}`);
    return info;
  } catch (error) {
    console.error('❌ Errore invio email reset password:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendPhotoReminder,
  sendWelcomeEmail,
  sendPasswordResetEmail
};