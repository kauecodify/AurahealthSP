<img width="200" height="200" alt="prefeitura-sp" src="https://github.com/user-attachments/assets/3779e7f6-c8b7-4c39-88d4-22a1b0dd4e60" />

# AuraHealthSP - BRAZIL

**Sistema Operacional da Saude Publica e Privada**
*Integrando atendimento, logistica, inteligencia artificial e transparencia em tempo real*

---

## \ud83d\udcca Visao Geral

O **AuraHealthSP** e uma plataforma unificada que funciona como um *"sistema operacional da saude"*, conectando pacientes, unidades basicas de saude (UBS), hospitais, SAMU e gestores financeiros em um ecossistema inteligente e automatizado.

### \ud83c\udfaf Novidades v2

- **Visualizacao de Prestacao de Servico em Hospitais**: Dashboard em tempo real com status de leitos, UTI e oxigenio
- **Integracao MEI**: Verificacao automatica de CNPJ MEI e validacao de setores autorizados
- **Administrador de Hospitais (Prefeitura)**: Painel completo para gestao de contratos e prestadores
- **Sistema de Propostas**: Cadastro de pessoas e envio de propostas para aprovacao rapida
- **Rastreamento de Ambulancias**: GPS em tempo real com integracao satelite
- **Integracao Satelite**: Cobertura ampla para areas remotas

---

## \ud83c\udfd7\ufe0f Estrutura do Projeto

