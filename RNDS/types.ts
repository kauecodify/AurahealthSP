import type { ConsentAudit, PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";

export interface WhitelabelConfig {
  baseUrl?: string;
  apiKey?: string;
  orgSlug?: string;
  timeoutMs?: number;
}

export interface HistoryQuery {
  cns: string;
  consentId: string;
}

export interface WhitelabelClientContract {
  readonly id: string;
  readonly label: string;
  readonly capabilities: readonly string[];
  readonly configured: boolean;
  fetchPatient(query: HistoryQuery, consent: ConsentAudit): Promise<PatientSnapshot | null>;
  fetchTimeline(query: HistoryQuery, consent: ConsentAudit): Promise<TimelineEntry[]>;
}

export abstract class WhitelabelClient implements WhitelabelClientContract {
  abstract readonly id: string;
  abstract readonly label: string;
  abstract readonly capabilities: readonly string[];

  protected constructor(protected readonly config: WhitelabelConfig) {}

  get configured(): boolean {
    return Boolean(this.config.baseUrl && this.config.apiKey);
  }

  abstract fetchPatient(query: HistoryQuery, consent: ConsentAudit): Promise<PatientSnapshot | null>;
  abstract fetchTimeline(query: HistoryQuery, consent: ConsentAudit): Promise<TimelineEntry[]>;

  protected async request<T>(path: string, query: HistoryQuery): Promise<T | null> {
    if (!this.configured) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 8000);
    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "X-Org-Slug": this.config.orgSlug ?? "",
          "X-Consent-Id": query.consentId,
          Accept: "application/fhir+json",
        },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
