import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { URL } from 'url';
import { createHash } from 'crypto';
import { 
  EmailRecipient, 
  EmailAttachment, 
  EmailOptions, 
  SendEmailResponse,
  ContentType,
  ContentField,
  ContentDisposition 
} from '../types';


export class Emails {
  private client: BaseClient;

  constructor(baseClient: BaseClient) {
    this.client = baseClient;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateRecipient(recipient: string | EmailRecipient, recipientType: string = "recipient"): EmailRecipient {
    if (typeof recipient === 'string') {
      if (!this.validateEmail(recipient)) {
        throw new SendLayerValidationError(`Invalid ${recipientType} email address: ${recipient}`);
      }
      return { email: recipient };
    }
    if (!this.validateEmail(recipient.email)) {
      throw new SendLayerValidationError(`Invalid ${recipientType} email address: ${recipient.email}`);
    }
    return recipient;
  }

  private validateAttachment(attachment: EmailAttachment): void {
    if (!attachment.path) {
      throw new SendLayerValidationError('Attachment path is required');
    }
    if (!attachment.type) {
      throw new SendLayerValidationError('Attachment type is required');
    }
  }

  private isUrl(path: string): boolean {
    try {
      new URL(path);
      return true;
    } catch {
      return false;
    }
  }

  private async readAttachment(filePath: string): Promise<string> {
    try {
      // Check if the path is a URL
      if (this.isUrl(filePath)) {
        try {
          const response = await axios.get(filePath, { responseType: 'arraybuffer', timeout: 30000 });
          const content = response.data;
          
          return Buffer.from(content).toString('base64');
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new SendLayerValidationError(`Error fetching remote file: ${error.message}`);
          }
          throw new SendLayerValidationError('Unknown error occurred while fetching remote file');
        }
      }

      // Try different local paths
      const pathsToTry = [
        filePath, // Original path
        path.resolve(filePath), // Absolute path
        path.join(process.cwd(), filePath), // Relative to current working directory
        path.join(__dirname, filePath), // Relative to script directory
        path.join(process.env.HOME || '', filePath) // Relative to user's home directory
      ];

      for (const currentPath of pathsToTry) {
        try {
          if (fs.existsSync(currentPath)) {
            if (!fs.statSync(currentPath).isFile()) {
              throw new SendLayerValidationError(`Path is not a file: ${currentPath}`);
            }
            try {
              fs.accessSync(currentPath, fs.constants.R_OK);
            } catch {
              throw new SendLayerValidationError(`File is not readable: ${currentPath}`);
            }
            const content = fs.readFileSync(currentPath);
            
            return Buffer.from(content).toString('base64');
          }
        } catch (error: unknown) {
          if (error instanceof SendLayerValidationError) {
            throw error;
          }
          if (error instanceof Error) {
            throw new SendLayerValidationError(`Failed to read file at ${currentPath}: ${error.message}`);
          }
        }
      }

      throw new SendLayerValidationError(`Attachment file not found: ${filePath}`);
    } catch (error: unknown) {
      if (error instanceof SendLayerValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SendLayerValidationError(`Error reading attachment: ${error.message}`);
      }
      throw new SendLayerValidationError('Unknown error occurred while reading attachment');
    }
  }

  async send(options: EmailOptions): Promise<SendEmailResponse> {
    // Validate required parameters
    const missingFields: string[] = [];

    if (!options.from_email) missingFields.push('from_email');
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) missingFields.push('to');
    if (!options.subject) missingFields.push('subject');
    if (!options.text && !options.html) missingFields.push('text or html');

    if (missingFields.length > 0) {
      throw new SendLayerValidationError(
        `Missing required email parameter(s): ${missingFields.join(', ')}`
      );
    }

    // Validate sender first
    if (!this.validateEmail(options.from_email)) {
      throw new SendLayerValidationError(`Invalid sender email address: ${options.from_email}`);
    }

    // Validate and process recipients
    const toList = Array.isArray(options.to) 
      ? options.to.map(r => this.validateRecipient(r, "recipient"))
      : [this.validateRecipient(options.to, "recipient")];

    const payload: any = {
      From: {
        email: options.from_email,
        name: options?.from_name
      },
      To: toList,
      Subject: options.subject,
      ContentType: options.html ? ContentType.HTML : ContentType.TEXT,
      [options.html ? ContentField.HTML : ContentField.PLAIN]: options.html || options.text
    };

    // Handle all recipient types in a loop
    const recipientTypes = [
      { field: 'cc' as const, payloadKey: 'CC' },
      { field: 'bcc' as const, payloadKey: 'BCC' },
      { field: 'replyTo' as const, payloadKey: 'ReplyTo' }
    ];

    for (const { field, payloadKey } of recipientTypes) {
      try {
        const recipients = options[field];
        if (recipients) {
          const recipientList = Array.isArray(recipients)
            ? recipients.map(r => this.validateRecipient(r, field))
            : [this.validateRecipient(recipients, field)];
          payload[payloadKey] = recipientList;
        }
      } catch (error) {
        if (error instanceof SendLayerValidationError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new SendLayerValidationError(`Error processing recipients for ${field}: ${error.message}`);
        }
        throw new SendLayerValidationError(`Unknown error occurred while processing recipients for ${field}`);
      }
    }

    if (options.tags) {
      if (!Array.isArray(options.tags) || options.tags.some(tag => typeof tag !== 'string')) {
        throw new SendLayerValidationError('Tags must be an array of strings.');
      }
      payload.Tags = options.tags;
    }

    if (options.headers) {
      payload.Headers = options.headers;
    }

    if (options.attachments) {
      // Validate and process attachments
      options.attachments.forEach(attachment => this.validateAttachment(attachment));
      
      // Read and encode attachments
      const processedAttachments = await Promise.all(
        options.attachments.map(async attachment => {
          const content = await this.readAttachment(attachment.path);
          return {
            Content: content,
            Type: attachment.type,
            Filename: attachment.filename || path.basename(attachment.path),
            Disposition: attachment.disposition || ContentDisposition.ATTACHMENT,
            ContentID: attachment.contentId || parseInt(createHash('sha1').update(attachment.path).digest('hex').slice(0, 8), 16)
          };
        })
      );
      
      payload.Attachments = processedAttachments;
    }

    return this.client.request<SendEmailResponse>({
      method: 'POST',
      url: 'email',
      data: payload
    });
  }
} 