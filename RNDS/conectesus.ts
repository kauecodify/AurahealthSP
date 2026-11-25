import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import type { PatientSnapshot, TimelineEntry } from "@/lib/clinical-types";
import { WhitelabelClient, type HistoryQuery, type WhitelabelConfig } from "./types";

type RndsPatientBundle = {
  entry?: Array<{ resource: { name?: Array<{ text?: string }>; birthDate?: string; gender?: string; telecom?: Array<{ value?: string }> } }>;
};

export class ConecteSusClient extends WhitelabelClient {
  readonly id = "conectesus";
  readonly label = "RNDS - Conecte SUS (FHIR R4)";
  readonly capabilities = ["patient.get", "encounter.list", "observation.list"];

  constructor(config: WhitelabelConfig = {}) {
    super({
      baseUrl: process.env.RNDS_CONECTESUS_BASE_URL,
      apiKey: process.env.RNDS_CONECTESUS_API_KEY,
      orgSlug: process.env.RNDS_CONECTESUS_ORG_SLUG,
      ...config,
    });
  }

  async fetchPatient(query: HistoryQuery): Promise<PatientSnapshot | null> {
    const bundle = await this.request<RndsPatientBundle>(`/patients?identifier=${encodeURIComponent(query.cns)}`, query);
    if (!bundle?.entry?.length) return getMockUnifiedClinicalRecord().patient;
    const resource = bundle.entry[0].resource;
    return {
      ...getMockUnifiedClinicalRecord().patient,
      nome: resource.name?.[0]?.text ?? "",
      dataNascimento: resource.birthDate ?? "",
    };
  }

  async fetchTimeline(query: HistoryQuery): Promise<TimelineEntry[]> {
    const encounter = await this.request<{ total?: number }>(`/encounters?patient=${encodeURIComponent(query.cns)}`, query);
    if (!encounter) return getMockUnifiedClinicalRecord().timeline.filter((e) => e.origem === "RNDS - Conecte SUS");
    return [];
  }
}
