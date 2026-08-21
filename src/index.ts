import { Emails } from './email/email';
import { Webhooks } from './webhooks/webhooks';
import { Events } from './events/events';
import { BaseClient, ClientConfig } from './base/client';
import {
  SendLayerError,
  SendLayerErrorEntry,
  SendLayerAPIError,
  SendLayerAuthenticationError,
  SendLayerValidationError,
  SendLayerNotFoundError,
  SendLayerRateLimitError,
  SendLayerInternalServerError
} from './exceptions';

export {
  SendLayerError,
  SendLayerAPIError,
  SendLayerAuthenticationError,
  SendLayerValidationError,
  SendLayerNotFoundError,
  SendLayerRateLimitError,
  SendLayerInternalServerError
};
export type { SendLayerErrorEntry, ClientConfig };

export class SendLayer {
  private client: BaseClient;
  public readonly Emails: Emails;
  public readonly Webhooks: Webhooks;
  public readonly Events: Events;

  /**
   * @param apiKey Your SendLayer API key.
   * @param config Optional settings: `timeout` (ms, default 30000),
   *   `attachmentURLTimeout` (ms), and `axios` for extra request options.
   */
  constructor(apiKey: string, config: ClientConfig = {}) {
    this.client = new BaseClient(apiKey, config);
    this.Emails = new Emails(this.client);
    this.Webhooks = new Webhooks(this.client);
    this.Events = new Events(this.client);
  }
}

// Also export types
export * from './types';
