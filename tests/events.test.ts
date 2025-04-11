import { Events } from '../src/events/events';
import { TEST_API_KEY, mockEventsResponse, mockAxiosInstance } from './setup';
import { SendLayerValidationError } from '../src/exceptions';

describe('Events Client', () => {
  let client: Events;

  beforeEach(() => {
    client = new Events(TEST_API_KEY);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should retrieve events successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEventsResponse });

      const events = await client.getAll();

      expect(events).toEqual(mockEventsResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'events',
        params: {}
      });
    });

    it('should retrieve filtered events successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEventsResponse });

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      const events = await client.getAll({
        startDate,
        endDate,
        eventType: 'delivered',
        messageId: 'test-message-id'
      });

      expect(events).toEqual(mockEventsResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'events',
        params: {
          StartDate: Math.floor(startDate.getTime() / 1000),
          EndDate: Math.floor(endDate.getTime() / 1000),
          Event: 'delivered',
          MessageId: 'test-message-id'
        }
      });
    });

    it('should handle authentication errors', async () => {
      mockAxiosInstance.request.mockRejectedValue({
        response: {
          status: 401,
          data: { Error: 'Invalid API key' }
        }
      });

      await expect(client.getAll()).rejects.toThrow('Invalid API key');
    });

    it('should throw error for invalid date range', async () => {
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');

      await expect(client.getAll({
        startDate,
        endDate
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for future dates', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      await expect(client.getAll({
        startDate,
        endDate
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid event type', async () => {
      await expect(client.getAll({
        eventType: 'invalid-event'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid retrieve count', async () => {
      await expect(client.getAll({
        retrieveCount: 0
      })).rejects.toThrow(SendLayerValidationError);

      await expect(client.getAll({
        retrieveCount: 101
      })).rejects.toThrow(SendLayerValidationError);

      await expect(client.getAll({
        retrieveCount: -1
      })).rejects.toThrow(SendLayerValidationError);
    });
  });
}); 