```
aurahealthsp/
\u251c\u2500\u2500 index.html              # Versao principal (v1)
\u251c\u2500\u2500 ambulance.html          # Pagina de ambulancias
\u251c\u2500\u2500 dataReceived.html       # Dados recebidos
\u251c\u2500\u2500 backend/
\u2502   \u251c\u2500\u2500 server.js           # Servidor principal API
\u2502   \u251c\u2500\u2500 config/             # Configuracoes
\u2502   \u2502   \u251c\u2500\u2500 database.js     # Configuracao PostgreSQL
\u2502   \u2502   \u251c\u2500\u2500 redis.js        # Configuracao Redis
\u2502   \u2502   \u2514\u2500\u2500 kafka.js        # Configuracao Kafka
\u2502   \u251c\u2500\u2500 routes/             # Rotas da API
\u2502   \u2502   \u251c\u2500\u2500 triage.js       # Rotas de triagem
\u2502   \u2502   \u251c\u2500\u2500 capacity.js     # Rotas de capacidade
\u2502   \u2502   \u251c\u2500\u2500 logistics.js    # Rotas de logistica
\u2502   \u2502   \u251c\u2500\u2500 payments.js     # Rotas de pagamentos
\u2502   \u2502   \u2514\u2500\u2500 audit.js        # Rotas de auditoria
\u2502   \u251c\u2500\u2500 services/           # Servicos
\u2502   \u2502   \u251c\u2500\u2500 blockchain.js   # Servico blockchain
\u2502   \u2502   \u251c\u2500\u2500 ai-Triage.js    # IA para triagem
\u2502   \u2502   \u2514\u2500\u2500 supplyChain.js  # Cadeia de suprimentos
\u2502   \u2514\u2500\u2500 middleware/         # Middlewares
\u2502       \u251c\u2500\u2500 auth.js         # Autenticacao
\u2502       \u2514\u2500\u2500 logger.js       # Logging
\u251c\u2500\u2500 frontend/
\u2502   \u251c\u2500\u2500 index.html          # Frontend principal
\u2502   \u251c\u2500\u2500 app.js              # Aplicacao frontend
\u2502   \u251c\u2500\u2500 css/                # Estilos
\u2502   \u2514\u2500\u2500 js/                 # Scripts
\u251c\u2500\u2500 infra/
\u2502   \u2514\u2500\u2500 docker/             # Configuracao Docker
\u2502       \u2514\u2500\u2500 docker-compose.yml
\u2514\u2500\u2500 v2/                     # Versao 2 (COMPLETO!)
    \u251c\u2500\u2500 index.html          # Pagina principal v2
    \u251c\u2500\u2500 admin/               # Dashboard Admin Prefeitura
    \u2502   \u2514\u2500\u2500 index.html     # Painel administrativo
    \u251c\u2500\u2500 api/
    \u2502   \u2514\u2500\u2500 server.js       # Servidor v2 com Socket.IO
    \u251c\u2500\u2500 config/
    \u2502   \u251c\u2500\u2500 database.js     # PostgreSQL v2
    \u2502   \u251c\u2500\u2500 redis.js        # Redis v2
    \u2502   \u251c\u2500\u2500 satellite.js    # Configuracao Satelite
    \u2502   \u251c\u2500\u2500 kafka.js        # Configuracao Kafka
    \u2502   \u2514\u2500\u2500 nginx.conf      # Configuracao Nginx
    \u251c\u2500\u2500 services/
    \u2502   \u251c\u2500\u2500 meiService.js   # Servico MEI (CNPJ)
    \u2502   \u251c\u2500\u2500 ambulanceService.js # Servico Ambulancia
    \u2502   \u2514\u2500\u2500 satelliteService.js # Servico Satelite
    \u251c\u2500\u2500 controllers/
    \u2502   \u251c\u2500\u2500 hospitalController.js
    \u2502   \u251c\u2500\u2500 meiController.js
    \u2502   \u251c\u2500\u2500 proposalController.js
    \u2502   \u251c\u2500\u2500 ambulanceController.js
    \u2502   \u251c\u2500\u2500 satelliteController.js
    \u2502   \u251c\u2500\u2500 adminController.js
    \u2502   \u2514\u2500\u2500 authController.js
    \u251c\u2500\u2500 routes/
    \u2502   \u251c\u2500\u2500 index.js        # Rotas principais
    \u2502   \u251c\u2500\u2500 auth.js         # Autenticacao
    \u2502   \u251c\u2500\u2500 hospital.js     # Rotas hospitais
    \u2502   \u251c\u2500\u2500 mei.js          # Rotas MEI
    \u2502   \u251c\u2500\u2500 proposal.js     # Rotas propostas
    \u2502   \u251c\u2500\u2500 ambulance.js    # Rotas ambulancias
    \u2502   \u251c\u2500\u2500 satellite.js    # Rotas satelite
    \u2502   \u2514\u2500\u2500 admin.js        # Rotas admin
    \u251c\u2500\u2500 models/
    \u2502   \u251c\u2500\u2500 Hospital.js      # Modelo Hospital
    \u2502   \u251c\u2500\u2500 MEI.js          # Modelo MEI
    \u2502   \u251c\u2500\u2500 Proposal.js     # Modelo Proposta
    \u2502   \u251c\u2500\u2500 User.js         # Modelo Usuario
    \u2502   \u251c\u2500\u2500 Ambulance.js    # Modelo Ambulancia
    \u2502   \u2514\u2500\u2500 Contract.js      # Modelo Contrato
    \u251c\u2500\u2500 middleware/
    \u2502   \u251c\u2500\u2500 auth.js         # Autenticacao JWT
    \u2502   \u251c\u2500\u2500 logger.js       # Winston Logger
    \u2502   \u2514\u2500\u2500 errorHandler.js # Tratamento de erros
    \u251c\u2500\u2500 views/
    \u2502   \u251c\u2500\u2500 admin/
    \u2502   \u2502   \u2514\u2500\u2500 dashboard.html
    \u2502   \u251c\u2500\u2500 hospital/
    \u2502   \u2502   \u2514\u2500\u2500 view.html
    \u2502   \u251c\u2500\u2500 proposals/
    \u2502   \u2502   \u2514\u2500\u2500 submit.html
    \u2502   \u2514\u2500\u2500 mei/
    \u2502       \u2514\u2500\u2500 verify.html
    \u251c\u2500\u2500 public/
    \u2502   \u251c\u2500\u2500 css/
    \u2502   \u251c\u2500\u2500 js/
    \u2502   \u2514\u2500\u2500 images/
    \u251c\u2500\u2500 .env
    \u251c\u2500\u2500 package.json
    \u2514\u2500\u2500 README.md
```

---

## \ud83d\ude80 Funcionamento do Backend v2

### Arquitetura

O backend do AuraHealthSP v2 e construido com **Node.js + Express + Socket.IO** e segue uma arquitetura de servicos modular:

