export class SendLayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SendLayerError';
  }
}

export class SendLayerAPIError extends SendLayerError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response: any
  ) {
    super(`API Error ${statusCode}: ${message}`);
    this.name = 'SendLayerAPIError';
  }
}

export class SendLayerAuthenticationError extends SendLayerError {
  constructor(message: string) {
    super(message);
    this.name = 'SendLayerAuthenticationError';
  }
}

export class SendLayerValidationError extends SendLayerError {
  constructor(message: string) {
    super(message);
    this.name = 'SendLayerValidationError';
  }
} 