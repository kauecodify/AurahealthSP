# AuraHealthSP

> **Camada de leitura não-destrutiva sobre o PEP legado — histórico clínico unificado via RNDS/CROSS, com compliance LGPD e foco em eficiência operacional institucional.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![LGPD](https://img.shields.io/badge/Compliance-LGPD%20%7C%20RNDS%20%7C%20CFM%202.217%2F2018-orange.svg)](#compliance-e-%C3%A9tica)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

🎬 **[VER DEMONSTRAÇÃO EM VÍDEO DO FLUXO - 1 MIN]** *(placeholder — substituir pelo link do Loom/YouTube antes da banca)*

---

## O que é

O AuraHealthSP **não substitui** o Prontuário Eletrônico do Paciente (PEP) nem o CROSS. Ele funciona como uma **camada de visualização unificada em modo leitura** sobre esses sistemas: mediante consentimento do paciente, agrega em uma única linha do tempo o que já existe sobre aquela pessoa — consultas, exames e regulações — sem tocar no PEP local.

O médico continua trabalhando no sistema que já usa. O AuraHealthSP reduz o retrabalho de anamnese e evita exames duplicados, e **essa eficiência operacional é a métrica de valor mensurável** que justifica o fee SaaS pago pela instituição.

> **Prova técnica de viabilidade:** a integração com as APIs da **RNDS (Conecte SUS)** foi demonstrada com sucesso em **3 dias de desenvolvimento** — baixa complexidade de integração ao ecossistema SUS.

---

## Demonstração (MVP v2.1 - Semana 4)

Fluxo defensável para banca de venture building:

1. **Busca por CNS** com validação oficial do check digit (15 dígitos, prefixos 1/2/7/8/9).
2. **Modal de Consentimento LGPD** obrigatório antes da primeira busca — simula o fluxo de autorização do titular (Arts. 7º e 11, LGPD).
3. **Consulta à API RNDS** via módulo whitelabel (`RNDS/`) — em modo mock para demo congelada, ou real (FHIR R4) quando configurado.
4. **Dashboard unificado**: dados demográficos + alertas de alergia (esquerda) e linha do tempo RNDS/CROSS (direita), preservando a interface do PEP original.
5. **Widget de ROI Operacional** fixo no topo: "Tempo médio economizado nesta sessão" e "Exames duplicados evitados".

Header do dashboard: **"Modo de Visualização Unificada - Leitura via RNDS/CROSS - Operação não-destrutiva ao PEP local"**.

Paciente mockado realista: `Maria Aparecida dos Santos` (CNS `245.0000.0000.0003`), alergias (Penicilina - grave, alerta vermelho suave), condições crônicas (DM2, HAS) e as últimas 3 interações clínicas:

| Data | Interação | Origem |
| --- | --- | --- |
| 2024-11-12 | Consulta em UBS | `RNDS - Conecte SUS` |
| 2024-10-28 | Exame laboratorial (HbA1c) | `SISLAB - Rede Laboratorial` |
| 2024-09-05 | Regulação estadual (consulta cardiologia autorizada) | `CROSS - Regulação Estadual SP` |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router) + Tailwind CSS                     │
│  app/page.tsx → Dashboard (client components)               │
│    • Busca CNS + validação        • Widget ROI Operacional  │
│    • Modal Consentimento LGPD     • Painéis + timeline      │
└──────────────┬──────────────────────────────────────────────┘
               │ POST /api/consent · POST /api/history
┌──────────────▼──────────────────────────────────────────────┐
│  RNDS/ — Camada whitelabel de integração (leitura GET)      │
│  ├── conectesus.ts    RNDS/Conecte SUS (FHIR R4)            │
│  ├── cross-sp.ts      CROSS Regulação Estadual SP           │
│  ├── esus-aps.ts      e-SUS APS (PEP ambulatorial)          │
│  ├── sislab.ts        SISLAB / rede laboratorial            │
│  └── hospital-fhir.ts Emergência/hospitalar (roadmap v2.2)  │
└──────────────┬──────────────────────────────────────────────┘
               │ agregação normalizada (Patient + Timeline)
