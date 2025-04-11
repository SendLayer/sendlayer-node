import { BaseClient } from '../base/client';
import { SendLayerValidationError } from '../exceptions';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { URL } from 'url';
import { createHash } from 'crypto';
import { EmailRecipient, EmailAttachment, EmailOptions, SendEmailResponse } from '../types';


export class NewEmail extends BaseClient {
  constructor(apiKey: string) {
    super(apiKey);
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
      ContentType: options.html ? "HTML" : "Text",
      [options.html ? "HTMLContent" : "PlainContent"]: options.html || options.text
    };

    if (options.cc) {
      const ccList = Array.isArray(options.cc)
        ? options.cc.map(r => this.validateRecipient(r, "cc"))
        : [this.validateRecipient(options.cc, "cc")];
      payload.CC = ccList;
    }

    if (options.bcc) {
      const bccList = Array.isArray(options.bcc)
        ? options.bcc.map(r => this.validateRecipient(r, "bcc"))
        : [this.validateRecipient(options.bcc, "bcc")];
      payload.BCC = bccList;
    }

    if (options.replyTo) {
      const replyToList = Array.isArray(options.replyTo)
        ? options.replyTo.map(r => this.validateRecipient(r, "reply_to"))
        : [this.validateRecipient(options.replyTo, "reply_to")];
      payload.ReplyTo = replyToList;
    }

    if (options.tags) {
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
            Disposition: attachment.disposition || "attachment",
            ContentID: attachment.contentId || parseInt(createHash('sha1').update(attachment.path).digest('hex').slice(0, 8), 16)
          };
        })
      );
      
      payload.Attachments = processedAttachments;
    }

    return this.request<SendEmailResponse>({
      method: 'POST',
      url: 'email',
      data: payload
    });
  }
} 