```
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                        CLIENTES                              \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502
\u2502     \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500   \u2502
\u2502        \u2502              \u2502              \u2502            \u2502        \u2502
\u2502        \u2514\u2500\u2500 Frontend      \u2514\u2500\u2500 Mobile       \u2514\u2500\u2500 Admin       \u2514\u2500\u2500 API          \u2502
\u2502              (React)           (Flutter)     (Dashboard)    (REST/WS)   \u2502
\u2502        \u2502              \u2502              \u2502            \u2502        \u2502
\u2502        \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502
\u2502                                                             \u2502
\u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510  \u2502
\u2502  \u2502                     BACKEND v2                                  \u2502  \u2502
\u2502  \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502  \u2502
\u2502  \u2502  \u2502  Express + Socket.IO    \u2502  PostgreSQL    \u2502  Redis   \u2502   \u2502  \u2502
\u2502  \u2502  \u2502  (API REST)             \u2502  (Banco)       \u2502  (Cache)  \u2502   \u2502  \u2502
\u2502  \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502  \u2502
\u2502  \u2502  \u2502  Routes                \u2502              \u2502          \u2502   \u2502  \u2502
\u2502  \u2502  \u2502  Controllers            \u2502              \u2502          \u2502   \u2502  \u2502
\u2502  \u2502  \u2502  Services              \u2502              \u2502          \u2502   \u2502  \u2502
\u2502  \u2502  \u2502  Models (Knex)          \u2502              \u2502          \u2502   \u2502  \u2502
\u2502  \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502  \u2502
\u2502  \u2502                                                                  \u2502  \u2502
\u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510  \u2502
\u2502                                                                   \u2502
\u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510  \u2502
\u2502  \u2502  SERVICOS EXTERNOS                                               \u2502  \u2502
\u2502  \u2502  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502  \u2502
\u2502  \u2502  \u2502  MEI Gateway           \u2502  Satellite API       \u2502  Kafka         \u2502   \u2502  \u2502
\u2502  \u2502  \u2502  (CNPJ)                \u2502  (Tracking)          \u2502  (Messages)    \u2502   \u2502  \u2502
\u2502  \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502  \u2502
\u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
```

### Tecnologias Utilizadas

| Componente | Tecnologia | Versao | Descricao |
|-----------|------------|--------|-----------|
| **Runtime** | Node.js | >=18.0.0 | Ambiente de execucao |
| **Framework** | Express | ^4.18.2 | Framework web |
| **Banco de Dados** | PostgreSQL | >=14 | Banco relacional |
| **Cache** | Redis | >=7.0 | Cache e Pub/Sub |
| **Mensageria** | Kafka | ^2.2.4 | Fila de mensagens |
| **WebSocket** | Socket.IO | ^4.6.1 | Comunicacao em tempo real |
| **Autenticacao** | JWT | ^9.0.2 | Tokens de autenticacao |
| **ORM** | Knex | ^3.1.0 | Query builder |
| **Validacao** | express-validator | ^7.0.1 | Validacao de requests |
| **Logging** | Winston | ^3.11.0 | Logger estruturado |
| **Integracao Satelite** | Axios | ^1.6.2 | HTTP client |
| **Integracao MEI** | Axios | ^1.6.2 | API do governo |

---

## \ud83d\udce6 Configuracao e Instalacao

### Pre-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7.0
- Docker (opcional)
- Docker Compose (opcional)

### Instalacao (v2)

```bash
# Navegar para a pasta v2
cd v2

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas configuracoes

# Iniciar o servidor
npm start

# Ou em modo desenvolvimento
npm run dev
```

### Configuracao do Banco de Dados

```bash
# Criar banco de dados
createdb aurahealthsp_v2

# Executar migracoes
npm run db:migrate

# Executar seeds (opcional)
npm run db:seed
```

### Docker (Recomendado)

```bash
# Build e run
docker-compose -f infra/docker/docker-compose.yml up -d

# Ver logs
docker-compose -f infra/docker/docker-compose.yml logs -f
```

---

## \ud83c\udfc3\u200d\u2642\ufe0f Uso

### Iniciar o Servidor

```bash
# Producao
npm start

# Desenvolvimento (com hot-reload)
npm run dev

# Com Docker
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Acessar o Sistema

| Ambiente | URL | Descricao |
|----------|-----|-----------|
| **API v2** | `http://localhost:3002/api/v2` | API REST principal |
| **Socket.IO** | `ws://localhost:3002` | WebSocket para tempo real |
| **Admin Dashboard** | `http://localhost:3002/admin` | Painel administrativo |
| **Frontend v2** | `http://localhost:3002` | Aplicacao principal |
| **Health Check** | `http://localhost:3002/health` | Status do servidor |

---

## \ud83d\udd0c API Endpoints v2

### Autenticacao

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| POST | `/api/v2/auth/login` | Login | Public |
| POST | `/api/v2/auth/register` | Cadastro de usuario | Public |
| POST | `/api/v2/auth/register-person` | Cadastro de pessoa | Public |
| POST | `/api/v2/auth/refresh` | Refresh token | Public |
| POST | `/api/v2/auth/logout` | Logout | Private |
| GET | `/api/v2/auth/me` | Dados do usuario | Private |

