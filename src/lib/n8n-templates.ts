// Echte, in n8n importierbare Workflow-Definitionen (Menü → Import from File).
// Tokens/Channels sind Platzhalter und werden in n8n über Credentials gesetzt.

export interface N8nNode {
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
}

export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main: { node: string; type: string; index: number }[][] }>;
}

const API = "https://erechnung.sbsdeutschland.com/api/app";

const emailInbox: N8nWorkflow = {
  name: "FlowCheck - E-Mail Inbox Monitor",
  nodes: [
    {
      name: "IMAP Trigger",
      type: "n8n-nodes-base.imapTrigger",
      typeVersion: 1,
      position: [240, 300],
      parameters: { mailbox: "INBOX", options: { unseen: true } },
    },
    {
      name: "Filter PDF",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        conditions: {
          boolean: [{ value1: "={{ $json.attachments.length > 0 }}", value2: true }],
        },
      },
    },
    {
      name: "Upload zu FlowCheck",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: `${API}/upload`,
        sendBody: true,
        contentType: "multipart-form-data",
        bodyParameters: {
          parameters: [{ name: "file", value: "={{ $binary.attachment_0 }}" }],
        },
        options: {
          headers: [{ name: "Authorization", value: "Bearer YOUR_TOKEN" }],
        },
      },
    },
  ],
  connections: {
    "IMAP Trigger": { main: [[{ node: "Filter PDF", type: "main", index: 0 }]] },
    "Filter PDF": { main: [[{ node: "Upload zu FlowCheck", type: "main", index: 0 }]] },
  },
};

const slackNotification: N8nWorkflow = {
  name: "FlowCheck - Slack Benachrichtigung",
  nodes: [
    {
      name: "FlowCheck Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: { httpMethod: "POST", path: "flowcheck-invoice" },
    },
    {
      name: "Format Nachricht",
      type: "n8n-nodes-base.set",
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        values: {
          string: [
            {
              name: "message",
              value: "=📄 Neue Rechnung: {{ $json.data.rechnungsnummer }} von {{ $json.data.lieferant }} über {{ $json.data.betrag }}€",
            },
          ],
        },
      },
    },
    {
      name: "Slack",
      type: "n8n-nodes-base.slack",
      typeVersion: 2,
      position: [680, 300],
      parameters: { channel: "#rechnungen", text: "={{ $json.message }}" },
    },
  ],
  connections: {
    "FlowCheck Webhook": { main: [[{ node: "Format Nachricht", type: "main", index: 0 }]] },
    "Format Nachricht": { main: [[{ node: "Slack", type: "main", index: 0 }]] },
  },
};

const weeklyReport: N8nWorkflow = {
  name: "FlowCheck - Wöchentlicher Report",
  nodes: [
    {
      name: "Cron Montag 09:00",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        rule: { interval: [{ field: "cronExpression", expression: "0 9 * * 1" }] },
      },
    },
    {
      name: "KPIs abrufen",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [460, 300],
      parameters: {
        method: "GET",
        url: `${API}/dashboard/kpis`,
        options: { headers: [{ name: "Authorization", value: "Bearer YOUR_TOKEN" }] },
      },
    },
    {
      name: "HTML-Report",
      type: "n8n-nodes-base.set",
      typeVersion: 2,
      position: [680, 300],
      parameters: {
        values: {
          string: [
            {
              name: "html",
              value: "=<h2>FlowCheck Wochenbericht</h2><p>Verarbeitet: {{ $json.rechnungen_monat }} · Offene Freigaben: {{ $json.offene_freigaben }}</p>",
            },
          ],
        },
      },
    },
    {
      name: "E-Mail senden",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2,
      position: [900, 300],
      parameters: {
        subject: "FlowCheck — Ihr Wochenbericht",
        toEmail: "buchhaltung@example.com",
        html: "={{ $json.html }}",
      },
    },
  ],
  connections: {
    "Cron Montag 09:00": { main: [[{ node: "KPIs abrufen", type: "main", index: 0 }]] },
    "KPIs abrufen": { main: [[{ node: "HTML-Report", type: "main", index: 0 }]] },
    "HTML-Report": { main: [[{ node: "E-Mail senden", type: "main", index: 0 }]] },
  },
};

const autoDatev: N8nWorkflow = {
  name: "FlowCheck - Auto-DATEV-Export",
  nodes: [
    {
      name: "FlowCheck Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: { httpMethod: "POST", path: "flowcheck-approved" },
    },
    {
      name: "Batch voll?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        conditions: {
          number: [{ value1: "={{ $json.data.pending_approved }}", operation: "largerEqual", value2: 5 }],
        },
      },
    },
    {
      name: "DATEV-Export",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: `${API}/datev/export`,
        options: { headers: [{ name: "Authorization", value: "Bearer YOUR_TOKEN" }] },
      },
    },
    {
      name: "CSV an Steuerberater",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2,
      position: [900, 300],
      parameters: {
        subject: "Neuer DATEV-Buchungsstapel",
        toEmail: "steuerberater@example.com",
        text: "Im Anhang der aktuelle DATEV-Export aus FlowCheck.",
        attachments: "data",
      },
    },
  ],
  connections: {
    "FlowCheck Webhook": { main: [[{ node: "Batch voll?", type: "main", index: 0 }]] },
    "Batch voll?": { main: [[{ node: "DATEV-Export", type: "main", index: 0 }]] },
    "DATEV-Export": { main: [[{ node: "CSV an Steuerberater", type: "main", index: 0 }]] },
  },
};

export const n8nTemplates = { emailInbox, slackNotification, weeklyReport, autoDatev };

export type TemplateKey = keyof typeof n8nTemplates;

export interface TemplateMeta {
  key: TemplateKey;
  icon: string;
  title: string;
  desc: string;
  steps: string[];
  filename: string;
}

export const TEMPLATE_META: TemplateMeta[] = [
  {
    key: "emailInbox",
    icon: "📧",
    title: "E-Mail Inbox → FlowCheck",
    desc: "Rechnungen automatisch aus Ihrem E-Mail-Postfach importieren.",
    steps: ["IMAP (alle 5 Min)", "PDF-Anhänge filtern", "An FlowCheck hochladen"],
    filename: "flowcheck-email-inbox.json",
  },
  {
    key: "slackNotification",
    icon: "📢",
    title: "FlowCheck → Slack",
    desc: "Bei neuen Rechnungen eine Slack-Nachricht senden.",
    steps: ["FlowCheck Webhook", "Nachricht formatieren", "An Slack-Channel"],
    filename: "flowcheck-slack.json",
  },
  {
    key: "weeklyReport",
    icon: "📊",
    title: "Wöchentlicher Report → E-Mail",
    desc: "Jeden Montag automatisch einen Wochenbericht per E-Mail erhalten.",
    steps: ["Cron (Mo 09:00)", "KPIs abrufen", "HTML-Report", "E-Mail senden"],
    filename: "flowcheck-weekly-report.json",
  },
  {
    key: "autoDatev",
    icon: "🏦",
    title: "Auto-DATEV-Export",
    desc: "Freigegebene Rechnungen automatisch als DATEV exportieren.",
    steps: ["Webhook (approved)", "Batch > 5?", "DATEV-Export", "CSV an Steuerberater"],
    filename: "flowcheck-auto-datev.json",
  },
];
