import axios, { AxiosInstance } from 'axios';
import {
  SendLayerError,
  SendLayerAPIError,
  SendLayerAuthenticationError,
  SendLayerValidationError
} from '../exceptions';

export class BaseClient {
  protected client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://console.sendlayer.com/api/v1/',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            throw new SendLayerAuthenticationError(data.Error || 'Invalid API key');
          }
          
          if (status === 400) {
            throw new SendLayerValidationError(data.Error || 'Invalid request parameters');
          }
          
          if (status === 404) {
            throw new SendLayerAPIError(data.Error || 'Resource not found', status, data);
          }
          
          if (status === 422) {
            throw new SendLayerValidationError(
              data.Error || 'Unprocessable Entity'
            );
          }
          
          throw new SendLayerAPIError(data.Error || 'API request failed', status, data);
        }
        
        throw new SendLayerError(error.message || 'An unexpected error occurred');
      }
    );
  }

  public async request<T>(config: any): Promise<T> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      if (error instanceof SendLayerError) {
        throw error;
      }
      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          throw new SendLayerAuthenticationError(data.Error || 'Invalid API key');
        }
        if (status === 400) {
          throw new SendLayerValidationError(data.Error || 'Invalid request parameters');
        }
        if (status === 422) {
          throw new SendLayerValidationError(
            data.Error || 'Unprocessable Entity'
          );
        }
        throw new SendLayerAPIError(data.Error || 'API request failed', status, data);
      }
      throw new SendLayerError(error.message || 'An unexpected error occurred');
    }
  }
} 