**Exemplo de Login:**
```bash
curl -X POST http://localhost:3002/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@prefeitura.gov.br",
    "password": "senha-segura"
  }'
```

### Hospitais

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/hospitals` | Listar todos | Private |
| GET | `/api/v2/hospitals/:id` | Obter por ID | Private |
| GET | `/api/v2/hospitals/:id/status` | Status em tempo real | Public |
| GET | `/api/v2/hospitals/:id/sectors` | Setores do hospital | Private |
| GET | `/api/v2/hospitals/:id/mei` | MEIs autorizados | Private |
| GET | `/api/v2/hospitals/:id/service-dashboard` | Dashboard de servicos | Private |
| POST | `/api/v2/hospitals` | Criar hospital | Admin |
| PUT | `/api/v2/hospitals/:id` | Atualizar hospital | Admin/Hospital |
| PUT | `/api/v2/hospitals/:id/status` | Atualizar status | Admin/Hospital |
| DELETE | `/api/v2/hospitals/:id` | Remover hospital | Admin |
| GET | `/api/v2/hospitals/stats` | Estatisticas | Private |
| GET | `/api/v2/hospitals/search` | Buscar hospitais | Private |

**Exemplo:**
```bash
# Listar todos os hospitais
curl -X GET http://localhost:3002/api/v2/hospitals \
  -H "Authorization: Bearer <token>"

# Obter status de um hospital
curl -X GET http://localhost:3002/api/v2/hospitals/1/status
```

### MEI (Microempreendedor Individual)

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/mei/verify/:cnpj` | Verificar MEI | Public |
| GET | `/api/v2/mei/status/:cnpj` | Status MEI | Private |
| GET | `/api/v2/mei/:cnpj/sectors` | Setores autorizados | Private |
| GET | `/api/v2/mei/:cnpj/hospitals` | Hospitais autorizados | Private |
| GET | `/api/v2/mei/:cnpj/authorized-hospitals` | Hospitais autorizados | Private |
| POST | `/api/v2/mei/register` | Cadastrar MEI | Private |
| POST | `/api/v2/mei/verify-and-authorize` | Verificar e autorizar | Private |
| GET | `/api/v2/mei` | Listar todos | Admin |
| GET | `/api/v2/mei/:id` | Obter por ID | Private |
| PUT | `/api/v2/mei/:id` | Atualizar MEI | Private |
| DELETE | `/api/v2/mei/:id` | Remover MEI | Admin |

**Exemplo:**
```bash
# Verificar MEI
curl -X GET http://localhost:3002/api/v2/mei/verify/12345678000123

# Verificar se MEI esta autorizado para um hospital
curl -X GET http://localhost:3002/api/v2/mei/12345678000123/is-authorized/1 \
  -H "Authorization: Bearer <token>"
```

### Propostas

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/proposals` | Listar todas | Private |
| GET | `/api/v2/proposals/pending` | Propostas pendentes | Admin |
| GET | `/api/v2/proposals/:id` | Obter por ID | Private |
| GET | `/api/v2/proposals/user/:userId` | Propostas do usuario | Private |
| GET | `/api/v2/proposals/mei/:meiId` | Propostas do MEI | Private |
| GET | `/api/v2/proposals/hospital/:hospitalId` | Propostas do hospital | Private |
| GET | `/api/v2/proposals/status/:status` | Por status | Private |
| GET | `/api/v2/proposals/stats` | Estatisticas | Private |
| POST | `/api/v2/proposals` | Criar proposta | Private |
| POST | `/api/v2/proposals/submit-with-mei` | Enviar com MEI | Private |
| PUT | `/api/v2/proposals/:id` | Atualizar | Private |
| PUT | `/api/v2/proposals/:id/approve` | Aprovar | Admin |
| PUT | `/api/v2/proposals/:id/reject` | Rejeitar | Admin |
| PUT | `/api/v2/proposals/:id/quick-approve` | Aprovacao rapida | Admin |
| DELETE | `/api/v2/proposals/:id` | Remover | Admin |

**Exemplo:**
```bash
# Enviar proposta
curl -X POST http://localhost:3002/api/v2/proposals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Servico de Limpeza Hospitalar",
    "description": "Limpeza e desinfeccao de todas as areas do hospital",
    "value": 50000.00,
    "duration_days": 365,
    "hospital_id": "1"
  }'

