import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import { Webhook, CreateWebhookOptions, CreateWebhookResponse, GetWebhooksResponse, WebhookEventOptions } from '../types';


export class Webhooks {
  private client: BaseClient;

  constructor(baseClient: BaseClient) {
    this.client = baseClient;
  }

  private validateUrl(url: string): boolean {
    const urlPattern = /^https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+/;
    return urlPattern.test(url);
  }

  async create(options: CreateWebhookOptions): Promise<CreateWebhookResponse> {
    // Validate URL
    if (!this.validateUrl(options.url)) {
      throw new SendLayerValidationError(`Error: Invalid webhook URL - ${options.url}`);
    }

    // Validate event type
    if (!Object.values(WebhookEventOptions).includes(options.event as WebhookEventOptions)) {
      throw new SendLayerValidationError(`Error: Invalid event name - '${options.event}' is not a valid event name`);
    }

    return this.client.request<CreateWebhookResponse>({
      method: 'POST',
      url: 'webhooks',
      data: {
        WebhookURL: options.url,
        Event: options.event
      }
    });
  }

  async get(): Promise<Webhook[]> {
    const response = await this.client.request<GetWebhooksResponse>({
      method: 'GET',
      url: 'webhooks'
    });
    return response.Webhooks;
  }

  async delete(webhookId: number): Promise<void> {
    // Validate webhook ID
    
    if (!Number.isInteger(webhookId)) {
      throw new SendLayerValidationError("WebhookID must be an integer");
    }
    if (webhookId <= 0) {
      throw new SendLayerValidationError("WebhookID must be greater than 0");
    }

    await this.client.request({
      method: 'DELETE',
      url: `webhooks/${webhookId}`
    });
  }
} 