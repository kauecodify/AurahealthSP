import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import type { PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";
import { WhitelabelClient, type HistoryQuery, type WhitelabelConfig } from "./types";

export class SislabClient extends WhitelabelClient {
  readonly id = "sislab";
  readonly label = "SISLAB - Rede Laboratorial";
  readonly capabilities = ["observation.list", "results.get"];

  constructor(config: WhitelabelConfig = {}) {
    super({
      baseUrl: process.env.RNDS_SISLAB_BASE_URL,
      apiKey: process.env.RNDS_SISLAB_API_KEY,
      orgSlug: process.env.RNDS_SISLAB_ORG_SLUG,
      ...config,
    });
  }

  async fetchPatient(): Promise<PatientSnapshot | null> {
    return null;
  }

  async fetchTimeline(query: HistoryQuery): Promise<TimelineEntry[]> {
    const results = await this.request<{ data?: unknown[] }>(`/results?cns=${encodeURIComponent(query.cns)}`, query);
    if (!results?.data) {
      return getMockUnifiedClinicalRecord().timeline.filter((e) => e.origem === "SISLAB - Rede Laboratorial");
    }
    return [];
  }
}