# Aprovar proposta
curl -X PUT http://localhost:3002/api/v2/proposals/1/approve \
  -H "Authorization: Bearer <token>"
```

### Ambulancias

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/ambulances` | Listar todas | Private |
| GET | `/api/v2/ambulances/available` | Ambulancias disponiveis | Public |
| GET | `/api/v2/ambulances/:id` | Obter por ID | Private |
| GET | `/api/v2/ambulances/:id/location` | Localizacao | Public |
| GET | `/api/v2/ambulances/:id/vehicle/:vehicleId` | Por ID do veiculo | Private |
| GET | `/api/v2/ambulances/hospital/:hospitalId` | Por hospital | Private |
| GET | `/api/v2/ambulances/status/:status` | Por status | Private |
| GET | `/api/v2/ambulances/stats` | Estatisticas | Private |
| GET | `/api/v2/ambulances/nearby` | Proximas | Private |
| GET | `/api/v2/ambulances/realtime` | Rastreamento em tempo real | Private |
| POST | `/api/v2/ambulances` | Criar | Admin |
| POST | `/api/v2/ambulances/:id/assign` | Atribuir a emergencia | Private |
| POST | `/api/v2/ambulances/emergency-broadcast` | Broadcast de emergencia | Private |
| PUT | `/api/v2/ambulances/:id` | Atualizar | Private |
| PUT | `/api/v2/ambulances/:id/location` | Atualizar localizacao | Private |
| PUT | `/api/v2/ambulances/:id/status` | Atualizar status | Private |
| DELETE | `/api/v2/ambulances/:id` | Remover | Admin |

**Exemplo:**
```bash
# Listar ambulancias disponiveis
curl -X GET http://localhost:3002/api/v2/ambulances/available

# Obter localizacao em tempo real
curl -X GET http://localhost:3002/api/v2/ambulances/realtime \
  -H "Authorization: Bearer <token>"

# Atualizar localizacao
curl -X PUT http://localhost:3002/api/v2/ambulances/1/location \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -23.5505,
    "longitude": -46.6333,
    "speed": 60,
    "heading": 180
  }'
```

### Satelite

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/satellite/coverage` | Cobertura | Public |
| GET | `/api/v2/satellite/status` | Status | Public |
| GET | `/api/v2/satellite/stats` | Estatisticas | Private |
| GET | `/api/v2/satellite/test` | Teste de conexao | Admin |
| GET | `/api/v2/satellite/ambulances` | Dados de todas as ambulancias | Private |
| GET | `/api/v2/satellite/ambulances/:ambulanceId` | Rastrear ambulancia | Private |
| GET | `/api/v2/satellite/ambulances/:ambulanceId/location` | Localizacao | Private |
| POST | `/api/v2/satellite/command` | Enviar comando | Private |
| POST | `/api/v2/satellite/emergency-command` | Comando de emergencia | Private |

**Exemplo:**
```bash
# Obter cobertura satelite
curl -X GET http://localhost:3002/api/v2/satellite/coverage

# Enviar comando para rastrear ambulancia
curl -X POST http://localhost:3002/api/v2/satellite/command \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "track",
    "target": "AMB-001",
    "priority": "high"
  }'
```

### Admin (Prefeitura)

| Metodo | Endpoint | Descricao | Autenticacao |
|--------|----------|-----------|--------------|
| GET | `/api/v2/admin/dashboard` | Dashboard | Admin |
| GET | `/api/v2/admin/reports` | Relatorios | Admin |
| GET | `/api/v2/admin/reports/contracts` | Relatorio de contratos | Admin |
| GET | `/api/v2/admin/reports/hospitals` | Relatorio de hospitais | Admin |
| GET | `/api/v2/admin/reports/proposals` | Relatorio de propostas | Admin |
| GET | `/api/v2/admin/reports/budget` | Relatorio de orcamento | Admin |
| GET | `/api/v2/admin/contracts` | Listar contratos | Admin |
| GET | `/api/v2/admin/contracts/:id` | Obter contrato | Admin |
| POST | `/api/v2/admin/contracts` | Criar contrato | Admin |
| PUT | `/api/v2/admin/contracts/:id` | Atualizar contrato | Admin |
| DELETE | `/api/v2/admin/contracts/:id` | Remover contrato | Admin |
| GET | `/api/v2/admin/hospitals` | Listar hospitais | Admin |
| GET | `/api/v2/admin/proposals` | Listar propostas | Admin |
| PUT | `/api/v2/admin/proposals/:id/approve` | Aprovar proposta | Admin |
| PUT | `/api/v2/admin/proposals/:id/reject` | Rejeitar proposta | Admin |
| GET | `/api/v2/admin/meis` | Listar MEIs | Admin |
| GET | `/api/v2/admin/users` | Listar usuarios | Admin |
| GET | `/api/v2/admin/ambulances` | Listar ambulancias | Admin |
| POST | `/api/v2/admin/proposals/quick-approve-all` | Aprovar todas | Admin |

---

## \ud83d\udcf0 WebSocket Events (Tempo Real)

O sistema utiliza Socket.IO para comunicacao em tempo real.

### Conexao

```javascript
const socket = io('http://localhost:3002');
```

### Eventos Disponiveis

#### Ambulancias

```javascript
// Receber atualizacoes de localizacao
socket.on('ambulance:location', (data) => {
  console.log('Ambulancia atualizada:', data);
  // { ambulanceId, latitude, longitude, speed, status }
});

