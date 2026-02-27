export interface SendMailRequestMetaData {
  graphTenantId: string;
  graphClientId: string;
  graphClientSecret: string;
  senderUpn: string;
}

export const requiredSendMailMetaDataFields = [
  "graphTenantId",
  "graphClientId",
  "graphClientSecret",
  "senderUpn",
] as const;

export interface SendMailRequestDataContent {
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  html: string;
}

export const requiredSendMailDataContentFields = [
  "to",
  "subject",
  "html",
] as const;

export interface SendMailResponseDataContent {
  accepted: boolean;
  requestId: string;
}

export interface SendMailRequest {
  metaData: SendMailRequestMetaData;
  dataContent: SendMailRequestDataContent;
}

export interface SendMailResponse {
  resultType: "SUCCESS" | "ERROR";
  resultMessage: string;
  dataContent?: SendMailResponseDataContent;
  metaData: {
    version: string;
  };
}

export interface GraphTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface GraphEmailAddress {
  address: string;
}

export interface GraphRecipient {
  emailAddress: GraphEmailAddress;
}

export interface GraphMessageBody {
  contentType: "HTML" | "Text";
  content: string;
}

export interface GraphMessage {
  subject: string;
  body: GraphMessageBody;
  toRecipients: GraphRecipient[];
  ccRecipients?: GraphRecipient[];
  bccRecipients?: GraphRecipient[];
  replyTo?: GraphRecipient[];
}

export interface GraphSendMailRequest {
  message: GraphMessage;
  saveToSentItems: boolean;
}
