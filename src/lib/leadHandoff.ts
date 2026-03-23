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
  mode: "webhook" | "noop";
  delivered: boolean;
  detail: string;
};

const WEBHOOK_TIMEOUT_MS = 6000;

async function postWebhook(payload: LeadPayload, meta: LeadMeta): Promise<LeadHandoffResult> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      mode: "noop",
      delivered: false,
      detail: "LEAD_WEBHOOK_URL ist nicht gesetzt. Lead wurde serverseitig validiert, aber nicht extern zugestellt.",
    };
  }

  const token = process.env.LEAD_WEBHOOK_TOKEN;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ payload, meta }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        mode: "webhook",
        delivered: false,
        detail: `Webhook antwortete mit HTTP ${response.status}`,
      };
    }

    return {
      mode: "webhook",
      delivered: true,
      detail: "Lead wurde erfolgreich an den Webhook übergeben.",
    };
  } catch (error) {
    return {
      mode: "webhook",
      delivered: false,
      detail: error instanceof Error ? error.message : "Webhook-Fehler",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function handoffLead(payload: LeadPayload, meta: LeadMeta): Promise<LeadHandoffResult> {
  return postWebhook(payload, meta);
}
