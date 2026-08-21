import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  SendLayerError,
  SendLayerErrorEntry,
  SendLayerAPIError,
  SendLayerAuthenticationError,
  SendLayerValidationError,
  SendLayerNotFoundError,
  SendLayerRateLimitError,
  SendLayerInternalServerError
} from '../exceptions';

export type ClientConfig = {
  axios?: AxiosRequestConfig;
  attachmentURLTimeout?: number;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
};

type ErrorConstructor = new (
  message: string,
  statusCode?: number,
  response?: any,
  errors?: SendLayerErrorEntry[]
) => SendLayerError;

/** Status -> [error class, fallback message when the API sends none]. */
const ERROR_MAP: Record<number, [ErrorConstructor, string]> = {
  400: [SendLayerValidationError, 'Invalid request parameters'],
  401: [SendLayerAuthenticationError, 'Invalid API key'],
  404: [SendLayerNotFoundError, 'Resource not found'],
  422: [SendLayerValidationError, 'Unprocessable Entity'],
  429: [SendLayerRateLimitError, 'Rate limit exceeded'],
  500: [SendLayerInternalServerError, 'Internal server error']
};

export class BaseClient {
  /** requests hang forever without this; axios applies no timeout by default. */
  public static readonly DEFAULT_TIMEOUT = 30000;

  protected client: AxiosInstance;
  public attachmentURLTimeout: number;
  public readonly timeout: number;

  constructor(apiKey: string, config: ClientConfig = {}) {
    const axiosConfig = config.axios || {};
    this.attachmentURLTimeout = config.attachmentURLTimeout ?? 30000;
    this.timeout = config.timeout ?? axiosConfig.timeout ?? BaseClient.DEFAULT_TIMEOUT;

    this.client = axios.create({
      baseURL: 'https://console.sendlayer.com/api/v1/',
      ...axiosConfig,
      // timeout and headers are resolved last so a caller-supplied axios config
      // cannot drop them. Headers are merged rather than replaced -- spreading
      // axiosConfig wholesale previously discarded the Authorization header
      // whenever a caller passed any headers of their own.
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(axiosConfig.headers || {})
      }
    });
  }

  /** Normalize SendLayer's `Errors` array from a response body. */
  private static extractErrors(data: any): SendLayerErrorEntry[] {
    const raw = data == null ? undefined : (data as any).Errors;

    return Array.isArray(raw)
      ? raw.filter(entry => entry !== null && typeof entry === 'object')
      : [];
  }

  /**
   * Build a message from the response, preferring the API's own text.
   *
   * Joins multiple `Errors` messages with "; ", then falls back to the singular
   * `Error` key, then to `fallback`.
   */
  private static extractMessage(data: any, fallback: string): string {
    const messages = BaseClient.extractErrors(data)
      .map(entry => entry.Message)
      .filter((message): message is string => typeof message === 'string' && message.length > 0);

    if (messages.length > 0) {
      return messages.join('; ');
    }

    if (data != null && typeof (data as any).Error === 'string' && (data as any).Error) {
      return (data as any).Error;
    }

    return fallback;
  }

  /** Map any thrown value onto a SendLayerError. */
  private static mapError(error: any): SendLayerError {
    if (error instanceof SendLayerError) {
      return error;
    }

    if (error && error.response) {
      const { status, data } = error.response;
      const errors = BaseClient.extractErrors(data);
      const mapped = ERROR_MAP[status as number];

      if (mapped) {
        const [ErrorClass, fallback] = mapped;
        return new ErrorClass(BaseClient.extractMessage(data, fallback), status, data, errors);
      }

      const fallback = status >= 500 && status < 600 ? 'Server error' : 'API request failed';
      return new SendLayerAPIError(
        BaseClient.extractMessage(data, fallback),
        status,
        data,
        errors
      );
    }

    if (error && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
      return new SendLayerError(`Request timed out: ${error.message}`);
    }

    return new SendLayerError((error && error.message) || 'An unexpected error occurred');
  }

  /**
   * Make a request to the SendLayer API.
   *
   * Always resolves with the response body or rejects with a SendLayerError --
   * an axios error is never surfaced to the caller.
   */
  public async request<T>(config: any): Promise<T> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      throw BaseClient.mapError(error);
    }
  }
}
