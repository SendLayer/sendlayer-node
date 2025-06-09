export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailAttachment {
    path: string;
    type: string;
    filename?: string;
    disposition?: string;
    contentId?: number;
}

export interface EmailOptions {
    from_email: string;
    from_name?: string;
    to: string | EmailRecipient | EmailRecipient[];
    subject: string;
    html?: string;
    text?: string;
    cc?: EmailRecipient | EmailRecipient[];
    bcc?: EmailRecipient | EmailRecipient[];
    replyTo?: EmailRecipient | EmailRecipient[];
    tags?: string[];
    attachments?: EmailAttachment[];
    headers?: Record<string, string>;
}

export interface SendEmailResponse {
    MessageID: string;
}

export interface GeoLocation {
    City?: string;
    Region?: string;
    Country?: string;
}
  
export interface Message {
    Headers: MessageHeaders;
}
  
export interface MessageHeaders {
    MessageId: string;
    From: string[];
    ReplyTo: any[];
    To: string[];
    Cc: any[];
    Bcc: any[];
    Subject: string;
}
  
export interface Event {
    Event: string;
    LoggedAt: number;
    LogLevel: string;
    Message: Message;
    Reason: string;
    Ip: string;
    GeoLocation: GeoLocation;
}
  
export interface GetEventsOptions {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    fromEmail?: string;
    toEmail?: string;
    messageId?: string;
    retrieveCount?: number;
}
  
export interface GetEventsResponse {
    TotalRecords: number;
    Events: Event[];
}

export interface Webhook {
    WebhookID: string;
    WebhookURL: string;
    Event: string;
    Status: string;
}
  
export interface CreateWebhookOptions {
    url: string;
    event: string;
}
  
export interface CreateWebhookResponse {
    NewWebhookID: number;
}
  
export interface GetWebhooksResponse {
    Webhooks: Webhook[];
}

export enum ContentType {
  HTML = "HTML",
  TEXT = "Text"
}

export enum ContentDisposition {
  ATTACHMENT = "attachment",
  INLINE = "inline"
}

export enum ContentField {
  HTML = "HTMLContent",
  PLAIN = "PlainContent"
}

export enum EventType {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  UNSUBSCRIBED = "unsubscribed",
  COMPLAINED = "complained",
  FAILED = "failed"
}

export enum WebhookEventOptions {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  UNSUBSCRIBED = "unsubscribed",
  COMPLAINED = "complained",
  FAILED = "failed"
}