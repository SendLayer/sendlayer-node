import { SendLayer } from '../src';
import { TEST_API_KEY, mockWebhookResponse, mockAxiosInstance } from './setup';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SendLayerValidationError } from '../src/exceptions';

describe('Webhooks Client', () => {
  let client: SendLayer;
  let webhooks: any;

  beforeEach(() => {
    client = new SendLayer(TEST_API_KEY);
    webhooks = client.Webhooks;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a webhook successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockWebhookResponse });

      const params = {
        url: 'https://example.com/webhook',
        event: 'opened'
      };

      const response = await webhooks.create(params);

      expect(response).toEqual(mockWebhookResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'webhooks',
        data: {
          Event: params.event,
          WebhookURL: params.url
        }
      });
    });

    it('should throw error for invalid URL', async () => {
      await expect(webhooks.create({
        url: 'invalid-url',
        event: 'sent'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid event type', async () => {
      await expect(webhooks.create({
        url: 'https://example.com/webhook',
        event: 'invalid-event'
      })).rejects.toThrow(SendLayerValidationError);
    });
  });

  describe('get', () => {
    it('should get all webhooks successfully', async () => {
      const mockResponse = { Webhooks: [mockWebhookResponse] };
      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const response = await webhooks.get();

      expect(response).toEqual([mockWebhookResponse]);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'webhooks'
      });
    });
  });

  describe('delete', () => {
    it('should delete a webhook successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: { success: true } });

      const webhookId = 123;
      await webhooks.delete(webhookId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `webhooks/${webhookId}`
      });
    });

    it('should throw error for invalid webhook ID', async () => {
      await expect(webhooks.delete(0)).rejects.toThrow(SendLayerValidationError);
    });
  });
}); 