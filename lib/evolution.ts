import "server-only";

type SendReportMessage = {
  phone: string;
  clientName: string;
  projectName: string;
  reportTitle: string;
  reportBody: string;
  reportUrl: string;
  projectUrl: string;
  locale: "en" | "fr";
};

type EvolutionConfig = { baseUrl: string; apiKey: string; instance: string };

// Kept as one string so the delivery log, the test action and lib/translations.ts
// all carry the same wording.
export const NOT_ON_WHATSAPP = "This number has no WhatsApp account.";

function evolutionConfig(): EvolutionConfig {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey || !instance) {
    throw new Error("Evolution API is not configured");
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey, instance };
}

function endpoint(config: EvolutionConfig, path: string) {
  return `${config.baseUrl}/${path}/${encodeURIComponent(config.instance)}`;
}

// Evolution answers an unregistered recipient with a 400 whose body lists
// {exists:false} per number. Recognise that shape so the log says what a manager
// can act on instead of a raw payload.
function unregisteredRecipient(detail: string) {
  try {
    const entries = JSON.parse(detail)?.response?.message;
    return Array.isArray(entries) && entries.length > 0
      && entries.every((entry: unknown) => !!entry && typeof entry === "object" && (entry as { exists?: unknown }).exists === false);
  } catch {
    return false;
  }
}

async function requestFailed(response: Response) {
  // Surface the server's own explanation: a wrong EVOLUTION_INSTANCE reads as a
  // bare 404 otherwise, which says nothing in the delivery log.
  const detail = await response.text().catch(() => "");
  if (unregisteredRecipient(detail)) return new Error(NOT_ON_WHATSAPP);
  const message = detail.slice(0, 200).replace(/\s+/g, " ").trim();
  return new Error(`Evolution API request failed (${response.status})${message ? `: ${message}` : ""}`);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

// Cameroon prefixed every mobile number with a 6 in 2014. An account registered
// before that keeps its eight-digit jid for good, so a number stored in today's
// nine-digit form has no WhatsApp account while its older form does — and the
// reverse for a number copied off an old record. Offer both and let WhatsApp say
// which one it knows.
function phoneVariants(phone: string) {
  const compact = digits(phone);
  if (/^2376\d{8}$/.test(compact)) return [phone, `+237${compact.slice(4)}`];
  if (/^237\d{8}$/.test(compact)) return [phone, `+2376${compact.slice(3)}`];
  return [phone];
}

export type Recipient =
  | { status: "ok"; number: string }       // WhatsApp knows this form of the number
  | { status: "none" }                     // WhatsApp knows no form of it
  | { status: "unknown" };                 // the lookup itself did not answer

async function resolveRecipient(config: EvolutionConfig, phone: string): Promise<Recipient> {
  const variants = phoneVariants(phone);

  try {
    const response = await fetch(endpoint(config, "chat/whatsappNumbers"), {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.apiKey },
      body: JSON.stringify({ numbers: variants }),
    });

    if (!response.ok) return { status: "unknown" };
    const rows = await response.json() as Array<{ exists?: boolean; number?: string; jid?: string }>;
    if (!Array.isArray(rows) || rows.length === 0) return { status: "unknown" };

    // Match on the echoed number rather than on position: the response order is
    // not documented, and the stored form must win when both are registered.
    const registered = new Set(rows.filter(row => row?.exists === true).map(row => digits(String(row.number || row.jid || ""))));
    const match = variants.find(variant => registered.has(digits(variant)));
    return match ? { status: "ok", number: match } : { status: "none" };
  } catch {
    return { status: "unknown" };
  }
}

// For the People forms: catch a number WhatsApp does not know while someone is
// still looking at the field, instead of at publish time when a client silently
// hears nothing. An unconfigured or unreachable Evolution must not block saving,
// so both answer "unknown".
export async function whatsappRecipient(phone: string): Promise<Recipient> {
  let config: EvolutionConfig;
  try {
    config = evolutionConfig();
  } catch {
    return { status: "unknown" };
  }
  return resolveRecipient(config, phone);
}

export async function sendReportMessage(input: SendReportMessage) {
  const config = evolutionConfig();

  // Ask before sending: one lookup both names the cause up front and picks the
  // form of the number WhatsApp actually holds. An unavailable lookup must not
  // block the send — requestFailed still catches the 400 below.
  const recipient = await resolveRecipient(config, input.phone);
  if (recipient.status === "none") throw new Error(NOT_ON_WHATSAPP);
  const number = recipient.status === "ok" ? recipient.number : input.phone;

  const text = input.locale === "fr"
    ? `Bonjour ${input.clientName}, un nouveau rapport « ${input.reportTitle} » est disponible pour ${input.projectName}.\n\n${input.reportBody}\n\nVoir en ligne : ${input.reportUrl}`
    : `Hello ${input.clientName}, a new report “${input.reportTitle}” is available for ${input.projectName}.\n\n${input.reportBody}\n\nView online: ${input.reportUrl}`;

  const response = await fetch(endpoint(config, "message/sendText"), {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: config.apiKey },
    body: JSON.stringify({ number, text }),
  });

  if (!response.ok) {
    throw await requestFailed(response);
  }

  return response.json() as Promise<Record<string, unknown>>;
}
