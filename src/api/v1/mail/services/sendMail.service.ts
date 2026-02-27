import axios, { isAxiosError } from "axios";
import crypto from "crypto";
import { CONFIG } from "../config/constants";
import { GraphApiError } from "../middleware/error.middleware";
import {
  GraphTokenResponse,
  GraphSendMailRequest,
  GraphRecipient,
} from "../types/typeSendMail";

interface GraphTokenCache {
  token: string | null;
  exp: number;
}

let graphTokenCache: GraphTokenCache = { token: null, exp: 0 };

export class SendMailService {
  private timeout: number;

  constructor(timeout: number = CONFIG.TIMEOUTS.REQUEST) {
    this.timeout = timeout;
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof GraphApiError) {
      throw error;
    }

    if (isAxiosError(error)) {
      if (error.response) {
        throw new GraphApiError(
          `${context} failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`,
          error.response.status,
        );
      }
      throw new GraphApiError(
        `Network error during ${context}: ${error.message}`,
      );
    }
    throw new GraphApiError(`Unknown error occurred during ${context}`);
  }

  async getGraphToken(
    tenantId: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // Return cached token if still valid (with 60s buffer)
    if (graphTokenCache.token && graphTokenCache.exp - now > 60) {
      return graphTokenCache.token;
    }

    try {
      const tokenUrl = `${CONFIG.GRAPH.TOKEN_URL}/${tenantId}/oauth2/v2.0/token`;
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: CONFIG.GRAPH.SCOPE,
      });

      const response = await axios.post<GraphTokenResponse>(
        tokenUrl,
        body.toString(),
        {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          timeout: this.timeout,
        },
      );

      const expiresIn = Number(response.data.expires_in) || 0;
      graphTokenCache = {
        token: response.data.access_token,
        exp: now + expiresIn,
      };

      return response.data.access_token;
    } catch (error) {
      this.handleError(error, "Get Graph token");
    }
  }

  async sendMail(
    accessToken: string,
    senderUpn: string,
    to: string[],
    cc: string[],
    bcc: string[],
    replyTo: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const message: GraphSendMailRequest = {
        message: {
          subject,
          body: {
            contentType: "HTML",
            content: html,
          },
          toRecipients: this.toRecipients(to),
          ...(cc.length > 0 ? { ccRecipients: this.toRecipients(cc) } : {}),
          ...(bcc.length > 0 ? { bccRecipients: this.toRecipients(bcc) } : {}),
          ...(replyTo.length > 0
            ? { replyTo: this.toRecipients(replyTo) }
            : {}),
        },
        saveToSentItems: true,
      };

      const url = `${CONFIG.GRAPH.API_URL}/users/${encodeURIComponent(senderUpn)}/sendMail`;

      const response = await axios.post(url, message, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "client-request-id": crypto.randomUUID(),
          "return-client-request-id": "true",
        },
        timeout: this.timeout,
      });

      // Graph API returns 202 Accepted for successful email send
      if (response.status !== 202) {
        throw new GraphApiError(
          `Graph sendMail returned unexpected status ${response.status}: ${JSON.stringify(response.data)}`,
          response.status,
        );
      }
    } catch (error) {
      this.handleError(error, "Send mail via Graph");
    }
  }

  private toRecipients(addresses: string[]): GraphRecipient[] {
    return addresses.map((address) => ({
      emailAddress: { address: address.trim() },
    }));
  }
}
