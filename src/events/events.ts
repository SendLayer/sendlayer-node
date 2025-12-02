import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import { GetEventsOptions, GetEventsResponse, Message, MessageHeaders, Event, EventType } from '../types';


export class Events {
  private client: BaseClient;

  constructor(baseClient: BaseClient) {
    this.client = baseClient;
  }

  async get(options: GetEventsOptions = {}): Promise<GetEventsResponse> {

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
    if (options.event && !Object.values(EventType).includes(options.event as EventType)) {
      throw new SendLayerValidationError(`Invalid event type: '${options.event}'. Valid types are: ${Object.values(EventType).join(', ')}`);
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
      ...(options.event && { Event: options.event }),
      ...(options.messageId && { MessageId: options.messageId }),
      ...(options.retrieveCount && { RetrieveCount: options.retrieveCount }),
    };

    const response = await this.client.request<GetEventsResponse>({
      method: 'GET',
      url: 'events',
      params
    });

    return response;
  }
} 