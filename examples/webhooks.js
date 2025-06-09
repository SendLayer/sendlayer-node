import { SendLayer } from 'sendlayer';
import { config } from 'dotenv';

config();

const sendlayer = new SendLayer(process.env.SENDLAYER_API_KEY);


async function manageWebhooks() {
  try {
    // Create a webhook
    const webhook = await sendlayer.Webhooks.create({
      url: 'https://your-domain.com/webhook',
      event: 'open'
    });
    console.log('Webhook created:', webhook);

    // Get all webhooks
    const allWebhooks = await sendlayer.Webhooks.get();
    console.log('All Webhooks:', allWebhooks);

    // Delete a webhook
    const webhookId = 123;
    
    await sendlayer.Webhooks.delete(webhookId);
    console.log('Webhook deleted successfully');

  } catch (error) {
    console.error('Error managing webhooks:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

manageWebhooks(); 