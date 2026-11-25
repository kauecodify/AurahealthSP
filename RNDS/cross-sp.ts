import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import type { PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";
import { WhitelabelClient, type HistoryQuery, type WhitelabelConfig } from "./types";

export class CrossSpClient extends WhitelabelClient {
  readonly id = "cross-sp";
  readonly label = "CROSS - Regulação Estadual SP";
  readonly capabilities = ["regulation.list", "referral.status"];

  constructor(config: WhitelabelConfig = {}) {
    super({
      baseUrl: process.env.RNDS_CROSS_SP_BASE_URL,
      apiKey: process.env.RNDS_CROSS_SP_API_KEY,
      orgSlug: process.env.RNDS_CROSS_SP_ORG_SLUG,
      ...config,
    });
  }

  async fetchPatient(): Promise<PatientSnapshot | null> {
    return null;
  }

  async fetchTimeline(query: HistoryQuery): Promise<TimelineEntry[]> {
    const regulations = await this.request<{ data?: unknown[] }>(
      `/regulacoes?cns=${encodeURIComponent(query.cns)}`,
      query
    );
    if (!regulations?.data) {
      return getMockUnifiedClinicalRecord().timeline.filter((e) => e.origem === "CROSS - Regulação Estadual SP");
    }
    return regulations.data.map((_, index): TimelineEntry => getMockUnifiedClinicalRecord().timeline[index]).filter(Boolean);
  }
}
