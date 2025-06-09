import { Emails } from './email/email';
import { Webhooks } from './webhooks/webhooks';
import { Events } from './events/events';
import { BaseClient } from './base/client';
import {
  SendLayerError,
  SendLayerAPIError,
} from './exceptions';

export {
  SendLayerError,
  SendLayerAPIError,
}; 

export class SendLayer {
  private client: BaseClient;
  public readonly Emails: Emails;
  public readonly Webhooks: Webhooks;
  public readonly Events: Events;

  constructor(apiKey: string) {
    this.client = new BaseClient(apiKey);
    this.Emails = new Emails(this.client);
    this.Webhooks = new Webhooks(this.client);
    this.Events = new Events(this.client);
  }
}

// Also export types
export * from './types'; 