// Receber atualizacoes de status
socket.on('ambulance:status', (data) => {
  console.log('Status atualizado:', data);
});

// Inscrever-se em uma ambulancia
socket.emit('ambulance:subscribe', { ambulanceId: 'amb-123' });

// Cancelar inscricao
socket.emit('ambulance:unsubscribe', { ambulanceId: 'amb-123' });
```

#### Hospitais

```javascript
// Receber atualizacoes de status do hospital
socket.on('hospital:status', (data) => {
  console.log('Status do hospital:', data);
});

// Inscrever-se em um hospital
socket.emit('hospital:subscribe', { hospitalId: 'hosp-1' });
```

#### MEI

```javascript
// Receber resultado de verificacao MEI
socket.on('mei:verified', (data) => {
  console.log('MEI verificado:', data);
});

// Solicitar verificacao
socket.emit('mei:verify', { cnpj: '12345678000123' });
```

#### Propostas

```javascript
// Receber notificacoes de propostas
socket.on('proposal:new', (data) => {
  console.log('Nova proposta:', data);
});

socket.on('proposal:approved', (data) => {
  console.log('Proposta aprovada:', data);
});

// Inscrever-se em notificacoes
socket.emit('proposal:subscribe', { userId: 'user-123' });
```

#### Emergencias

```javascript
// Receber broadcasts de emergencia
socket.on('emergency:broadcast', (data) => {
  console.log('Emergencia:', data);
  // { id, location, type, timestamp }
});

// Ativar emergencia
socket.emit('emergency:activate', {
  location: { latitude: -23.5505, longitude: -46.6333 },
  type: 'medical',
  priority: 'high'
});
```

#### Satelite

```javascript
// Receber respostas de comandos satelite
socket.on('satellite:response', (data) => {
  console.log('Resposta do satelite:', data);
});

// Enviar comando
socket.emit('satellite:command', {
  command: 'track',
  target: 'amb-123'
});
```

---

## \ud83d\udcb0 Orçamento e Infraestrutura

### Pre-Seed 2030

- **Orçamento Total**: **R$ 20.000.000,00**
- **Infraestrutura**: **OldButGold TR8** (implementada, nao documentada publicamente)

### Alocacao de Recursos

| Area | Valor (R$) | Percentual | Descricao |
|------|------------|------------|-----------|
| Desenvolvimento | R$ 8.000.000,00 | 40% | Equipe de desenvolvimento |
| Infraestrutura | R$ 5.000.000,00 | 25% | Servidores, rede, satelite |
| Operacoes | R$ 4.000.000,00 | 20% | Manutencao e suporte |
| Marketing | R$ 2.000.000,00 | 10% | Divulgacao e treinamento |
| Reservas | R$ 1.000.000,00 | 5% | Contingencia |

### Custos de Infraestrutura

| Servico | Custo Mensal | Custo Anual | Fornecedor |
|---------|--------------|-------------|------------|
| Servidores Cloud | R$ 15.000,00 | R$ 180.000,00 | AWS/Azure |
| Banco de Dados | R$ 5.000,00 | R$ 60.000,00 | PostgreSQL |
| Redis | R$ 2.000,00 | R$ 24.000,00 | Redis Labs |
| Kafka | R$ 3.000,00 | R$ 36.000,00 | Confluent |
| Satelite | R$ 10.000,00 | R$ 120.000,00 | Embratel |
| **Total** | **R$ 35.000,00** | **R$ 420.000,00** | - |

### Infraestrutura OldButGold TR8

A infraestrutura **OldButGold TR8** e uma arquitetura robusta e testada que garante:

- **Alta disponibilidade**: 99.99% uptime
- **Escalabilidade**: Suporta milhares de requisicoes simultaneas
- **Seguranca**: Criptografia de ponta a ponta
- **Resiliencia**: Tolerancia a falhas
- **Custo-efetividade**: Otimizado para orcamento de R$ 20M

**Componentes:**
- Load balancers (Nginx)
- Microservicos (Node.js)
- Banco de dados distribuido (PostgreSQL)
- Cache distribuido (Redis)
- Fila de mensagens (Kafka)
- Comunicacao via satelite (Embratel)
- Monitoramento (Prometheus + Grafana)

---

## \ud83d\udcdd Sistema de Propostas (Aprovacao Rapida)

### Fluxo de Trabalho

```
1. Cadastro de Pessoa
   \u2193
