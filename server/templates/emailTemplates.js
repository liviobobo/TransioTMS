// Email Templates centralizate pentru aplicația Transio
const { APP_CONFIG } = require('../config/constants');

const emailTemplates = {
  // Template pentru notificare utilizator nou
  newUserNotification: (userData) => ({
    subject: `Bun venit la ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bun venit la ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}!</h2>
        <p>Salut ${userData.nume},</p>
        <p>Contul tău a fost creat cu succes.</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Rol:</strong> ${userData.rol}</p>
        <p>Poți să te conectezi acum la <a href="https://${APP_CONFIG?.COMPANY?.DOMAIN || 'localhost'}/login">panoul de administrare</a>.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Acest email a fost generat automat de sistemul ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}.</p>
      </div>
    `
  }),

  // Template pentru resetare parolă
  passwordReset: (userEmail, resetToken) => ({
    subject: `Resetare parolă - ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Resetare parolă</h2>
        <p>Ai cerut să îți resetezi parola pentru contul ${userEmail}.</p>
        <p>Dacă nu ai făcut această cerere, ignoră acest email.</p>
        <p>Pentru a reseta parola, folosește următorul token:</p>
        <p style="background: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace;">${resetToken}</p>
        <p style="color: #ff6b6b;">Acest token expiră în 1 oră.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Acest email a fost generat automat de sistemul ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}.</p>
      </div>
    `
  }),

  // Template pentru notificare cursă nouă
  newCourseNotification: (cursaData, sofer) => ({
    subject: `Cursă nouă asignată - ${cursaData.idCursa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Cursă nouă asignată</h2>
        <p>Salut ${sofer.nume},</p>
        <p>Ai fost asignat pe o cursă nouă:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>ID Cursă:</strong> ${cursaData.idCursa}</p>
          <p><strong>Pornire:</strong> ${cursaData.pornire}</p>
          <p><strong>Destinație:</strong> ${cursaData.destinatie}</p>
          <p><strong>Status:</strong> ${cursaData.status}</p>
          <p><strong>Cost negociat:</strong> ${cursaData.costNegociat} EUR</p>
        </div>
        <p>Te rog să verifici detaliile în aplicație.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Acest email a fost generat automat de sistemul ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}.</p>
      </div>
    `
  }),

  // Template pentru notificare factură
  invoiceNotification: (facturaData, partener) => ({
    subject: `Factură nouă - ${facturaData.numarFactura}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Factură nouă emisă</h2>
        <p>Stimate ${partener.nume},</p>
        <p>A fost emisă o factură nouă:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Număr factură:</strong> ${facturaData.numarFactura}</p>
          <p><strong>Data emisă:</strong> ${facturaData.dataEmisa}</p>
          <p><strong>Suma totală:</strong> ${facturaData.sumaTotal} EUR</p>
          <p><strong>Status:</strong> ${facturaData.status}</p>
        </div>
        <p>Vă rugăm să efectuați plata conform termenilor stabiliți.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Acest email a fost generat automat de sistemul ${APP_CONFIG?.COMPANY?.NAME || 'Transio'}.</p>
      </div>
    `
  })
};

module.exports = emailTemplates;