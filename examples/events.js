import { Events } from 'sendlayer';
import {config} from 'dotenv';

config();

const sendlayer = new Events(process.env.SENDLAYER_API_KEY);

async function getEvents() {
  try {
    // Get all events
    const allEvents = await sendlayer.getAll();
    console.log('All events:', allEvents);

    // Get events with filters
    const filteredEvents = await sendlayer.getAll({
      eventType: 'bounce',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
      retrieveCount: 10
    });
    console.log('Filtered events:', filteredEvents);

  } catch (error) {
    console.error('Error getting events:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

getEvents(); 