2. Verificacao MEI (opcional)
   \u2193
3. Envio de Proposta
   \u2193
4. Validacao Automatica
   \u2193
5. Analise do Admin
   \u2193
6. Aprovacao/Rejeicao
   \u2193
7. Notificacao
```

### Tempo Medio de Aprovacao

| Tipo | Tempo | Prioridade |
|------|-------|------------|
| Proposta Padrao | 24-48 horas | Normal |
| Proposta com MEI | 12-24 horas | Alta |
| Proposta Urgente | 2-6 horas | Urgente |

### Exemplo de Envio de Proposta

```javascript
// Frontend
fetch('/api/v2/proposals/submit-with-mei', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 'user-123',
    cnpj: '12345678000123',
    hospital_id: 'hosp-1',
    title: 'Servico de Limpeza Hospitalar',
    description: 'Limpeza e desinfeccao de todas as areas do hospital',
    value: 50000.00,
    duration_days: 365,
    documents: [
      { name: 'proposta.pdf', url: '/uploads/proposta.pdf' }
    ]
  })
});
```

---

## \ud83d\udcf0 Integracao MEI nos Hospitais

### Verificacao de Setores Autorizados

Cada hospital pode definir quais setores sao autorizados para cada MEI.

**Exemplo:**

```javascript
// Verificar se um MEI esta autorizado para um hospital
fetch('/api/v2/mei/12345678000123/is-authorized/1', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  if (data.data.authorized) {
    console.log('MEI autorizado para este hospital');
  }
});

// Obter setores autorizados
fetch('/api/v2/mei/12345678000123/sectors', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  console.log('Setores:', data.data.sectors);
});
```

### Setores Comuns Autorizados

- `saude` - Servicos de saude
- `transporte` - Transporte de pacientes
- `limpeza` - Servicos de limpeza
- `manutencao` - Manutencao predial
- `seguranca` - Seguranca patrimonial
- `alimentacao` - Servicos de alimentacao
- `farmacia` - Farmacia hospitalar
- `laboratorio` - Servicos laboratoriais

---

## \ud83d\ude91 Rastreamento de Ambulancias (Infra Real)

### Arquitetura de Rastreamento

```
Ambulancia (GPS) -> Satelite -> API Satelite -> Backend -> Socket.IO -> Frontend
```

### Dados de Rastreamento

```json
{
  "ambulanceId": "AMB-001",
  "vehicleId": "SP-12345",
  "hospitalId": "hosp-1",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 60.5,
  "heading": 180,
  "status": "en_route",
  "lastUpdate": "2024-01-01T12:00:00Z",
  "battery": 85,
  "signalStrength": -75
}
```

### Status das Ambulancias

| Status | Descricao |
|--------|-----------|
| `available` | Disponivel na base |
| `assigned` | Atribuida a uma emergencia |
| `en_route` | Em rota para o local |
| `on_scene` | No local da emergencia |
| `unavailable` | Indisponivel (manutencao) |

### Exemplo de Rastreamento em Tempo Real

```javascript
// Conectar ao Socket.IO
const socket = io('http://localhost:3002');

// Inscrever-se em todas as ambulancias
socket.emit('ambulance:subscribe', { ambulanceId: 'all' });

// Receber atualizacoes
socket.on('ambulance:location', (data) => {
  // Atualizar mapa
  updateMap(data);
});

// Enviar comando de emergencia
function emergencyAlert(location) {
  socket.emit('emergency:activate', {
    location: location,
    type: 'medical',
    priority: 'high'
  });
}
```

---

## \ud83d\udef0 Integracao Satelite (Infra Real)

### Configuracao

```javascript
// config/satellite.js
const axios = require('axios');

