<a href="https://sendlayer.com">
<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-light.svg">
  <img alt="SendLayer Logo" width="200px" src="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-light.svg">
</picture>
</a>

### SendLayer Node.js SDK

The official JavaScript SDK for interacting with the SendLayer API, providing a simple and intuitive interface for sending emails, managing webhooks, and retrieving email events. Supports both CommonJS and ES Modules.

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Installation

```bash
npm install sendlayer
```

## Usage

### Sending an Email

```javascript
import { SendLayer } from 'sendlayer';

// Initialize the client
const sendlayer = new SendLayer('your-api-key');


const params = {
  from_email: 'sender@example.com',
  to: 'recipient@example.com', // or array of recipients
  subject: 'Test Email',
  text: 'This is a test email'
}

// Send a simple email
const response = await sendlayer.Emails.send(params);

console.log('Email sent! Message ID:', response.MessageID);
```

Sending Emails with additional parameters

```javascript
import { SendLayer } from 'sendlayer';

// Initialize the client
const sendlayer = new SendLayer('your-sendlayer-api-key');

const params = {
  from_email: 'sender@example.com',
  from_name: 'Sender Name', // optional
  to: [
    { email: 'recipient1@example.com', name: 'Recipient 1' },
    { email: 'recipient2@example.com', name: 'Recipient 2' }
  ], 
  subject: 'Test Email',
  html: '<p>This is a test email</p>', // or text for plain text emails
  text: 'This is a test email', // optional, for plain text version
  cc: [{ email: 'cc@example.com', name: 'CC Recipient' }], // optional
  bcc: [{ email: 'bcc@example.com', name: 'BCC Recipient' }], // optional
  replyTo: [{ email: 'reply@example.com', name: 'Reply To' }], // optional
  tags: ['tag1', 'tag2'], // optional
  headers: { 'X-Custom-Header': 'value' }, // optional
  attachments: [{ // optional
    path: 'path/to/file.pdf',
    type: 'application/pdf',
  }]
}

// Send an email with additional parameters
const response = await sendlayer.Emails.send(params);

console.log('Email Sent successfully! MessageID:', response.MessageID)
```

### Events

```javascript
import { SendLayer } from 'sendlayer';

// Initialize the client
const sendlayer = new SendLayer('your-api-key');


// Get all events
const allEvents = await sendlayer.Events.get();

console.log('All Events:', allEvents);

// Get events with optional filters
const params = {
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // optional, last 24 hours
  endDate: new Date(), // optional
  event: 'opened', // optional, filter by event type
}
const filteredEvents = await sendlayer.Events.get(params);

console.log('Filtered Events', filteredEvents)
```

### Webhooks

```javascript
import { SendLayer } from 'sendlayer';

// Initialize the client
const sendlayer = new SendLayer('your-api-key');

// Create a webhook
// Webhook event options: bounce, click, open, unsubscribe, complaint, delivery
const params = {
  url: 'https://your-domain.com/webhook',
  event: 'open'
}

const webhook = await sendlayer.Webhooks.create(params);
console.log('Webhook created:', webhook);

// Get all webhooks
const allWebhooks = await sendlayer.Webhooks.get();
console.log('Webhooks:', allWebhooks);

// Delete a webhook
await sendlayer.Webhooks.delete(123);
```

## Error Handling

The SDK throws the following error types:

- `SendLayerAuthenticationError`: Invalid API key
- `SendLayerValidationError`: Invalid request parameters
- `SendLayerAPIError`: API request failed
- `SendLayerError`: Unexpected errors

```javascript
try {
  await sendlayer.Emails.send({
    from_email: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email'
  });

} catch (error) {
  if (error.name === 'SendLayerAuthenticationError') {
    console.error('Invalid API key');
  } else if (error.name === 'SendLayerValidationError') {
    console.error('Invalid parameters:', error.message);
  } else if (error.name === 'SendLayerAPIError') {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the SDK
npm run build
```

## License

MIT License - see [LICENSE](./LICENSE) file for details 