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

## Configuration

Pass an optional config object as the second argument:

```javascript
const sendlayer = new SendLayer('your-api-key', {
  timeout: 30000,               // request timeout in ms (default: 30000)
  attachmentURLTimeout: 30000,  // remote attachment fetch timeout in ms
  axios: {                      // extra options for the underlying axios client
    headers: { 'X-Custom-Header': 'value' }
  }
});
```

Requests time out after 30 seconds by default and reject with `SendLayerError`.
Custom `axios.headers` are merged with the SDK's own, so authentication is
preserved.

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

### HTML Email with Plain-Text Fallback

Supply both `html` and `text` and both parts are sent -- recommended for
deliverability. `ContentType` is reported to the API as `HTML` whenever an HTML
body is present, and as `Text` when only `text` is supplied.

```javascript
const response = await sendlayer.Emails.send({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Welcome!',
  text: 'Welcome to our platform!',
  html: '<h1>Welcome!</h1><p>Welcome to our platform!</p>'
});
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

Every SDK error extends `SendLayerError`, so one `catch` handles them all. Use
`instanceof` when you need to branch:

```javascript
import {
  SendLayer,
  SendLayerError,
  SendLayerRateLimitError,
  SendLayerValidationError
} from 'sendlayer';

try {
  await sendlayer.Emails.send({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'This is a test plain text email message'
  });
} catch (error) {
  if (error instanceof SendLayerRateLimitError) {
    console.error('Rate limited:', error.message);
  } else if (error instanceof SendLayerValidationError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof SendLayerError) {
    console.error(`SendLayer error ${error.statusCode}:`, error.message);
  }
}
```

### Error Types

- `SendLayerError`: base error for everything the SDK throws
- `SendLayerAuthenticationError`: invalid API key (401)
- `SendLayerValidationError`: invalid parameters, for 400 and 422 as well as
  input the SDK rejects locally
- `SendLayerNotFoundError`: resource not found (404)
- `SendLayerRateLimitError`: rate limit exceeded (429)
- `SendLayerInternalServerError`: internal server error (500 only)
- `SendLayerAPIError`: any status not covered above, including other 5xx

### Error Details

Every error carries the same properties, so you can read them without first
narrowing to a subclass:

| Property | Description |
| --- | --- |
| `message` | The API's own message text, or the SDK's message for local errors |
| `statusCode` | HTTP status of the response; `undefined` for local errors |
| `response` | Decoded response body, or `undefined` when unavailable |
| `errors` | Raw SendLayer `Errors` entries, each with a numeric `Code` and `Message` |
| `codes` | The numeric codes from `errors`, for convenient branching |

```javascript
try {
  await sendlayer.Emails.send(params);
} catch (error) {
  console.error(error.message);        // e.g. "Recipient email is suppressed"

  for (const entry of error.errors) {
    console.error(entry.Code, entry.Message);   // e.g. 14 Recipient email is suppressed
  }

  if (error.codes.includes(14)) {
    // recipient suppressed
  }
}
```

`errors` is an empty array when the SDK raises the error locally (input
validation, network failures) and when the API returns a body that isn't the
JSON `Errors` shape, so check `error.errors.length` before relying on it.

`message` holds the API's text verbatim, joining multiple messages with `; `.
Note that `SendLayerAPIError` is the one type whose `message` keeps an
`API Error <status>: ` prefix.

The numeric `Code` values are a fixed set defined by the API -- see the
[SendLayer error codes reference](https://developers.sendlayer.com/api-reference/error-codes)
for the full table (`14` = recipient suppressed, `17` = email quota reached,
`32` = domain not activated, and so on).


## More Details
To learn more about using the SendLayer SDK, be sure to check our [Developer Documentation](https://developers.sendlayer.com/sdks/nodejs).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.


## License

MIT License - see [LICENSE](./LICENSE) file for details 