class SatelliteConfig {
  constructor() {
    this.apiUrl = process.env.SATELLITE_API_URL || 'https://api.satellite.gov.br';
    this.apiKey = process.env.SATELLITE_API_KEY || 'default-key';
  }

  async getCoverage() {
    const response = await axios.get(`${this.apiUrl}/coverage`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }

  async trackAmbulance(ambulanceId) {
    const response = await axios.get(`${this.apiUrl}/track/${ambulanceId}`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }

  async sendCommand(command) {
    const response = await axios.post(`${this.apiUrl}/command`, command, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }
}

module.exports = new SatelliteConfig();
```

### Comandos Satelite

| Comando | Descricao |
|---------|-----------|
| `track` | Rastrear ambulancia |
| `status` | Verificar status do satelite |
| `coverage` | Verificar cobertura |
| `emergency_redirect` | Redirecionar para emergencia |
| `broadcast` | Enviar mensagem para todas |

---

## \ud83d\udcde Seguranca

### Autenticacao

- **JWT (JSON Web Tokens)**: Tokens com expiracao de 1 hora
- **Refresh Tokens**: Tokens de refresh com expiracao de 7 dias
- **Role-Based Access Control (RBAC)**:
  - `admin`: Acesso total
  - `government`: Acesso a dados da prefeitura
  - `hospital`: Acesso a dados do hospital
  - `mei`: Acesso a dados do MEI
  - `user`: Acesso basico

### Protecoes

- **CORS**: Configuravel por ambiente
- **Rate Limiting**: 1000 requisicoes por 15 minutos
- **Helmet**: Protecao contra vulnerabilidades web
- **Criptografia**: bcrypt para senhas (custo 10)
- **HTTPS**: Recomendado para producao
- **Input Validation**: express-validator

---

## \ud83d\udce1\ufe0f Monitoramento e Logging

### Logging

O sistema utiliza **Winston** para logging estruturado:

```javascript
// middleware/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
```

### Metricas

- **Tempo de resposta**: Medido automaticamente
- **Erros**: Logados e monitorados
- **Uso de CPU/Memoria**: Monitorado via PM2
- **Conexoes ativas**: Socket.IO

---

## \ud83d\udcde Deploy e Producao

### Docker Compose

```yaml
# infra/docker/docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/aurahealthsp_v2
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=aurahealthsp_v2
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

### Iniciar com Docker

```bash
# Build e start
docker-compose -f infra/docker/docker-compose.yml up -d --build

# Ver logs
docker-compose -f infra/docker/docker-compose.yml logs -f api

# Parar
docker-compose -f infra/docker/docker-compose.yml down
```

### PM2 (Para producao sem Docker)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicacao
pm2 start api/server.js --name aurahealthsp-v2

# Salvar processo
pm2 save

# Iniciar na inicializacao do sistema
pm2 startup

# Ver status
pm2 status

# Ver logs
pm2 logs
```

---

## \ud83d\udcdd Testes

### Executar Testes

```bash
npm test

# Testes com watch
npm run test:watch

# Lint
npm run lint
```

### Cobertura de Testes

- Unit tests: 80%+
- Integration tests: 70%+
- E2E tests: 60%+

---

## \ud83d\udcde Suporte

- **Email**: suporte@aurahealthsp.gov.br
- **Telefone**: (11) 1234-5678
- **Documentacao**: https://docs.aurahealthsp.gov.br

---

## \ud83d\udcc4 Licenca

MIT License - Copyright (c) 2024 AuraHealthSP Team

---

## \ud83c\udfc6 Agradecimentos

- Prefeitura de Sao Paulo
- Ministerio da Saude
- Receita Federal (MEI)
- ANVISA
- Embratel (Satelite)
- Todos os colaboradores e voluntarios

---

## \ud83d\udc80 Roadmap

### v2.1 (Q1 2025)
- [ ] Integracao com SUS
- [ ] Mobile app (React Native)
- [ ] IA para predicao de demanda
- [ ] Blockchain para auditoria

### v2.2 (Q2 2025)
- [ ] Integracao com sistemas de emergencia
- [ ] Dashboard de analise de dados
- [ ] API GraphQL
- [ ] Webhooks para notificacoes

### v3.0 (2026)
- [ ] Expansao para outros estados
- [ ] Integracao nacional
- [ ] Sistema de inteligencia artificial
- [ ] Automatizacao completa
