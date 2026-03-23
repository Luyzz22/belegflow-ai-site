export type LeadPayload = {
  name: string;
  company: string;
  business_email: string;
  role: string;
  company_size: string;
  monthly_invoice_volume: string;
  interest: string;
  message: string;
  datev_context?: boolean;
  erp_context?: string;
  contact_reason: "demo" | "kontakt" | "unterlagen" | "api";
  consent_contact: boolean;
  website?: string; // honeypot
};

export type LeadMeta = {
  lead_id: string;
  received_at: string;
  source_path?: string;
  user_agent?: string;
  ip_hash?: string;
};

export type LeadHandoffResult = {
  mode: "webhook" | "multi_adapter" | "noop";
  delivered: boolean;
  detail: string;
  destinations: Array<{
    channel: "webhook" | "hubspot" | "pipedrive" | "notification_email";
    status: "delivered" | "skipped" | "failed";
    detail: string;
  }>;
};

type AdapterChannel = LeadHandoffResult["destinations"][number]["channel"];

const WEBHOOK_TIMEOUT_MS = 6000;

async function postWithTimeout(url: string, body: unknown, token?: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function runWebhookAdapter(payload: LeadPayload, meta: LeadMeta) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      channel: "webhook" as AdapterChannel,
      status: "skipped" as const,
      detail: "LEAD_WEBHOOK_URL nicht gesetzt.",
    };
  }

  try {
    const response = await postWithTimeout(
      webhookUrl,
      {
        payload,
        meta,
        source: "belegflow-ai-site",
      },
      process.env.LEAD_WEBHOOK_TOKEN,
    );

    if (!response.ok) {
      return {
        channel: "webhook" as AdapterChannel,
        status: "failed" as const,
        detail: `Webhook HTTP ${response.status}`,
      };
    }

    return {
      channel: "webhook" as AdapterChannel,
      status: "delivered" as const,
      detail: "Webhook erfolgreich zugestellt.",
    };
  } catch (error) {
    return {
      channel: "webhook" as AdapterChannel,
      status: "failed" as const,
      detail: error instanceof Error ? error.message : "Webhook-Fehler",
    };
  }
}

function preparedAdapter(channel: AdapterChannel, envFlag: string) {
  const configured = process.env[envFlag];
  return {
    channel,
    status: "skipped" as const,
    detail: configured
      ? `${channel}-Adapter vorbereitet, aber nicht aktiviert (Claim nur nach technischer Bestätigung veröffentlichen).`
      : `${channel}-Adapter nicht konfiguriert.`,
  };
}

export async function handoffLead(payload: LeadPayload, meta: LeadMeta): Promise<LeadHandoffResult> {
  const destinations = [
    await runWebhookAdapter(payload, meta),
    preparedAdapter("hubspot", "LEAD_HUBSPOT_ENABLED"),
    preparedAdapter("pipedrive", "LEAD_PIPEDRIVE_ENABLED"),
    preparedAdapter("notification_email", "LEAD_NOTIFICATION_EMAIL"),
  ];

  const delivered = destinations.some((item) => item.status === "delivered");
  const failedWebhook = destinations.some((item) => item.channel === "webhook" && item.status === "failed");

  if (failedWebhook) {
    return {
      mode: "webhook",
      delivered: false,
      detail: "Lead validiert, aber Webhook-Übergabe fehlgeschlagen.",
      destinations,
    };
  }

  if (delivered) {
    return {
      mode: "multi_adapter",
      delivered: true,
      detail: "Lead erfolgreich zugestellt.",
      destinations,
    };
  }

  return {
    mode: "noop",
    delivered: false,
    detail: "Lead validiert. Keine aktive externe Zustellung konfiguriert.",
    destinations,
  };
}
