import axios from 'axios';
import * as sdk from '../src';
import { SendLayer } from '../src';
import { BaseClient } from '../src/base/client';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const createdConfig = () => (axios.create as any).mock.calls.slice(-1)[0][0];

describe('SendLayer client configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards config to the underlying client', () => {
    new SendLayer('test-api-key', { timeout: 5000 });
    expect(createdConfig().timeout).toBe(5000);
  });

  it('uses the default timeout when no config is given', () => {
    new SendLayer('test-api-key');
    expect(createdConfig().timeout).toBe(BaseClient.DEFAULT_TIMEOUT);
  });

  it('forwards axios options and the attachment timeout', () => {
    const client = new SendLayer('test-api-key', {
      attachmentURLTimeout: 1234,
      axios: { headers: { 'X-Custom': 'value' } }
    });
    expect(createdConfig().headers['X-Custom']).toBe('value');
    expect(createdConfig().headers.Authorization).toBe('Bearer test-api-key');
    expect((client as any).client.attachmentURLTimeout).toBe(1234);
  });

  it('exports every error type from the package root', () => {
    for (const name of [
      'SendLayerError',
      'SendLayerAPIError',
      'SendLayerAuthenticationError',
      'SendLayerValidationError',
      'SendLayerNotFoundError',
      'SendLayerRateLimitError',
      'SendLayerInternalServerError'
    ]) {
      expect((sdk as any)[name]).toBeDefined();
    }
  });
});
