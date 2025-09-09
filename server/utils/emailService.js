// Serviciu pentru trimiterea email-urilor
const emailTemplates = require('../templates/emailTemplates');

class EmailService {
  constructor() {
    this.isConfigured = this.checkConfiguration();
  }

  checkConfiguration() {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  }

  async sendEmail(to, templateName, templateData = {}) {
    try {
      if (!this.isConfigured) {
        console.log(`Email service not configured. Would send ${templateName} email to ${to}`);
        return { success: false, message: 'Email service not configured' };
      }

      const template = emailTemplates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const emailContent = template(templateData);
      
      // TODO: Implement actual email sending logic here
      // Pentru moment, doar log
      console.log(`Sending email: ${templateName}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log('HTML content prepared');
      
      return { success: true, message: 'Email would be sent' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, message: error.message };
    }
  }

  // Helper methods pentru template-uri specifice
  async sendNewUserNotification(userEmail, userData) {
    return this.sendEmail(userEmail, 'newUserNotification', userData);
  }

  async sendPasswordReset(userEmail, resetToken) {
    return this.sendEmail(userEmail, 'passwordReset', { userEmail, resetToken });
  }

  async sendNewCourseNotification(soferEmail, cursaData, soferData) {
    return this.sendEmail(soferEmail, 'newCourseNotification', cursaData, soferData);
  }

  async sendInvoiceNotification(partenerEmail, facturaData, partenerData) {
    return this.sendEmail(partenerEmail, 'invoiceNotification', facturaData, partenerData);
  }
}

module.exports = new EmailService();