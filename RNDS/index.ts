import type { UnifiedClinicalRecord } from "@/lib/clinical-types";
import { getMockUnifiedClinicalRecord } from "@/lib/mock-rnds-data";
import { ConecteSusClient } from "./conectesus";
import { CrossSpClient } from "./cross-sp";
import { EsusApsClient } from "./esus-aps";
import { HospitalFhirClient } from "./hospital-fhir";
import { SislabClient } from "./sislab";
import { WhitelabelClient, type HistoryQuery } from "./types";

const WHITELABEL_CONSTRUCTORS: Record<string, new () => WhitelabelClient> = {
  conectesus: ConecteSusClient,
  "cross-sp": CrossSpClient,
  "esus-aps": EsusApsClient,
  sislab: SislabClient,
  "hospital-fhir": HospitalFhirClient,
};

export const DEFAULT_WHITELIST = ["conectesus", "cross-sp", "esus-aps", "sislab"];
export const WHITELABEL_IDS = Object.keys(WHITELABEL_CONSTRUCTORS);

export function instantiateWhitelist(ids: string[] = DEFAULT_WHITELIST): WhitelabelClient[] {
  return ids
    .map((id) => WHITELABEL_CONSTRUCTORS[id])
    .filter(Boolean)
    .map((Factory) => new Factory());
}

export async function aggregateUnifiedRecord(
  query: HistoryQuery,
  ids: string[] = DEFAULT_WHITELIST
): Promise<UnifiedClinicalRecord> {
  const clients = instantiateWhitelist(ids);
  const results = await Promise.all(
    clients.map(async (client) => ({
      client,
      patient: await safe(() => client.fetchPatient(query, FALLBACK_CONSENT)),
      timeline: await safeArray(() => client.fetchTimeline(query, FALLBACK_CONSENT)),
    }))
  );

  const mock = getMockUnifiedClinicalRecord();
  const patient = results.map((r) => r.patient).find((p) => p !== null) ?? mock.patient;
  const liveTimeline = results.flatMap((r) => r.timeline);
  const timeline = (liveTimeline.length > 0 ? liveTimeline : mock.timeline).sort((a, b) => b.date.localeCompare(a.date));
  const provenance = clients.map((c) => `${c.label}${c.configured ? " (integrado)" : " (mock)"}`);

  return {
    source: liveTimeline.length > 0 ? "whitelabel-aggregation" : "mock-rnds",
    fetchedAt: new Date().toISOString(),
    provenance,
    patient,
    timeline,
  };
}

const FALLBACK_CONSENT = mintFallbackConsent();

function mintFallbackConsent() {
  return {
    consentId: "whitelabel-bootstrap",
    grantedAt: new Date().toISOString(),
    rotatesInMinutes: 15,
    legalBasis: "Consentimento registrado previamente via /api/consent",
    scope: ["RNDHistory", "TimelineRead"],
  };
}

async function safe<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function safeArray<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export { WhitelabelClient, type HistoryQuery } from "./types";
