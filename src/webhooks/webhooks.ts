import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import { Webhook, CreateWebhookOptions, CreateWebhookResponse, GetWebhooksResponse } from '../types';


export class Webhooks extends BaseClient {
  constructor(apiKey: string) {
    super(apiKey);
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
    const eventOptions = ["bounce", "click", "open", "unsubscribe", "complaint", "delivery"];
    if (!eventOptions.includes(options.event)) {
      throw new SendLayerValidationError(`Error: Invalid event name - '${options.event}' is not a valid event name`);
    }

    return this.request<CreateWebhookResponse>({
      method: 'POST',
      url: 'webhooks',
      data: {
        WebhookURL: options.url,
        Event: options.event
      }
    });
  }

  async getAll(): Promise<Webhook[]> {
    const response = await this.request<GetWebhooksResponse>({
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

    await this.request({
      method: 'DELETE',
      url: `webhooks/${webhookId}`
    });
  }
} 