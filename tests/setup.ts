import { config } from 'dotenv';
import axios from 'axios';

// Load environment variables
config();

// Mock API key for testing
export const TEST_API_KEY = process.env.SENDLAYER_API_KEY || 'test-api-key';

// Mock response data
export const mockEmailResponse = {
  MessageID: 'test-message-id'
};

export const mockWebhookResponse = {
  NewWebhookID: 'test-webhook-id'
};

export const mockEventsResponse = {
  TotalRecords: 2,
  Events: [
    {
      EventType: 'sent',
      LoggedTime: Date.now(),
      MessageID: 'test-message-id-1',
      From: 'sender@example.com',
      To: 'recipient@example.com',
      Subject: 'Test Email 1',
      Reason: 'Email sent successfully'
    },
    {
      EventType: 'opened',
      LoggedTime: Date.now(),
      MessageID: 'test-message-id-2',
      From: 'sender@example.com',
      To: 'recipient@example.com',
      Subject: 'Test Email 2',
      Reason: 'Email opened'
    }
  ]
};

// Create a mock axios instance
export const mockAxiosInstance = {
  request: jest.fn(),
  interceptors: {
    response: { use: jest.fn() }
  }
};

// Mock axios.create
jest.spyOn(axios, 'create').mockReturnValue(mockAxiosInstance as any); 