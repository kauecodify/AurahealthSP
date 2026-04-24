<img width="200" height="200" alt="prefeitura-sp" src="https://github.com/user-attachments/assets/3779e7f6-c8b7-4c39-88d4-22a1b0dd4e60" />


# AuraHealthSP

> **Sistema Operacional da Saúde Pública e Privada**  
> *Integrando atendimento, logística, inteligência artificial e transparência em tempo real*

### MVP

[https://aurahealth-sp-svc6-git-main-kauecaires1-8955s-projects.vercel.app]

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Node.js-20.x-blue?style=for-the-badge&logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Blockchain-Hyperledger-purple?style=for-the-badge" alt="Blockchain">
</p>

---

## 🎯 Visão Geral

O **AuraHealthSP** é uma plataforma unificada que funciona como um *"sistema operacional da saúde"*, conectando pacientes, unidades básicas de saúde (UBS), hospitais, SAMU e gestores financeiros em um ecossistema inteligente e automatizado.

```
🔄 Fluxo Integrado:
Paciente → Triagem IA → Match de Vaga → Logística → Atendimento → Pagamento → Auditoria
```

### ✨ Por que AuraHealthSP?

| Problema Atual | Solução AuraHealthSP |
|---------------|---------------------|
| Filas de espera desorganizadas | Priorização inteligente por IA baseada em risco clínico |
| Vagas ociosas enquanto pacientes aguardam | Match em tempo real de capacidade hospitalar |
| Logística de ambulâncias ineficiente | Roteirização dinâmica com otimização de recursos |
| Pagamentos manuais e lentos | Motor financeiro automatizado com conciliação instantânea |
| Falta de transparência nos processos | Auditoria imutável via blockchain |

---

## 🚀 Funcionalidades Principais

### 🤖 Triagem com Inteligência Artificial
```javascript
// Exemplo de análise de risco
{
  "sintomas": "dor no peito, sudorese, náusea",
  "idade": 58,
  "sinais_vitais": { "pa": "180x110", "fc": 112, "spo2": 94 },
  "resultado": {
    "risco": 0.89,
    "prioridade": "ALTA",
    "destino_recomendado": "UTI Emergencial",
    "tempo_estimado_atendimento": "< 10 minutos"
  }
}
```

### 🏥 Match de Capacidade em Tempo Real
- Monitoramento contínuo de leitos, UTIs, equipamentos e equipes
- Alertas proativos quando recursos atingem limites críticos
- Integração com padrões **HL7 FHIR** e **OpenEHR**

### 🚑 Logística Inteligente
```mermaid
graph LR
    A[Origem: UBS/Domicílio] --> B{Análise de Rota}
    B --> C[Veículo Disponível Mais Próximo]
    B --> D[Condições de Tráfego em Tempo Real]
    B --> E[Recursos no Destino]
    C & D & E --> F[Rota Ótima Calculada]
    F --> G[Despacho Automático]
```

### 💳 Motor Financeiro Automatizado
- Conciliação de pagamentos entre SUS, operadoras e particulares
- Smart contracts para liberação condicional de recursos
- Relatórios fiscais e de compliance gerados automaticamente

### 🔗 Auditoria Blockchain (Hyperledger)
- Registro imutável de todas as transações clínicas e financeiras
- Rastreabilidade completa: quem, quando, onde e por quê
- Conformidade com **LGPD** e normas do **Ministério da Saúde**

### Como rodar?
```

# 1. Clonar repositório
git clone https://github.com/seu-org/aurahealth-sp.git
cd aurahealth-sp

# 2. Configurar ambiente
cp .env.example .env
# Editar .env conforme necessário

# 3. Iniciar com Docker Compose
make up

# 4. Executar migrações do banco
make migrate

# 5. Verificar saúde dos serviços
make health

# 6. Acessar aplicação
# 🌐 http://localhost:3000
# 🔌 API: http://localhost:3001
# 📊 Swagger: http://localhost:3001/api-docs

# 7. (Opcional) Monitoramento
make monitor
# Grafana: http://localhost:3002 (admin/admin123)
# Prometheus: http://localhost:9090
```

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph Frontend
        A[Dashboard Web] --> B[Mobile App]
        A --> C[Painel Gestor]
    end
    
    subgraph "API Gateway"
        D[Express + Socket.io] --> E[Autenticação JWT]
        D --> F[Rate Limiting]
    end
    
    subgraph "Microserviços"
        G[Triage IA] --> H[Python/TensorFlow]
        I[Capacity Match] --> J[Node.js + Redis]
        K[Logistics] --> L[Node.js + OSRM]
        M[Payments] --> N[Node.js + Stripe/Pix]
    end
    
    subgraph "Infraestrutura"
        O[Kafka] --> P[Event Streaming]
        Q[Hyperledger Fabric] --> R[Audit Trail]
        S[Kubernetes] --> T[Orquestração]
        U[PostgreSQL + TimescaleDB] --> V[Dados Clínicos]
    end
    
    Frontend --> API Gateway
    API Gateway --> Microserviços
    Microserviços --> Infraestrutura
```

### 📦 Stack Tecnológico

| Camada | Tecnologias |
|--------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JS, Socket.io Client |
| **Backend** | Node.js, Express, Socket.io, JWT |
| **IA/ML** | Python, TensorFlow, Scikit-learn, Protocolos ESC |
| **Dados** | PostgreSQL, Redis, TimescaleDB |
| **Messaging** | Apache Kafka (simulado em MVP) |
| **Blockchain** | Hyperledger Fabric (simulado em MVP) |
| **Infra** | Docker, Kubernetes, Nginx, Prometheus |
| **Integrações** | HL7 FHIR, OpenEHR, DATASUS, Pix API |

---

## ⚡ Quick Start

### Pré-requisitos
```bash
Node.js >= 20.x
Docker & Docker Compose (opcional)
npm ou yarn
```

### 🛠️ Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-org/aurahealth-sp.git
cd aurahealth-sp

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Iniciar serviços (modo desenvolvimento)
npm run dev:all

# 5. Acessar aplicação
🌐 Frontend: http://localhost:3000
🔌 API: http://localhost:3001/health
📊 Swagger: http://localhost:3001/api-docs
```

### 🐳 Execução com Docker

```bash
# Build e start de todos os serviços
docker-compose up --build

# Executar em background
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f api

# Parar serviços
docker-compose down
```

---

## 📚 Documentação da API

### Endpoints Principais

#### 🔍 Triagem
```http
POST /api/triage/analyze
Content-Type: application/json

{
  "patient": {
    "name": "string",
    "age": number,
    "symptoms": "string",
    "vitals": { "hr": number, "spo2": number, "bp": "string" }
  }
}

# Response
{
  "riskScore": 0.85,
  "priority": "HIGH",
  "recommendation": {
    "destination": "UTI Emergencial",
    "transport": "SAMU",
    "eta": "< 10min"
  },
  "protocol": "ESC-2024-CHEST-PAIN"
}
```

#### 🏥 Capacidade Hospitalar
```http
GET /api/capacity/available?region=sp-east&resource=icu_beds

# Response
{
  "hospitals": [
    {
      "id": "hc-001",
      "name": "Hospital das Clínicas",
      "available": {
        "beds": 42,
        "icu": 8,
        "ventilators": 12,
        "oxygen_level": 98
      },
      "coordinates": { "lat": -23.561, "lng": -46.672 }
    }
  ],
  "lastUpdate": "2024-04-24T14:30:00Z"
}
```

#### 🚑 Logística
```http
POST /api/logistics/route
{
  "origin": { "lat": -23.555, "lng": -46.655, "type": "UBS" },
  "destination": "hc-001",
  "urgency": "critical"
}

# Response
{
  "vehicle": { "id": "A-204", "type": "ambulance" },
  "route": {
    "distance": "4.2 km",
    "eta": "12 min",
    "steps": ["Partida UBS", "Av. Paulista", "HC"]
  },
  "supplies_verified": true
}
```

#### 🔗 Auditoria Blockchain
```http
GET /api/audit/blocks?limit=10
GET /api/audit/search?q=paciente_id:12345

# Response
{
  "blocks": [
    {
      "index": 1542,
      "hash": "a3f5...9c2e",
      "timestamp": "2024-04-24T14:30:00Z",
      "transaction": {
        "type": "PATIENT_ADMISSION",
        "patientId": "enc:a3f5...",
        "action": "TRANSFER_TO_ICU"
      }
    }
  ]
}
```

> 📖 Documentação completa disponível em `/api-docs` (Swagger UI)

---

## 📁 Estrutura do Projeto

```
aurahealth-sp/
├── 📁 backend/
│   ├── server.js
│   ├── package.json
│   ├── .dockerignore
│   ├── .env.example
│   ├── routes/
│   │   ├── triage.js
│   │   ├── capacity.js
│   │   ├── logistics.js
│   │   ├── payments.js
│   │   └── audit.js
│   ├── services/
│   │   ├── aiTriage.js
│   │   ├── supplyChain.js
│   │   ├── blockchain.js
│   │   ├── kafkaSimulator.js
│   │   └── metrics.js
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Hospital.js
│   │   ├── Transaction.js
│   │   └── AuditBlock.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimit.js
│   │   └── logger.js
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── kafka.js
│   └── utils/
│       ├── errorHandler.js
│       └── validators.js
│
├── 📁 frontend/
│   ├── index.html
│   ├── package.json
│   ├── .dockerignore
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── triage-ai.js
│   │   ├── supply-chain.js
│   │   ├── blockchain-audit.js
│   │   └── socket-client.js
│   └── assets/
│       └── icons/
│
├── 📁 infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.worker
│   │   ├── nginx.conf
│   │   └── healthcheck.sh
│   ├── k8s/
│   │   ├── namespaces.yml
│   │   ├── configmaps.yml
│   │   ├── secrets.yml
│   │   ├── api-deployment.yml
│   │   ├── frontend-deployment.yml
│   │   ├── postgres-statefulset.yml
│   │   ├── redis-statefulset.yml
│   │   ├── ingress.yml
│   │   ├── hpa.yml
│   │   └── network-policies.yml
│   ├── monitoring/
│   │   ├── prometheus.yml
│   │   ├── alerts.yml
│   │   └── grafana-dashboard.json
│   └── scripts/
│       ├── init-db.sh
│       ├── migrate.sh
│       ├── backup.sh
│       └── health-check.sh
│
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── Makefile
├── README.md
├── LICENSE
└── docker-compose.yml (root alias)
```

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes end-to-end
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

### Exemplo de Teste - Triagem IA
```javascript
// tests/unit/aiTriage.test.js
describe('calculateRisk', () => {
  it('deve classificar dor no peito + sudorese como ALTA prioridade', () => {
    const result = calculateRisk('dor no peito irradiando, sudorese fria', 62);
    expect(result.priority).toBe('HIGH');
    expect(result.score).toBeGreaterThan(0.7);
  });
});
```

---

## 🌍 Variáveis de Ambiente

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost:5432/aurahealth
REDIS_URL=redis://localhost:6379

# Autenticação
JWT_SECRET=seu-super-segredo-aqui
JWT_EXPIRES_IN=24h

# Integrações Externas
FHIR_SERVER_URL=https://fhir.datasus.gov.br
PIX_API_KEY=sua-chave-pix
KAFKA_BROKERS=localhost:9092

# Blockchain (Hyperledger)
FABRIC_NETWORK_CONFIG=./config/fabric.json
FABRIC_WALLET_PATH=./wallet

# Monitoramento
PROMETHEUS_ENDPOINT=/metrics
LOG_LEVEL=info
```

---

## 🤝 Contribuindo

Contribuições são **muito bem-vindas**! Siga os passos:

1. **Fork** o projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-melhoria`
3. Commit suas alterações: `git commit -m 'feat: adiciona validação de CPF na triagem'`
4. Push para a branch: `git push origin feature/minha-melhoria`
5. Abra um **Pull Request**

### 📋 Guidelines de Código

- ✅ Seguir padrão ESLint + Prettier configurado
- ✅ Escrever testes para novas funcionalidades
- ✅ Documentar endpoints novos no Swagger
- ✅ Commits semânticos: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

### 🐛 Reportando Bugs

Use o template de issue e inclua:
- Versão do Node e SO
- Passos para reproduzir
- Logs de erro (se aplicável)
- Comportamento esperado vs. observado

---

## 📈 Roadmap

```mermaid
gantt
    title Roadmap AuraHealthSP
    dateFormat  YYYY-MM
    section MVP
    Protótipo Funcional       :done,    mvp1, 2024-01, 2024-03
    Triagem IA Básica         :done,    mvp2, 2024-02, 2024-04
    Dashboard Operacional     :active,  mvp3, 2024-04, 2024-06
    
    section Escala Municipal
    Integração FHIR           :         mun1, 2024-06, 2024-08
    Blockchain Audit          :         mun2, 2024-07, 2024-09
    App Mobile Paciente       :         mun3, 2024-08, 2024-10
    
    section Expansão Regional
    Multi-tenant Architecture :         reg1, 2024-10, 2024-12
    Motor Financeiro Completo :         reg2, 2024-11, 2025-01
    IA Preditiva de Demanda   :         reg3, 2024-12, 2025-02
    
    section Nacional
    Federação de Redes        :         nat1, 2025-02, 2025-06
    Conformidade ANS/SUS      :         nat2, 2025-03, 2025-07
```

---

## 📊 Impacto Esperado

| Métrica | Situação Atual | Com AuraHealthSP | Melhoria |
|---------|---------------|------------------|----------|
| Tempo médio de triagem | 45 min | **8 min** | ▼ 82% |
| Ocupação ociosa de leitos | 23% | **< 5%** | ▼ 78% |
| Tempo de despacho SAMU | 18 min | **6 min** | ▼ 67% |
| Conciliação financeira | 15 dias | **< 24h** | ▼ 93% |
| Transparência de processos | Baixa | **Auditável 100%** | ✅ Full |

> 💡 **Economia estimada**: ~R$ 400 milhões/ano em escala estadual

---

## ⚠️ Desafios e Mitigações

| Desafio | Estratégia de Mitigação |
|---------|------------------------|
| Resistência institucional | Pilotos em unidades parceiras + capacitação contínua |
| Sistemas legados incompatíveis | Camada de adaptação FHIR + middleware de tradução |
| Privacidade de dados (LGPD) | Criptografia end-to-end + anonimização + consentimento granular |
| Conectividade em áreas remotas | Modo offline-first + sincronização assíncrona |
| Complexidade política | Governança multipartite + comitê técnico independente |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.

```
MIT License

Copyright (c) 2024 AuraHealthSP Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Equipe & Contato

<div align="center">

| Função | Responsável | Contato |
|--------|------------|---------|
| 🤖 IA/ML Specialist | Kaue Caires | `https://linktr.ee/kauecaires` |


</div>

---

> 🏥 *"Tecnologia a serviço da vida: cada segundo conta, cada recurso importa."*  
> **AuraHealthSP** — Transformando fragmentação em integração, dados em decisões, e espera em cuidado.

<p align="center">
  <sub>Feito com ❤️ para o SUS e para todos os brasileiros</sub>
</p>
