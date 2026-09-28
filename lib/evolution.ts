import "server-only";

type SendReportMessage = {
  phone: string;
  clientName: string;
  projectName: string;
  reportTitle: string;
  reportUrl: string;
  projectUrl: string;
  locale: "en" | "fr";
};

export async function sendReportMessage(input: SendReportMessage) {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey || !instance) {
    throw new Error("Evolution API is not configured");
  }

  const text = input.locale === "fr"
    ? `Bonjour ${input.clientName}, un nouveau rapport « ${input.reportTitle} » est disponible pour ${input.projectName}.\n\nConsulter le rapport : ${input.reportUrl}\nOuvrir le projet : ${input.projectUrl}`
    : `Hello ${input.clientName}, a new report “${input.reportTitle}” is available for ${input.projectName}.\n\nRead the report: ${input.reportUrl}\nOpen the project: ${input.projectUrl}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: input.phone, text }),
  });

  if (!response.ok) {
    // Surface the server's own explanation: a wrong EVOLUTION_INSTANCE reads as a
    // bare 404 otherwise, which says nothing in the delivery log.
    const detail = await response.text().catch(() => "");
    const message = detail.slice(0, 200).replace(/\s+/g, " ").trim();
    throw new Error(`Evolution API request failed (${response.status})${message ? `: ${message}` : ""}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}
