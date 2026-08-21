/** A raw entry from SendLayer's `Errors` response array. */
export interface SendLayerErrorEntry {
  Code?: number;
  Message?: string;
  [key: string]: unknown;
}

/**
 * Base error for the SendLayer SDK.
 *
 * Every SendLayer error carries the same properties, so callers can read them
 * without first narrowing to a specific subclass:
 *
 * - `statusCode` HTTP status of the response, or undefined for local errors
 * - `response`   decoded response body, or undefined when unavailable
 * - `errors`     raw SendLayer `Errors` entries, each with the API's numeric
 *                `Code` and `Message`; empty for local errors and for
 *                responses that aren't in that shape
 */
export class SendLayerError extends Error {
  public readonly statusCode?: number;
  public readonly response?: any;
  public readonly errors: SendLayerErrorEntry[];

  constructor(
    message: string,
    statusCode?: number,
    response?: any,
    errors: SendLayerErrorEntry[] = []
  ) {
    super(message);
    this.name = 'SendLayerError';
    this.statusCode = statusCode;
    this.response = response;
    this.errors = errors;
    // Keep `instanceof` working for subclasses of Error after transpilation.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Numeric SendLayer error codes carried by this error, for branching:
   * `if (err.codes.includes(14))`.
   *
   * @see https://developers.sendlayer.com/api-reference/error-codes
   */
  public get codes(): number[] {
    return this.errors
      .map(entry => entry.Code)
      .filter((code): code is number => typeof code === 'number');
  }
}

/** Raised for API errors not covered by a more specific type. */
export class SendLayerAPIError extends SendLayerError {
  constructor(
    message: string,
    statusCode: number,
    response?: any,
    errors: SendLayerErrorEntry[] = []
  ) {
    // Historical string form keeps the status prefix.
    super(`API Error ${statusCode}: ${message}`, statusCode, response, errors);
    this.name = 'SendLayerAPIError';
  }
}

export class SendLayerAuthenticationError extends SendLayerError {
  constructor(message: string, statusCode?: number, response?: any, errors: SendLayerErrorEntry[] = []) {
    super(message, statusCode, response, errors);
    this.name = 'SendLayerAuthenticationError';
  }
}

export class SendLayerValidationError extends SendLayerError {
  constructor(message: string, statusCode?: number, response?: any, errors: SendLayerErrorEntry[] = []) {
    super(message, statusCode, response, errors);
    this.name = 'SendLayerValidationError';
  }
}

export class SendLayerNotFoundError extends SendLayerError {
  constructor(message: string, statusCode?: number, response?: any, errors: SendLayerErrorEntry[] = []) {
    super(message, statusCode, response, errors);
    this.name = 'SendLayerNotFoundError';
  }
}

export class SendLayerRateLimitError extends SendLayerError {
  constructor(message: string, statusCode?: number, response?: any, errors: SendLayerErrorEntry[] = []) {
    super(message, statusCode, response, errors);
    this.name = 'SendLayerRateLimitError';
  }
}

export class SendLayerInternalServerError extends SendLayerError {
  constructor(message: string, statusCode?: number, response?: any, errors: SendLayerErrorEntry[] = []) {
    super(message, statusCode, response, errors);
    this.name = 'SendLayerInternalServerError';
  }
}
