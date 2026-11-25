# STATUS E ROADMAP - AuraHealthSP

> Documento de transparência para banca de venture building e mentoria: separa explicitamente **o que foi executado e validado**, **o que está em execução** e **o que é plano futuro**. Última atualização: Semana 4 do programa de pré-aceleração.

## Resumo Executivo

A integração com as APIs da **RNDS (Conecte SUS)** foi demonstrada com sucesso em **3 dias de desenvolvimento** — evidência central de viabilidade técnica e de baixa complexidade de integração ao ecossistema público. A proposta de valor monetizada é a **Eficiência Operacional da Clínica/Operadora** (minutos de anamnese economizados e exames duplicados evitados), sustentando um fee SaaS **pago pela instituição** — nunca por remuneração variável ao médico individual.

## Matriz de Status

| Fase | Período | Escopo | Status | Evidências |
| --- | --- | --- | --- | --- |
| **VALIDADO** (Semanas 1–3) | Semanas 1–3 | Mapeamento de dor com 8+ gestores de saúde | ✅ Concluído | Retrabalho clínico (anamnese repetida e exames duplicados) identificado como dor dominante |
| **VALIDADO** (Semanas 1–3) | Semana 2 | Protótipo funcional com integração RNDS (Conecte SUS) | ✅ Demonstrada em 3 dias de desenvolvimento | Fluxo: busca por CNS → consulta à API RNDS → linha do tempo unificada |
| **VALIDADO** (Semanas 1–3) | Semanas 1–3 | 2 Cartas de Intenção (LOI) | ✅ Assinadas | LOIs **condicionadas a piloto** de validação de ROI |
| **EM ANDAMENTO** | Próximos 30 dias | Piloto controlado de 14 dias em 1 clínica privada | 🔄 Em execução | Medir a **linha de base real** de tempo economizado por sessão (baseline atual: 14 min/sessão) |
| **PLANEJADO** | Próximos 6 meses | Formalização de parceria com operador credenciado | 🗺️ Planejado | Expansão em consórcios intermunicipais via **revenue share institucional** |

## Roadmap de Produto (LOI + evolução)

### v2.1 (Q1 2025)

| Item | Descrição | Status |
| --- | --- | --- |
| Integração com SUS | Leitura via RNDS/Conecte SUS e CROSS (SP) — núcleo já demonstrado | 🔄 Em execução (RNDS validada em 3 dias) |
| Mobile app (React Native) | App de apoio ao profissional para consulta rápida em plantão | ✅ Especificação técnica concluída |
| IA para predição de demanda | Previsão de procura por especialidade/região para apoio à regulação | ✅ Especificação técnica concluída |
| Blockchain para auditoria | Trilha de auditoria imutável dos acessos (LGPD) | ✅ Especificação técnica concluída |

### v2.2 (Q2 2025)

| Item | Descrição | Status |
| --- | --- | --- |
| Integração com sistemas de emergência | Admissões e triagem hospitalar via adaptador `hospital-fhir` | ✅ Especificação técnica concluída |
| Dashboard de análise de dados | Analítico institucional de ROI consolidado (operadora/consórcio) | ✅ Especificação técnica concluída |
| API GraphQL | Alternativa à API REST para consultas federadas por consórcios | ✅ Especificação técnica concluída |
| Webhooks para notificações | Eventos de alta, exame e regulação entregues ao PEP da instituição | ✅ Especificação técnica concluída |

### v3.0 (2026)

| Item | Descrição | Status |
| --- | --- | --- |
| Expansão para outros estados | Replicação do modelo validado em SP para novas secretarias | 🗺️ Planejado |
| Integração nacional | Cobertura RNDS em todas as UFs | 🗺️ Planejado |
| Sistema de inteligência artificial | Núcleo agregado de IA clínica e preditiva | 🗺️ Planejado |
| Automatização completa | Fluxos regulatórios e de consentimento automatizados | 🗺️ Planejado |

## Como interpretar

- ✅ **VALIDADO**: evidência técnica ou comercial obtida e defensável perante a banca.
- 🔄 **EM ANDAMENTO**: compromisso com prazo e métrica de sucesso definidos.
- 🗺️ **PLANEJADO**: visão de produto condicionada aos resultados das fases anteriores — não deve ser apresentada como entregue.
