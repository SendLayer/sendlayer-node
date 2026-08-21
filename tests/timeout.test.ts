import axios from 'axios';
import { BaseClient } from '../src/base/client';
import { SendLayerError } from '../src/exceptions';
import { mockAxiosInstance } from './setup';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const createdConfig = () => (axios.create as any).mock.calls.slice(-1)[0][0];

describe('timeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies a default timeout', () => {
    new BaseClient('test-api-key');
    expect(createdConfig().timeout).toBe(BaseClient.DEFAULT_TIMEOUT);
  });

  it('is configurable at the top level', () => {
    new BaseClient('test-api-key', { timeout: 5000 });
    expect(createdConfig().timeout).toBe(5000);
  });

  it('is configurable through the axios config', () => {
    new BaseClient('test-api-key', { axios: { timeout: 7000 } });
    expect(createdConfig().timeout).toBe(7000);
  });

  it('prefers the top-level timeout over the axios one', () => {
    new BaseClient('test-api-key', { timeout: 1000, axios: { timeout: 7000 } });
    expect(createdConfig().timeout).toBe(1000);
  });

  it('keeps the Authorization header when the caller supplies headers', () => {
    new BaseClient('test-api-key', { axios: { headers: { 'X-Custom': 'value' } } });
    const { headers } = createdConfig();
    expect(headers.Authorization).toBe('Bearer test-api-key');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Custom']).toBe('value');
  });

  it('maps an axios timeout onto SendLayerError', async () => {
    const client = new BaseClient('test-api-key', { timeout: 3000 });
    mockAxiosInstance.request.mockRejectedValue(
      { code: 'ECONNABORTED', message: 'timeout of 3000ms exceeded' } as never
    );

    await expect(client.request({ method: 'GET', url: 'webhooks' }))
      .rejects.toThrow(SendLayerError);
    await expect(client.request({ method: 'GET', url: 'webhooks' }))
      .rejects.toThrow('Request timed out: timeout of 3000ms exceeded');
  });
});
