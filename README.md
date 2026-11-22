<img width="200" height="200" alt="prefeitura-sp" src="https://github.com/user-attachments/assets/3779e7f6-c8b7-4c39-88d4-22a1b0dd4e60" />

# AuraHealthSP - BRAZIL: Módulo de Interoperabilidade e Histórico Longitudinal

> **Conectando a jornada do paciente com conformidade RNDS e LGPD, reduzindo retrabalho clínico e custos evitáveis na gestão pública de saúde.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![LGPD](https://img.shields.io/badge/Compliance-LGPD%20%26%20RNDS-orange.svg)](#)

---

## Visão Geral

O **AuraHealthSP** é uma solução B2G/B2B focada em resolver a fragmentação da jornada de saúde. Diferente de sistemas que tentam substituir o prontuário eletrônico existente, o AuraHealthSP atua como uma **camada de conexão leve e não-destrutiva**. 

Mediante consentimento explícito do paciente, o módulo agrega o histórico longitudinal (exames, alergias, consultas anteriores) em um painel unificado para o médico, integrando-se via API aos sistemas legados e à Rede Nacional de Dados em Saúde (RNDS).

**Resultado validado em pilotos:** Redução de 10 a 15 minutos no tempo de anamnese e diminuição significativa de exames duplicados.

---

## O Problema que Resolvemos

1. **Retrabalho Clínico:** Médicos perdem tempo repetindo anamneses e solicitando exames que o paciente já possui, mas que estão em outro sistema.
2. **Decisão com Informação Incompleta:** A falta de histórico longitudinal gera custo evitável e riscos à segurança do paciente.
3. **Fricção de Integração:** Secretarias de saúde e clínicas não podem parar suas operações para trocar de sistema (ERP/Prontuário) apenas para ganhar interoperabilidade.

---

## A Solução (Foco do MVP v2)

O MVP atual (versão 2) foi desenhado para validação de mercado e tração inicial, focando estritamente em:

- **Dashboard Unificado do Médico:** Visualização rápida e organizada do histórico do paciente.
- **Gestão de Consentimento (LGPD):** Fluxo claro de autorização do paciente para compartilhamento de dados.
- **Integração Não-Destrutiva:** Conectores de API que leem dados de prontuários legados sem exigir a substituição do software atual da unidade de saúde.
- **Métricas de ROI em Tempo Real:** Painel administrativo que quantifica "tempo clínico recuperado" e "exames evitados" para o gestor público.

> *Nota: Funcionalidades como rastreamento logístico, integração MEI e módulos de blockchain fazem parte do roadmap de longo prazo e não estão incluídas neste MVP de validação de interoperabilidade.*

---

## Arquitetura e Tecnologias

O backend foi construído para ser leve, seguro e escalável, seguindo boas práticas de desenvolvimento.

| Componente | Tecnologia | Descrição |
| --- | --- | --- |
| **Runtime** | Node.js (v18+) | Ambiente de execução assíncrono e performático |
| **Framework** | Express.js | API RESTful e gerenciamento de rotas |
| **Banco de Dados** | PostgreSQL | Armazenamento relacional de dados de saúde e auditoria |
| **Cache** | Redis | Otimização de consultas frequentes e sessões |
| **Infraestrutura** | Docker & Docker Compose | Containerização para deploy consistente e replicável |
| **Segurança** | JWT + bcrypt | Autenticação segura e criptografia de senhas |

---

## 📂 Estrutura do Projeto (v2)

```text
aurahealthsp/
├── v2/                     # Diretório principal do MVP validado
│   ├── api/
│   │   └── server.js       # Servidor principal (Express + Configurações)
│   ├── controllers/        # Lógica de negócio (Auth, Patient History, Dashboard)
│   ├── models/             # Modelos de dados (Knex/ORM)
│   ├── routes/             # Definição dos endpoints da API
│   ├── middleware/         # Autenticação (JWT), Logging e Tratamento de Erros
│   ├── config/             # Variáveis de ambiente e conexões (DB, Redis)
│   └── views/              # Templates do Dashboard (Admin e Médico)
├── infra/
│   └── docker/             # Configuração de orquestração (docker-compose.yml)
├── .env.example            # Modelo de variáveis de ambiente
└── README.md

````

# Como Rodar o Projeto

Pré-requisitos

Node.js >= 18.0.0

Docker e Docker Compose (Recomendado)

Instalação e Execução (via Docker)

Clone o repositório:

bash
   git clone https://github.com/kauecodify/AurahealthSP.git
   cd AurahealthSP

Configure as variáveis de ambiente:

````
bash
   cp .env.example .env

   # Edite o arquivo .env com suas credenciais locais
````

Inicie os serviços (API, PostgreSQL e Redis):

````
bash
   docker-compose -f infra/docker/docker-compose.yml up -d --build
````

Acesse o sistema:

````
API Health Check: http://localhost:3002/health

Dashboard Admin: http://localhost:3002/admin
````

# 🔌 Principais Endpoints da API (v2)

# Autenticação

````
POST /api/v2/auth/login - Autenticação de profissionais e gestores.

GET /api/v2/auth/me - Recupera dados do usuário logado.
````

# Histórico do Paciente (Core)

````
GET /api/v2/patients/:cpf/history - Retorna o histórico longitudinal consolidado (requer consentimento válido).

POST /api/v2/patients/:cpf/consent - Registra o consentimento LGPD do paciente para compartilhamento de dados.
````

# Dashboard e Métricas (Gestão)

````
GET /api/v2/hospitals/:id/roi-metrics - Retorna dados de tempo economizado e custos evitados na unidade.

GET /api/v2/admin/dashboard - Visão consolidada para gestores de secretaria/consórcio.
````

# Segurança e Conformidade

LGPD: Todos os acessos ao histórico do paciente são registrados em log de auditoria imutável e exigem token de consentimento válido.

RNDS: A estrutura de dados segue os padrões de interoperabilidade definidos pela Rede Nacional de Dados em Saúde.

RBAC (Role-Based Access Control): Separação rígida de permissões entre medico, gestor_unidade e admin_secretaria.

®
