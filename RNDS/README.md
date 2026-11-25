# RNDS - Camada Whitelabel de Integração

Camada de leitura não-destrutiva que consolida fontes clínicas externas em um histórico unificado. Cada adaptador é **whitelabel**: pode ser reutilizado por múltiplas instituições (clínicas, operadoras, consórcios intermunicipais) apenas trocando `baseUrl`, `apiKey` e `orgSlug` via variáveis de ambiente (ver `.env.example`).

Nenhum adaptador grava ou substitui o PEP local. Operação exclusivamente de leitura (`GET`), sempre acompanhada de `X-Consent-Id` para auditoria LGPD.

## Adaptadores disponíveis

| Adaptador | Arquivo | Fonte | Capacidades |
| --- | --- | --- | --- |
| `conectesus` | `conectesus.ts` | RNDS / Conecte SUS (FHIR R4) - Perfil Patient, Encounter, Observation | `patient.get`, `encounter.list`, `observation.list` |
| `cross-sp` | `cross-sp.ts` | CROSS - Central de Regulação de Ofertas de Serviços de Saúde do Estado de São Paulo | `regulation.list`, `referral.status` |
| `esus-aps` | `esus-aps.ts` | e-SUS APS (PEP ambulatorial público) | `fichas.list`, `problemas.list` |
| `sislab` | `sislab.ts` | SISLAB / rede laboratorial municipal | `observation.list`, `results.get` |
| `hospital-fhir` | `hospital-fhir.ts` | Sistemas de emergência e admissoes hospitalares (FHIR) - roadmap v2.2 | `emergency.timeline`, `admissions.list` |

## Uso

```ts
import { aggregateUnifiedRecord } from "@/RNDS";

const record = await aggregateUnifiedRecord({ cns, consentId });
```

Sem credenciais configuradas, cada adaptador cai em modo `mock` (dados sintéticos de `lib/mock-rnds-data.ts`), permitindo demonstração congelada para banca e treino de equipe. A agregação registra a proveniência de cada fonte integrada versus simulada.

## Validação

A integração com a RNDS (Conecte SUS) foi demonstrada com sucesso em **3 dias de desenvolvimento**, servindo como prova de viabilidade técnica e baixa complexidade de integração para o ecossistema SUS.
