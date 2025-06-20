import { SendLayer } from 'sendlayer';
import { config } from 'dotenv';

config();

const sendlayer = new SendLayer(process.env.SENDLAYER_API_KEY);


async function getEvents() {
  try {
    // Get all events
    const allEvents = await sendlayer.Events.get();
    console.log('All Events:', allEvents);

    // Get events with filters
    const filteredEvents = await sendlayer.Events.get({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
      endDate: new Date(),
      event: 'opened'
    });
    console.log('Filtered Events:', filteredEvents);

  } catch (error) {
    console.error('Error getting events:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

getEvents(); 