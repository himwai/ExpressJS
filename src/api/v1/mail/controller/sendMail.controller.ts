import { Request, Response } from "express";
import crypto from "crypto";
import type { SendMailRequest, SendMailResponse } from "../types/typeSendMail";
import { validateSendMailRequest } from "../middleware/validation.middleware";
import { SendMailService } from "../services/sendMail.service";
import { CONFIG } from "../config/constants";
import { ValidationError, GraphApiError } from "../middleware/error.middleware";

export const sendMailController = async (
  req: Request<{}, SendMailResponse, SendMailRequest>,
  res: Response<SendMailResponse>,
) => {
  try {
    // Validate request body
    validateSendMailRequest(req.body);

    const { metaData, dataContent } = req.body;

    // Normalize email lists
    const to = normalizeEmailList(dataContent.to);
    const cc = normalizeEmailList(dataContent.cc || []);
    const bcc = normalizeEmailList(dataContent.bcc || []);
    const replyTo = normalizeEmailList(dataContent.replyTo || []);

    const subject = dataContent.subject.trim();
    const html = dataContent.html.trim();

    // Create service instance
    const sendMailService = new SendMailService();

    // Get Graph API access token
    const accessToken = await sendMailService.getGraphToken(
      metaData.graphTenantId,
      metaData.graphClientId,
      metaData.graphClientSecret,
    );

    // Send email via Microsoft Graph
    await sendMailService.sendMail(
      accessToken,
      metaData.senderUpn,
      to,
      cc,
      bcc,
      replyTo,
      subject,
      html,
    );

    // Generate request ID for tracking
    const requestId = crypto.randomUUID();

    res.status(200).json({
      resultType: "SUCCESS",
      resultMessage: "Email sent successfully",
      dataContent: {
        accepted: true,
        requestId,
      },
      metaData: CONFIG.META_DATA,
    });
  } catch (error) {
    console.error("Error processing send mail request:", error);

    if (error instanceof ValidationError) {
      res.status(400).json({
        resultType: "ERROR",
        resultMessage: "Validation Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    if (error instanceof GraphApiError) {
      res.status(error.statusCode || 502).json({
        resultType: "ERROR",
        resultMessage: "Graph API Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    res.status(500).json({
      resultType: "ERROR",
      resultMessage: "Internal Server Error: " + (error as Error).message,
      metaData: CONFIG.META_DATA,
    });
  }
};

function normalizeEmailList(value: string[]): string[] {
  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") {
      const s = v.trim();
      if (s) out.push(s);
    }
  }
  return out;
}
