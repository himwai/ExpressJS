import {
  requiredSendMailDataContentFields,
  requiredSendMailMetaDataFields,
  SendMailRequest,
} from "../types/typeSendMail";
import { ValidationError } from "./error.middleware";
import { CONFIG } from "../config/constants";

export const validateSendMailRequest = (
  body: Partial<SendMailRequest>,
): void => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  if (!body.dataContent || typeof body.dataContent !== "object") {
    throw new ValidationError("dataContent must be a valid object");
  }

  // Validate required metaData fields
  for (const field of requiredSendMailMetaDataFields) {
    if (!body.metaData[field]) {
      throw new ValidationError(`Missing required metaData field: ${field}`);
    }
  }

  // Validate required dataContent fields
  for (const field of requiredSendMailDataContentFields) {
    if (!body.dataContent[field]) {
      throw new ValidationError(`Missing required dataContent field: ${field}`);
    }
  }

  // Validate email arrays
  const { to, cc, bcc, replyTo } = body.dataContent;

  if (!Array.isArray(to) || to.length === 0) {
    throw new ValidationError("`to` must be a non-empty array");
  }

  validateEmailArray(to, "to");

  if (cc) {
    validateEmailArray(cc, "cc");
  }

  if (bcc) {
    validateEmailArray(bcc, "bcc");
  }

  if (replyTo) {
    validateEmailArray(replyTo, "replyTo");
  }

  // Validate subject
  const subject = body.dataContent.subject?.trim();
  if (!subject) {
    throw new ValidationError("`subject` is required");
  }
  if (subject.length > CONFIG.LIMITS.MAX_SUBJECT_LENGTH) {
    throw new ValidationError(
      `\`subject\` too long (max ${CONFIG.LIMITS.MAX_SUBJECT_LENGTH})`,
    );
  }

  // Validate HTML
  const html = body.dataContent.html?.trim();
  if (!html) {
    throw new ValidationError("`html` is required");
  }
  if (html.length > CONFIG.LIMITS.MAX_HTML_LENGTH) {
    throw new ValidationError(
      `\`html\` too large (max ${CONFIG.LIMITS.MAX_HTML_LENGTH} chars)`,
    );
  }
  if (/<script\b/i.test(html)) {
    throw new ValidationError("`html` contains <script>");
  }

  // Validate total recipients
  const totalRecipients = to.length + (cc?.length || 0) + (bcc?.length || 0);
  if (totalRecipients > CONFIG.LIMITS.MAX_RECIPIENTS) {
    throw new ValidationError(
      `Too many recipients (max ${CONFIG.LIMITS.MAX_RECIPIENTS} total)`,
    );
  }
};

const validateEmailArray = (emails: unknown, fieldName: string): void => {
  if (!Array.isArray(emails)) {
    throw new ValidationError(`\`${fieldName}\` must be an array of strings`);
  }

  for (const email of emails) {
    if (typeof email !== "string" || !email.trim()) {
      throw new ValidationError(
        `\`${fieldName}\` must be an array of non-empty strings`,
      );
    }
  }
};
