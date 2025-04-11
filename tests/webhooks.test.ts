import { Webhooks } from '../src/webhooks/webhooks';
import { TEST_API_KEY, mockWebhookResponse, mockAxiosInstance } from './setup';
import { SendLayerValidationError } from '../src/exceptions';

describe('Webhooks Client', () => {
  let client: Webhooks;

  beforeEach(() => {
    client = new Webhooks(TEST_API_KEY);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a webhook successfully', async () => {
      const mockResponse = { NewWebhookID: 123 };
      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const webhookData = {
        url: 'https://example.com/webhook',
        event: 'delivery'
      };

      const response = await client.create(webhookData);

      expect(response).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'webhooks',
        data: {
          WebhookURL: 'https://example.com/webhook',
          Event: 'delivery'
        }
      });
    });

    it('should throw error for invalid URL', async () => {
      await expect(client.create({
        url: 'invalid-url',
        event: 'sent'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid event type', async () => {
      await expect(client.create({
        url: 'https://example.com/webhook',
        event: 'invalid-event'
      })).rejects.toThrow(SendLayerValidationError);
    });
  });

  describe('getAll', () => {
    it('should retrieve all webhooks successfully', async () => {
      const mockResponse = { Webhooks: [{ WebhookID: "1", WebhookURL: 'https://example.com/webhook', Event: 'delivery', Status: 'active' }] };
      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const webhooks = await client.getAll();

      expect(webhooks).toEqual(mockResponse.Webhooks);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'webhooks'
      });
    });
  });

  describe('delete', () => {
    it('should delete a webhook successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: {} });

      await client.delete(123);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'webhooks/123'
      });
    });

    it('should throw error for invalid webhook ID', async () => {
      await expect(client.delete(0)).rejects.toThrow(SendLayerValidationError);
    });
  });
}); 