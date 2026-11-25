import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import type { PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";
import { WhitelabelClient, type HistoryQuery, type WhitelabelConfig } from "./types";

export class HospitalFhirClient extends WhitelabelClient {
  readonly id = "hospital-fhir";
  readonly label = "Hospital FHIR / Sistemas de Emergência";
  readonly capabilities = ["emergency.timeline", "admissions.list"];

  constructor(config: WhitelabelConfig = {}) {
    super({
      baseUrl: process.env.RNDS_HOSPITAL_FHIR_BASE_URL,
      apiKey: process.env.RNDS_HOSPITAL_FHIR_API_KEY,
      orgSlug: process.env.RNDS_HOSPITAL_FHIR_ORG_SLUG,
      ...config,
    });
  }

  async fetchPatient(): Promise<PatientSnapshot | null> {
    return null;
  }

  async fetchTimeline(query: HistoryQuery): Promise<TimelineEntry[]> {
    const admissions = await this.request<{ data?: unknown[] }>(`/emergency/admissions?cns=${encodeURIComponent(query.cns)}`, query);
    if (!admissions?.data) {
      return getMockUnifiedClinicalRecord().timeline.filter((e) => e.origem === "Hospital FHIR");
    }
    return [];
  }
}
