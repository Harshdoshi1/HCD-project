import axios from 'axios';
import { buildUrl } from '../utils/apiConfig';

/**
 * Email Service for sending emails from the application
 * Currently configured to send emails from krishmamtora26@gmail.com
 */
class EmailService {
  constructor() {
    this.senderEmail = 'krishmamtora26@gmail.com';
  }

  /**
   * Send an email with PDF attachment
   * @param {Object} emailData - Email data object
   * @param {string} emailData.email - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.description - Email body content
   * @param {Blob} pdfBlob - PDF file as blob to attach
   * @returns {Promise} - Promise that resolves with the email send response
   */
  // frontend/src/services/emailService.js
  async sendEmailWithPdf(emailData, pdfBlob) {
    try {
      console.log('Preparing to send email with PDF attachment');
      console.log('Email recipient:', emailData.email);
      console.log('Email subject:', emailData.subject);

      // Create a FormData object to send the PDF file
      const formData = new FormData();
      formData.append('to', emailData.email);
      formData.append('from', this.senderEmail);
      formData.append('subject', emailData.subject);
      formData.append('text', emailData.description);

      // Append the PDF file
      if (pdfBlob) {
        console.log('PDF blob size:', pdfBlob.size, 'bytes');
        const pdfFile = new File([pdfBlob], 'student-report.pdf', { type: 'application/pdf' });
        formData.append('attachment', pdfFile);
        console.log('PDF file attached to form data');
      } else {
        console.warn('No PDF blob provided for attachment');
      }

      // Log form data entries for debugging
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'attachment' ? 'File data' : pair[1]));
      }

      console.log('Sending request to:', buildUrl('/email/send'));

      // Make the actual API call
      const response = await axios.post(buildUrl('/email/send'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);

      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }

      throw new Error('Failed to send email. Please try again later.');
    }
  }

  /**
   * Send a simple email without attachments
   * @param {Object} emailData - Email data object
   * @param {string} emailData.email - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.description - Email body content
   * @returns {Promise} - Promise that resolves with the email send response
   */
  async sendSimpleEmail(emailData) {
    try {
      // For now, we'll simulate the API call and return a success response
      console.log('Sending simple email to:', emailData.email);
      console.log('From:', this.senderEmail);
      console.log('Subject:', emailData.subject);
      console.log('Content:', emailData.description);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return success response
      return {
        success: true,
        message: 'Email sent successfully!'
      };

      // In a real implementation, you would make an API call like this:
      // const response = await axios.post(`${this.baseUrl}/email/send-simple`, {
      //   to: emailData.email,
      //   from: this.senderEmail,
      //   subject: emailData.subject,
      //   text: emailData.description
      // });
      // return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Please try again later.');
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
