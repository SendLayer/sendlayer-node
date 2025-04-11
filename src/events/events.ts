import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import { GetEventsOptions, GetEventsResponse, Message, MessageHeaders, Event } from '../types';


export class Events extends BaseClient {
  constructor(apiKey: string) {
    super(apiKey);
  }

  async getAll(options: GetEventsOptions = {}): Promise<GetEventsResponse> {
    const validEventTypes = [
      "accepted", "rejected", "delivered", "opened", 
      "clicked", "unsubscribed", "complained", "failed"
    ];

    // Validate date range
    if (options.startDate && options.endDate) {
      if (options.endDate <= options.startDate) {
        throw new SendLayerValidationError("End date must be after start date");
      }
      
      const now = new Date();
      if (options.startDate > now || options.endDate > now) {
        throw new SendLayerValidationError("Dates cannot be in the future");
      }
    }

    // Validate event type
    if (options.eventType && !validEventTypes.includes(options.eventType)) {
      throw new SendLayerValidationError(`Invalid event type: '${options.eventType}'. Valid types are: ${validEventTypes.join(', ')}`);
    }

    // Validate retrieve count
    if (options.retrieveCount !== undefined) {
      if (!Number.isInteger(options.retrieveCount) || options.retrieveCount <= 0 || options.retrieveCount > 100) {
        throw new SendLayerValidationError("Retrieve count must be an integer between 1 and 100");
      }
    }

    const params: Record<string, any> = {
      ...(options.startDate && { StartDate: Math.floor(options.startDate.getTime() / 1000) }),
      ...(options.endDate && { EndDate: Math.floor(options.endDate.getTime() / 1000) }),
      ...(options.eventType && { Event: options.eventType }),
      ...(options.messageId && { MessageId: options.messageId }),
      ...(options.retrieveCount && { RetrieveCount: options.retrieveCount }),
    };

    const response = await this.request<GetEventsResponse>({
      method: 'GET',
      url: 'events',
      params
    });

    return response;
  }
} 