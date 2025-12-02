<a href="https://sendlayer.com">
<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-light.svg">
  <img alt="SendLayer Logo" width="200px" src="https://sendlayer.com/wp-content/themes/sendlayer-theme/assets/images/svg/logo-light.svg">
</picture>
</a>

### SendLayer Node.js SDK

The official JavaScript SDK for interacting with the SendLayer API, providing a simple and intuitive interface for sending emails, managing webhooks, and retrieving email events. Supports both CommonJS and ES Modules.

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) ![NPM Version](https://img.shields.io/npm/v/sendlayer) [![Publish to npm Registry](https://github.com/SendLayer/sendlayer-node/actions/workflows/publish.yaml/badge.svg)](https://github.com/SendLayer/sendlayer-node/actions/workflows/publish.yaml)


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
  from: 'sender@example.com',
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
  from: {email: 'sender@example.com', name: 'Test Sender'},
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

- `SendLayerAPIError`: API request failed
- `SendLayerError`: Validation errors

```javascript
try {
  await sendlayer.Emails.send({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'This is a test plain text email message'
  });

} catch (error) {
  if (error.name === 'SendLayerAPIError') {
    console.error('API error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
}
```


## More Details
To learn more about using the SendLayer SDK, be sure to check our [Developer Documentation](https://developers.sendlayer.com/sdks/nodejs).


## License

MIT License - see [LICENSE](./LICENSE) file for details 