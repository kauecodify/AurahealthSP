export type TimelineOrigin =
  | "RNDS - Conecte SUS"
  | "CROSS - Regulação Estadual SP"
  | "e-SUS APS"
  | "SISLAB - Rede Laboratorial"
  | "Hospital FHIR";

export type TimelineKind = "consulta" | "exame" | "regulacao";

export interface Allergy {
  substance: string;
  severity: "grave" | "moderada" | "leve";
  reaction?: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  kind: TimelineKind;
  origem: TimelineOrigin;
  estabelecimento: string;
  procedimento: string;
  cid?: string;
  profissional?: string;
  resumo: string;
  duplicidadeEvitada?: boolean;
  minutosEconomizados?: number;
}

export interface PatientSnapshot {
  nome: string;
  cns: string;
  dataNascimento: string;
  idade: number;
  sexo: string;
  municipio: string;
  uf: string;
  alergias: Allergy[];
  condicoesCronicas: string[];
}

export interface ConsentAudit {
  consentId: string;
  grantedAt: string;
  rotatesInMinutes: number;
  legalBasis: string;
  scope: string[];
}

export interface UnifiedClinicalRecord {
  source: "mock-rnds" | "whitelabel-aggregation";
  fetchedAt: string;
  provenance: string[];
  patient: PatientSnapshot;
  timeline: TimelineEntry[];
}

export interface HistoryRequest {
  cns: string;
  consentId: string;
}
