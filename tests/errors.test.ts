import { SendLayer } from '../src';
import { TEST_API_KEY, mockAxiosInstance } from './setup';
import {
  SendLayerError,
  SendLayerAPIError,
  SendLayerAuthenticationError,
  SendLayerValidationError,
  SendLayerNotFoundError,
  SendLayerRateLimitError,
  SendLayerInternalServerError
} from '../src/exceptions';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const apiErrorBody = (...pairs: [number, string][]) => ({
  Errors: pairs.map(([Code, Message]) => ({ Code, Message }))
});

const reject = (status: number, data: any) =>
  mockAxiosInstance.request.mockRejectedValue({ response: { status, data } } as never);

describe('error mapping', () => {
  let emails: any;

  beforeEach(() => {
    emails = new SendLayer(TEST_API_KEY).Emails;
    jest.clearAllMocks();
  });

  const send = () =>
    emails.send({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test',
      text: 'body'
    });

  const cases: [number, any][] = [
    [400, SendLayerValidationError],
    [401, SendLayerAuthenticationError],
    [404, SendLayerNotFoundError],
    [422, SendLayerValidationError],
    [429, SendLayerRateLimitError],
    [500, SendLayerInternalServerError]
  ];

  it.each(cases)('maps %i and surfaces the API message', async (status, ErrorClass) => {
    reject(status, apiErrorBody([14, 'Recipient email is suppressed']));

    await expect(send()).rejects.toThrow(ErrorClass as any);

    try {
      await send();
    } catch (err: any) {
      // The API's own message, not a hardcoded default.
      expect(err.message).toBe('Recipient email is suppressed');
      expect(err.statusCode).toBe(status);
      expect(err.errors).toEqual([{ Code: 14, Message: 'Recipient email is suppressed' }]);
      expect(err.codes).toEqual([14]);
    }
  });

  it('joins multiple error messages', async () => {
    reject(400, apiErrorBody([2, 'Missing FromName'], [8, 'Missing Subject']));

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err.message).toBe('Missing FromName; Missing Subject');
      expect(err.codes).toEqual([2, 8]);
    }
  });

  it('maps an unmapped status to SendLayerAPIError with a status prefix', async () => {
    reject(502, apiErrorBody([14, 'Recipient email is suppressed']));

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SendLayerAPIError);
      expect(err.statusCode).toBe(502);
      expect(err.message).toBe('API Error 502: Recipient email is suppressed');
      expect(err.codes).toEqual([14]);
    }
  });

  it('falls back to the legacy singular Error key', async () => {
    reject(400, { Error: 'legacy shape' });

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err.message).toBe('legacy shape');
      expect(err.errors).toEqual([]);
    }
  });

  it('survives a non-object body without throwing a TypeError', async () => {
    reject(400, '<html>Bad Request</html>');

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SendLayerValidationError);
      expect(err.message).toBe('Invalid request parameters');
      expect(err.errors).toEqual([]);
    }
  });

  it('survives a null body', async () => {
    reject(500, null);

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SendLayerInternalServerError);
      expect(err.message).toBe('Internal server error');
    }
  });

  it('ignores a malformed Errors value', async () => {
    reject(400, { Errors: 'not-an-array' });

    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err.errors).toEqual([]);
      expect(err.message).toBe('Invalid request parameters');
    }
  });

  it('wraps a network error as SendLayerError', async () => {
    mockAxiosInstance.request.mockRejectedValue({ message: 'socket hang up' } as never);

    await expect(send()).rejects.toThrow(SendLayerError);
    await expect(send()).rejects.toThrow('socket hang up');
  });

  it('exposes the same properties on locally raised errors', () => {
    const err = new SendLayerValidationError('local failure');
    expect(err.errors).toEqual([]);
    expect(err.codes).toEqual([]);
    expect(err.statusCode).toBeUndefined();
    expect(err.message).toBe('local failure');
    expect(err).toBeInstanceOf(SendLayerError);
    expect(err).toBeInstanceOf(Error);
  });
});
