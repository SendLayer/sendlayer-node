import { NewEmail } from 'sendlayer';
import { config } from 'dotenv';

config();

const sendlayer = new NewEmail(process.env.SENDLAYER_API_KEY);

async function sendEmail() {
  try {
    // Simple email with text content
    const simpleResponse = await sendlayer.send({
      from_email: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Simple Test Email',
      text: 'Hello, this is a simple test email'
    });
    console.log('Simple email sent:', simpleResponse);

    // Complex email with HTML content and all options
    const params = {
      from_email: 'sender@example.com',
      from_name: 'Test Sender',
      to: [
        { email: 'recipient1@example.com', name: 'Recipient 1' },
        { email: 'recipient2@example.com' }
      ],
      subject: 'Complex Test Email',
      html: '<p>Hello, this is a <strong>test email</strong> with HTML content!</p>',
      cc: { email: 'cc@example.com', name: 'CC Recipient' },
      bcc: [
        { email: 'bcc1@example.com' },
        { email: 'bcc2@example.com', name: 'BCC Recipient' }
      ],
      replyTo: { email: 'reply@example.com' },
      tags: ['test', 'email'],
      headers: { 'X-Custom-Header': 'value' },
      attachments: [
        {
          path: 'path/to/file.pdf',
          type: 'application/pdf',
        }
      ]
    }

    const complexResponse = await sendlayer.send(params);
    console.log('Complex email sent:', complexResponse);

  } catch (error) {
    console.error('Error sending email:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

sendEmail(); 