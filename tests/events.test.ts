import { SendLayer } from '../src';
import { TEST_API_KEY, mockEventsResponse, mockAxiosInstance } from './setup';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SendLayerValidationError } from '../src/exceptions';

describe('Events Client', () => {
  let client: SendLayer;
  let events: any;

  beforeEach(() => {
    client = new SendLayer(TEST_API_KEY);
    events = client.Events;
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get all events successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEventsResponse });

      const response = await events.get();

      expect(response).toEqual(mockEventsResponse);
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

      const allEvents = await events.get({
        startDate,
        endDate,
        eventType: 'delivered',
        messageId: 'test-message-id'
      });

      expect(allEvents).toEqual(mockEventsResponse);
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

      await expect(events.get()).rejects.toThrow('Invalid API key');
    });

    it('should throw error for invalid date range', async () => {
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');

      await expect(events.get({
        startDate,
        endDate
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for future dates', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      await expect(events.get({
        startDate,
        endDate
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid event type', async () => {
      await expect(events.get({
        eventType: 'invalid-event'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid retrieve count', async () => {
      await expect(events.get({
        retrieveCount: 0
      })).rejects.toThrow(SendLayerValidationError);

      await expect(events.get({
        retrieveCount: 101
      })).rejects.toThrow(SendLayerValidationError);

      await expect(events.get({
        retrieveCount: -1
      })).rejects.toThrow(SendLayerValidationError);
    });
  });

  describe('get', () => {
    it('should get filtered events successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEventsResponse });

      const params = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        eventType: 'delivered'
      };

      const response = await events.get(params);

      expect(response).toEqual(mockEventsResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'events',
        params: {
          StartDate: Math.floor(params.startDate.getTime() / 1000),
          EndDate: Math.floor(params.endDate.getTime() / 1000),
          Event: params.eventType
        }
      });
    });
  });
}); 