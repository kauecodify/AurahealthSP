import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import type { PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";
import { WhitelabelClient, type HistoryQuery, type WhitelabelConfig } from "./types";

export class EsusApsClient extends WhitelabelClient {
  readonly id = "esus-aps";
  readonly label = "e-SUS APS (PEP Ambulatorial)";
  readonly capabilities = ["fichas.list", "problemas.list"];

  constructor(config: WhitelabelConfig = {}) {
    super({
      baseUrl: process.env.RNDS_ESUS_APS_BASE_URL,
      apiKey: process.env.RNDS_ESUS_APS_API_KEY,
      orgSlug: process.env.RNDS_ESUS_APS_ORG_SLUG,
      ...config,
    });
  }

  async fetchPatient(): Promise<PatientSnapshot | null> {
    return null;
  }

  async fetchTimeline(query: HistoryQuery): Promise<TimelineEntry[]> {
    const fichas = await this.request<{ fhir?: unknown }>(`/fhir/Encounter?subject=Patient/${encodeURIComponent(query.cns)}`, query);
    if (!fichas?.fhir) {
      return getMockUnifiedClinicalRecord().timeline.filter((e) => e.origem === "e-SUS APS");
    }
    return [];
  }
}
