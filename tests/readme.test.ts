/**
 * Executes the claims the README makes, so the docs cannot drift from the code.
 */
import axios from 'axios';
import * as sdk from '../src';
import { SendLayer } from '../src';
import { BaseClient } from '../src/base/client';
import { mockAxiosInstance } from './setup';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const createdConfig = () => (axios.create as any).mock.calls.slice(-1)[0][0];

describe('README claims', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('the documented config object is accepted verbatim', () => {
    const client = new SendLayer('your-api-key', {
      timeout: 30000,
      attachmentURLTimeout: 30000,
      axios: { headers: { 'X-Custom-Header': 'value' } }
    });
    const cfg = createdConfig();
    expect(cfg.timeout).toBe(30000);
    expect(cfg.headers['X-Custom-Header']).toBe('value');
    // "authentication is preserved"
    expect(cfg.headers.Authorization).toBe('Bearer your-api-key');
    expect((client as any).client.attachmentURLTimeout).toBe(30000);
  });

  it('the HTML-with-plain-text example sends both parts', async () => {
    const sendlayer = new SendLayer('your-api-key');
    mockAxiosInstance.request.mockResolvedValue({ data: { MessageID: 'abc' } } as never);

    await sendlayer.Emails.send({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Welcome!',
      text: 'Welcome to our platform!',
      html: '<h1>Welcome!</h1><p>Welcome to our platform!</p>'
    });

    const sent = (mockAxiosInstance.request as any).mock.calls[0][0].data;
    expect(sent.HTMLContent).toBe('<h1>Welcome!</h1><p>Welcome to our platform!</p>');
    expect(sent.PlainContent).toBe('Welcome to our platform!');
    expect(sent.ContentType).toBe('HTML');
  });

  it('every error type named in the README is importable from the package root', () => {
    for (const name of [
      'SendLayerError',
      'SendLayerAuthenticationError',
      'SendLayerValidationError',
      'SendLayerNotFoundError',
      'SendLayerRateLimitError',
      'SendLayerInternalServerError',
      'SendLayerAPIError'
    ]) {
      expect((sdk as any)[name]).toBeDefined();
    }
  });

  it('only SendLayerAPIError prefixes its message, as documented', async () => {
    const sendlayer = new SendLayer('your-api-key');
    const body = { Errors: [{ Code: 14, Message: 'Recipient email is suppressed' }] };
    const send = () =>
      sendlayer.Emails.send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'S',
        text: 'body'
      });

    for (const status of [400, 401, 404, 422, 429, 500]) {
      mockAxiosInstance.request.mockRejectedValue({ response: { status, data: body } } as never);
      try {
        await send();
        throw new Error('expected a rejection');
      } catch (err: any) {
        expect(err.message).toBe('Recipient email is suppressed');
        expect(err.statusCode).toBe(status);
        expect(err.codes).toContain(14);
      }
    }

    mockAxiosInstance.request.mockRejectedValue({ response: { status: 502, data: body } } as never);
    try {
      await send();
      throw new Error('expected a rejection');
    } catch (err: any) {
      expect(err).toBeInstanceOf(sdk.SendLayerAPIError);
      expect(err.message).toBe('API Error 502: Recipient email is suppressed');
    }
  });

  it('the documented default timeout matches the implementation', () => {
    new SendLayer('your-api-key');
    expect(createdConfig().timeout).toBe(30000);
    expect(BaseClient.DEFAULT_TIMEOUT).toBe(30000);
  });
});
