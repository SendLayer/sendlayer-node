import { Webhooks } from 'sendlayer';
import {config} from 'dotenv';

config();

const sendlayer = new Webhooks(process.env.SENDLAYER_API_KEY);

async function manageWebhooks() {
  try {
    // Create a new webhook
    const newWebhook = await sendlayer.create({
      url: 'https://example.com/webhook',
      event: 'delivery'
    });
    console.log('Created webhook:', newWebhook);

    // Get all webhooks
    const allWebhooks = await sendlayer.getAll();
    console.log('All webhooks:', allWebhooks);

    // Delete a webhook
    await sendlayer.delete(1);
    console.log('Deleted webhook with ID: 1');

  } catch (error) {
    console.error('Error managing webhooks:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

manageWebhooks(); 