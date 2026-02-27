const VERSION = "1.0";

export const CONFIG = {
  GRAPH: {
    TOKEN_URL: "https://login.microsoftonline.com",
    API_URL: "https://graph.microsoft.com/v1.0",
    SCOPE: "https://graph.microsoft.com/.default",
  },
  LIMITS: {
    MAX_RECIPIENTS: 100,
    MAX_SUBJECT_LENGTH: 255,
    MAX_HTML_LENGTH: 200000,
  },
  TIMEOUTS: {
    REQUEST: 30000,
  },
  VERSION: VERSION,
  META_DATA: { version: VERSION } as const,
} as const;
