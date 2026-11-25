import type { ConsentAudit, PatientSnapshot, TimelineEntry, UnifiedClinicalRecord } from "./clinical-types";

export function mintMockConsentAudit(): ConsentAudit {
  return {
    ...MOCK_CONSENT_AUDIT,
    consentId: `cons-lgpd-${crypto.randomUUID().slice(0, 8)}`,
    grantedAt: new Date().toISOString(),
  };
}

export const MOCK_CONSENT_AUDIT: ConsentAudit = {
  consentId: "cons-lgpd-0001",
  grantedAt: "",
  rotatesInMinutes: 15,
  legalBasis: "Art. 7º, I e Art. 11, I da LGPD - consentimento do titular",
  scope: ["RNDHistory", "TimelineRead", "RoiMetrics"],
};

const PATIENT: PatientSnapshot = {
  nome: "Maria Aparecida dos Santos",
  cns: "245000000000003",
  dataNascimento: "1958-03-14",
  idade: 66,
  sexo: "Feminino",
  municipio: "São Paulo",
  uf: "SP",
  alergias: [
    { substance: "Penicilina", severity: "grave", reaction: "Choque anafilático registrado em 2019" },
    { substance: "Dipirona", severity: "moderada", reaction: "Urticária generalizada" },
  ],
  condicoesCronicas: [
    "Diabetes Mellitus Tipo 2 (CID-10 E11)",
    "Hipertensão Arterial Sistêmica (CID-10 I10)",
  ],
};

const TIMELINE: TimelineEntry[] = [
  {
    id: "tl-2024-11-12-ubs",
    date: "2024-11-12",
    kind: "consulta",
    origem: "RNDS - Conecte SUS",
    estabelecimento: "UBS Jardim São Luiz",
    procedimento: "Consulta Clínica Médica",
    cid: "I10",
    profissional: "CRM 123456 - Clínica Médica",
    resumo: "Pressão arterial 148/92 mmHg. Ajuste de anti-hipertensivo mantido. Retorno agendado.",
    duplicidadeEvitada: false,
    minutosEconomizados: 6,
  },
  {
    id: "tl-2024-10-28-lab",
    date: "2024-10-28",
    kind: "exame",
    origem: "SISLAB - Rede Laboratorial",
    estabelecimento: "Laboratório Municipal - Círculo Militar",
    procedimento: "Hemoglobina Glicada (HbA1c)",
    cid: "E11",
    resumo: "HbA1c 8,2% - metabólicamente descompensada. Fato relevado antes de nova solicitação.",
    duplicidadeEvitada: true,
    minutosEconomizados: 6,
  },
  {
    id: "tl-2024-09-05-cross",
    date: "2024-09-05",
    kind: "regulacao",
    origem: "CROSS - Regulação Estadual SP",
    estabelecimento: "Ambulatório de Especialidades - Região Norte",
    procedimento: "Consulta Cardiológica autorizada (Protocolo Regulação SES-SP)",
    cid: "I10",
    profissional: "Regulação Estadual - AG II",
    resumo:
      "Regulação efetivada pelo Estado de São Paulo. Eletrocardiograma de repouso sem alterações isquêmicas.",
    duplicidadeEvitada: false,
    minutosEconomizados: 2,
  },
];

export function getMockUnifiedClinicalRecord(): UnifiedClinicalRecord {
  return {
    source: "mock-rnds",
    fetchedAt: new Date().toISOString(),
    provenance: [
      "RNDS/Conecte SUS (FHIR R4) - Perfil Patient e Encounter",
      "CROSS - Regulação Estadual SP (agregação institucional)",
      "SISLAB - Rede Laboratorial (Observation)",
    ],
    patient: PATIENT,
    timeline: [...TIMELINE].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export const ROI_BASELINE_MINUTES_PER_SESSION = 14;
export const DUPLICATED_EXAMS_AVOIDED_BASELINE = 1;
