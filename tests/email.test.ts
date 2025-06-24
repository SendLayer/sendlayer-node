import { SendLayer } from '../src';
import { TEST_API_KEY, mockEmailResponse, mockAxiosInstance } from './setup';
import { SendLayerValidationError } from '../src/exceptions';
import * as path from 'path';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Email Client', () => {
  let client: SendLayer;
  let emails: any;

  beforeEach(() => {
    client = new SendLayer(TEST_API_KEY);
    emails = client.Emails;
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should send a simple email successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEmailResponse });

      const response = await emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello, this is a test email'
      });

      expect(response).toEqual(mockEmailResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'email',
        data: {
          From: {
            email: 'sender@example.com'
          },
          To: [{ email: 'recipient@example.com' }],
          Subject: 'Test Email',
          ContentType: 'Text',
          PlainContent: 'Hello, this is a test email'
        }
      });
    });

    it('should send a complex email with all options', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: mockEmailResponse });
      const testFilePath = path.join(__dirname, 'fixtures', 'test.txt');

      const response = await emails.send({
        from: { email: 'sender@example.com', name: 'Test Sender' },
        to: [
          { email: 'recipient1@example.com', name: 'Recipient 1' },
          { email: 'recipient2@example.com' }
        ],
        subject: 'Test Email',
        html: '<p>Hello, this is a test email</p>',
        cc: { email: 'cc@example.com', name: 'CC Recipient' },
        bcc: [
          { email: 'bcc1@example.com' },
          { email: 'bcc2@example.com', name: 'BCC Recipient' }
        ],
        replyTo: { email: 'reply@example.com' },
        tags: ['test', 'email'],
        headers: { 'X-Custom-Header': 'value' },
        attachments: [
          {
            path: testFilePath,
            type: 'text/plain',
            filename: 'custom-name.txt',
            disposition: 'attachment',
            contentId: 'unique-id'
          }
        ]
      });

      expect(response).toEqual(mockEmailResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'email',
        data: {
          From: {
            email: 'sender@example.com',
            name: 'Test Sender'
          },
          To: [
            { email: 'recipient1@example.com', name: 'Recipient 1' },
            { email: 'recipient2@example.com' }
          ],
          Subject: 'Test Email',
          ContentType: 'HTML',
          HTMLContent: '<p>Hello, this is a test email</p>',
          CC: [{ email: 'cc@example.com', name: 'CC Recipient' }],
          BCC: [
            { email: 'bcc1@example.com' },
            { email: 'bcc2@example.com', name: 'BCC Recipient' }
          ],
          ReplyTo: [{ email: 'reply@example.com' }],
          Tags: ['test', 'email'],
          Headers: { 'X-Custom-Header': 'value' },
          Attachments: [
            {
              Content: expect.any(String),
              Type: 'text/plain',
              Filename: 'custom-name.txt',
              Disposition: 'attachment',
              ContentID: 'unique-id'
            }
          ]
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

      await expect(emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello'
      })).rejects.toThrow('Invalid API key');
    });

    it('should throw error for invalid sender email', async () => {
      await expect(emails.send({
        from: 'invalid-email',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid recipient email (string)', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: 'invalid-email',
        subject: 'Test Email',
        text: 'Hello'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid recipient email (object)', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: { email: 'invalid-email' },
        subject: 'Test Email',
        text: 'Hello'
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid CC email', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello',
        cc: { email: 'invalid-email' }
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid BCC email', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello',
        bcc: { email: 'invalid-email' }
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid ReplyTo email', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello',
        replyTo: { email: 'invalid-email' }
      })).rejects.toThrow(SendLayerValidationError);
    });

    it('should throw error for invalid attachment', async () => {
      await expect(emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Hello',
        attachments: [
          {
            path: 'nonexistent.pdf',
            type: 'application/pdf'
          }
        ]
      })).rejects.toThrow(SendLayerValidationError);
    });
  });
}); 