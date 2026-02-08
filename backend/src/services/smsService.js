// Servizio SMS opzionale (usa Twilio o servizio simile)
// Per ora, implementiamo un servizio mock

require('dotenv').config();

class SMSService {
  constructor() {
    this.enabled = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    
    if (this.enabled) {
      // Se Twilio è configurato
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.client = require('twilio')(accountSid, authToken);
      console.log('✅ Servizio SMS configurato (Twilio)');
    } else {
      console.log('⚠️  Servizio SMS non configurato. Usa modalità simulazione.');
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.enabled) {
        // Modalità simulazione per sviluppo
        console.log(`📱 [SMS SIMULATO] A: ${to}`);
        console.log(`📱 Messaggio: ${message}`);
        console.log(`📱 Stato: Inviato con successo (modalità simulazione)`);
        
        return {
          success: true,
          message: 'SMS inviato (modalità simulazione)',
          simulated: true
        };
      }

      // Usa Twilio per inviare SMS reali
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      console.log(`📱 SMS inviato a ${to}: ${result.sid}`);
      
      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('❌ Errore invio SMS:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendPhotoReminderSMS(to, userName, roomName, roomCode) {
    const message = `Ciao ${userName}! 📸 È ora di scattare la tua foto nella stanza "${roomName}". Codice: ${roomCode}. Vai a: ${process.env.APP_URL}`;
    
    return this.sendSMS(to, message);
  }

  async sendWelcomeSMS(to, userName) {
    const message = `Ciao ${userName}! Benvenuto in Photobooth App 🎉 Ora puoi creare stanze e scattare foto ogni ora con gli amici!`;
    
    return this.sendSMS(to, message);
  }

  async sendVerificationCode(to, code) {
    const message = `Il tuo codice di verifica Photobooth App è: ${code}. Valido per 10 minuti.`;
    
    return this.sendSMS(to, message);
  }
}

module.exports = new SMSService();