┌──────────────▼──────────────────────────────────────────────┐
│  PEP legado / CROSS / RNDS  (fontes — nunca substituídas)   │
└─────────────────────────────────────────────────────────────┘
```

**Posicionamento:** o sistema é *consumer* de interoperabilidade, não *source of truth*. Nenhum adaptador grava dados; todos operam em leitura, com `X-Consent-Id` no header de cada requisição para auditoria LGPD.

Cada adaptador é **whitelabel**: clínicas, operadoras e consórcios reutilizam a mesma camada apenas configurando `baseUrl`, `apiKey` e `orgSlug` (ver `.env.example`). Sem credenciais, cada adaptador cai em modo mock (`lib/mock-rnds-data.ts`), permitindo demonstração estável.

---

## Compliance e Ética

### Modelo de receita (LGPD + CFM + improbidade)

- **Fee SaaS institucional por profissional ativo**, pago pela clínica/operadora/secretaria.
- **Não existe success fee, comissão, bônus ou qualquer remuneração variável paga ao médico individualmente** por paciente, exame ou encaminhamento. Este modelo violaria o Código de Ética Médica (Resolução CFM nº 2.217/2018) e configuraria risco de improbidade em contratos públicos.
- A métrica de valor exibida no produto é **Eficiência Operacional da Clínica/Operadora**: "Minutos de anamnese economizados" e "Exames duplicados evitados" — resultado institucional, não incentivo de conduta médica.

### LGPD

- Consentimento explícito do titular antes de qualquer consulta a dados (modal obrigatório, token com rotação de 15 minutos).
- Base legal: Art. 7º, I e Art. 11, I da Lei nº 13.709/2018.
- Finalidade restrita ao atendimento clínico da sessão; logs de auditoria imutáveis; o titular pode revogar a qualquer momento.

### RNDS e CFM

- Estrutura de dados aderente aos perfis FHIR R4 da Rede Nacional de Dados em Saúde.
- Aderência às diretrizes do CFM para interoperabilidade (o sistema não é prontuário e não registra ato médico).

### Transparência

- **[STATUS_E_ROADMAP.md](./STATUS_E_ROADMAP.md)** — matriz **VALIDADO / EM ANDAMENTO / PLANEJADO** com o roadmap da LOI (v2.1, v2.2, v3.0), separando o executado do planejado.

---

## Roadmap

Consulte a matriz completa em **[STATUS_E_ROADMAP.md](./STATUS_E_ROADMAP.md)**:

- **v2.1 (Q1 2025)** — Integração com SUS · Mobile app (React Native) · IA para predição de demanda · Blockchain para auditoria.
- **v2.2 (Q2 2025)** — Integração com sistemas de emergência · Dashboard de análise de dados · API GraphQL · Webhooks para notificações.
- **v3.0 (2026)** — Expansão para outros estados · Integração nacional · Sistema de inteligência artificial · Automatização completa.

---

## Como rodar o MVP (Next.js 14)

```bash
npm install
cp .env.example .env.local   # opcional: credenciais whitelabel; sem elas roda em modo mock
npm run dev                  # http://localhost:3000
```

Build de produção:

```bash
npm run build && npm start
```

## API do MVP

| Endpoint | Descrição |
| --- | --- |
| `POST /api/consent` | Registra consentimento LGPD (valida CNS) e devolve token de auditoria |
| `POST /api/history` | Consulta consolidada RNDS/CROSS (exige `consentId` válido) |

## Estrutura do MVP

```
├── RNDS/                          # Camada whitelabel (5 adaptadores + registry)
├── app/
│   ├── api/{consent,history}/     # Route handlers
│   ├── layout.tsx · page.tsx      # App Router
│   └── globals.css
├── components/                    # Dashboard, busca CNS, modal LGPD, ROI, painéis
├── lib/
│   ├── mock-rnds-data.ts          # Resposta RNDS realista (mock) + baseline ROI
│   ├── cns.ts                     # Validação oficial de CNS
│   └── clinical-types.ts
├── STATUS_E_ROADMAP.md            # Transparência VALIDADO/EM ANDAMENTO/PLANEJADO
└── .env.example
```

## Sistemas legados do repositório (contexto histórico)

Diretórios de iterações anteriores, mantidos como referência e fora do escopo do MVP atual:

- `v2/` — API Express (gestão hospitalar/MEI/propostas) da iteração anterior do sistema.
- `backend/`, `frontend/`, `index.html`, `ambulance.html`, `dataReceived.html`, `infra/docker`, `makefile` — protótipos e landing pages das primeiras validações.

O produto ativo perante a banca é o MVP Next.js 14 descrito neste README.

---

## Licença

MIT — vide `v2/package.json` para a versão da iteração anterior.
