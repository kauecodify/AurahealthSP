# AuraHealthSP v2

## Sistema de Gestão de Saúde Pública com Integração Hospitalar, MEI e Propostas

### Visão Geral

O AuraHealthSP v2 é um sistema completo para gestão de serviços de saúde pública, com foco em:
- **Visualização de prestação de serviços hospitalares**
- **Integração MEI** para verificação de setores hospitalares
- **Gestão de contratos** para prefeituras
- **Cadastro de prestadores** e envio de propostas
- **Rastreamento de ambulâncias** em tempo real
- **Integração via satélite** para cobertura ampla

---

## 🚀 Funcionalidades Principais

### 1. **Visualização de Serviços Hospitalares**
- Dashboard em tempo real de todos os hospitais
- Status de leitos (disponíveis, ocupados, UTI)
- Níveis de oxigênio e equipamentos
- Alertas de capacidade crítica

### 2. **Integração MEI**
- Verificação automática de CNPJ MEI
- Validação de setores autorizados
- Integração com gateway do governo
- Certificação digital de prestadores

### 3. **Administrador de Hospitais (Prefeitura)**
- Painel de controle completo
- Visualização de todos os contratos
- Gestão de prestadores de serviço
- Relatórios de desempenho
- Alertas de renovação de contratos

### 4. **Sistema de Propostas**
- Cadastro de pessoas físicas e jurídicas
- Envio de propostas online
- Avaliação e aprovação rápida
- Integração com MEI para validação
- Notificações por email

### 5. **Rastreamento de Ambulâncias**
- GPS em tempo real
- Roteamento inteligente
- Status de disponibilidade
- Histórico de chamadas
- Integração com hospitais

### 6. **Integração Satélite**
- Cobertura em áreas remotas
- Comunicação via satélite
- Backup de conectividade
- Monitoramento de frota

---

## 📦 Estrutura do Projeto

```
aurahealthsp-v2/
├── api/
│   └── server.js              # Servidor principal
├── config/
│   ├── database.js            # Configuração do banco
│   ├── redis.js               # Configuração Redis
│   └── satellite.js           # Configuração satélite
├── controllers/
│   ├── hospital.js            # Controlador de hospitais
│   ├── mei.js                 # Controlador MEI
│   ├── proposal.js            # Controlador de propostas
│   └── ambulance.js           # Controlador de ambulâncias
├── models/
│   ├── Hospital.js            # Modelo Hospital
│   ├── MEI.js                 # Modelo MEI
│   ├── Proposal.js            # Modelo Proposta
│   ├── User.js                # Modelo Usuário
│   └── Ambulance.js           # Modelo Ambulância
├── routes/
│   ├── admin.js               # Rotas admin
│   ├── api.js                 # Rotas API
│   ├── hospital.js            # Rotas hospitais
│   ├── mei.js                 # Rotas MEI
│   └── proposal.js            # Rotas propostas
├── services/
│   ├── meiService.js          # Serviço MEI
│   ├── satelliteService.js   # Serviço satélite
│   ├── ambulanceService.js    # Serviço ambulância
│   └── contractService.js     # Serviço contratos
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
│   ├── admin/
│   │   └── dashboard.html     # Dashboard admin
│   ├── hospital/
│   │   └── view.html          # Visualização hospitais
│   ├── proposals/
│   │   └── submit.html        # Envio propostas
│   └── mei/
│       └── verify.html        # Verificação MEI
├── v2/
│   └── index.html             # Página principal v2
├── package.json
├── .env
└── README.md
```

---

## 🔧 Configuração

### Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7.0
- Docker (opcional)

### Instalação

```bash
# Clonar o repositório
cd aurahealthsp-v2

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar o servidor
npm run dev
```

### Docker (Recomendado)

```bash
# Build e run
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 🏃‍♂️ Uso

### Iniciar o Servidor

```bash
npm start        # Produção
npm run dev     # Desenvolvimento
```

### Acessar o Sistema

- **Admin (Prefeitura)**: `http://localhost:3002/admin`
- **Visualização Hospitais**: `http://localhost:3002/hospitals`
- **Envio de Propostas**: `http://localhost:3002/proposals`
- **Verificação MEI**: `http://localhost:3002/mei/verify`
- **API**: `http://localhost:3002/api/v2`

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v2/auth/login` | Login |
| POST | `/api/v2/auth/register` | Cadastro |
| POST | `/api/v2/auth/refresh` | Refresh token |

### Hospitais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/hospitals` | Listar todos |
| GET | `/api/v2/hospitals/:id` | Obter por ID |
| GET | `/api/v2/hospitals/:id/status` | Status em tempo real |
| POST | `/api/v2/hospitals` | Criar hospital |
| PUT | `/api/v2/hospitals/:id` | Atualizar hospital |
| DELETE | `/api/v2/hospitals/:id` | Remover hospital |

### MEI

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/mei/verify/:cnpj` | Verificar MEI |
| GET | `/api/v2/mei/status/:cnpj` | Status MEI |
| POST | `/api/v2/mei/register` | Cadastrar MEI |
| GET | `/api/v2/mei/hospitals/:cnpj` | Hospitais autorizados |

### Propostas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/proposals` | Listar propostas |
| GET | `/api/v2/proposals/:id` | Obter proposta |
| POST | `/api/v2/proposals` | Criar proposta |
| PUT | `/api/v2/proposals/:id/approve` | Aprovar proposta |
| PUT | `/api/v2/proposals/:id/reject` | Rejeitar proposta |
| GET | `/api/v2/proposals/:id/status` | Status proposta |

### Ambulâncias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/ambulances` | Listar ambulâncias |
| GET | `/api/v2/ambulances/:id` | Obter ambulância |
| GET | `/api/v2/ambulances/:id/location` | Localização em tempo real |
| POST | `/api/v2/ambulances/:id/assign` | Atribuir ambulância |
| GET | `/api/v2/ambulances/available` | Ambulâncias disponíveis |

### Satélite

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/satellite/coverage` | Cobertura satélite |
| GET | `/api/v2/satellite/status` | Status conexão |
| POST | `/api/v2/satellite/command` | Enviar comando |

### Admin (Prefeitura)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v2/admin/contracts` | Listar contratos |
| GET | `/api/v2/admin/contracts/:id` | Obter contrato |
| POST | `/api/v2/admin/contracts` | Criar contrato |
| PUT | `/api/v2/admin/contracts/:id` | Atualizar contrato |
| GET | `/api/v2/admin/dashboard` | Dashboard admin |
| GET | `/api/v2/admin/reports` | Relatórios |

---

## 📊 Banco de Dados

### Esquema

```sql
-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, hospital, mei, government
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospitais
CREATE TABLE hospitals (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    address JSONB NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    icu_beds INTEGER DEFAULT 0,
    oxygen_level DECIMAL(5, 2) DEFAULT 100,
    status VARCHAR(50) DEFAULT 'available', -- available, busy, critical
    phone VARCHAR(20),
    email VARCHAR(255),
    contract_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- MEI
CREATE TABLE mei (
    id UUID PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_cpf VARCHAR(11) NOT NULL,
    sectors JSONB, -- Setores autorizados
    registration_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, pending, suspended, expired
    verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Propostas
CREATE TABLE proposals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    mei_id UUID,
    hospital_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    duration_days INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    documents JSONB, -- Lista de documentos
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mei_id) REFERENCES mei(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Ambulâncias
CREATE TABLE ambulances (
    id UUID PRIMARY KEY,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    hospital_id UUID,
    type VARCHAR(50) NOT NULL, -- basic, advanced, neonatal
    status VARCHAR(50) DEFAULT 'available', -- available, assigned, en_route, on_scene, unavailable
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(10, 2),
    heading DECIMAL(10, 2),
    last_update TIMESTAMP DEFAULT NOW(),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    equipment JSONB, -- Lista de equipamentos
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Contratos
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    hospital_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled, renewed
    auto_renewal BOOLEAN DEFAULT false,
    payment_terms JSONB,
    scope_of_work TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Setores Hospitalares
CREATE TABLE hospital_sectors (
    id UUID PRIMARY KEY,
    hospital_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 0,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    mei_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Logs de Atividade
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação.

### Login

```bash
curl -X POST http://localhost:3002/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@prefeitura.gov.br",
    "password": "senha-segura"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@prefeitura.gov.br",
    "role": "admin"
  }
}
```

---

## 🚑 Integração com Ambulâncias

### Rastreamento em Tempo Real

```javascript
// Conexão WebSocket para rastreamento
const socket = io('http://localhost:3002');

socket.on('ambulance:location', (data) => {
  console.log('Ambulância atualizada:', data);
  // { ambulanceId, latitude, longitude, speed, status }
});

socket.emit('ambulance:subscribe', { ambulanceId: 'amb-123' });
```

### API de Localização

```bash
# Obter localização atual
curl -X GET http://localhost:3002/api/v2/ambulances/amb-123/location \
  -H "Authorization: Bearer <token>"
```

---

## 🛰️ Integração Satélite

### Configuração

```javascript
// services/satelliteService.js
const axios = require('axios');

class SatelliteService {
  constructor() {
    this.apiUrl = process.env.SATELLITE_API_URL;
    this.apiKey = process.env.SATELLITE_API_KEY;
  }

  async getCoverage() {
    const response = await axios.get(`${this.apiUrl}/coverage`, {
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

  async getStatus() {
    const response = await axios.get(`${this.apiUrl}/status`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }
}

module.exports = new SatelliteService();
```

### Uso

```javascript
const satellite = require('./services/satelliteService');

// Obter cobertura
const coverage = await satellite.getCoverage();

// Enviar comando
const result = await satellite.sendCommand({
  type: 'track',
  target: 'ambulance-123',
  priority: 'high'
});
```

---

## 🏥 Integração MEI

### Verificação de CNPJ

```bash
curl -X GET http://localhost:3002/api/v2/mei/verify/12345678000123 \
  -H "Authorization: Bearer <token>"
```

Resposta:
```json
{
  "cnpj": "12345678000123",
  "companyName": "MEI Saúde LTDA",
  "ownerName": "João Silva",
  "ownerCpf": "12345678901",
  "sectors": ["Saúde", "Transportes", "Serviços"],
  "registrationDate": "2023-01-01",
  "expiryDate": "2024-01-01",
  "status": "active",
  "verified": true,
  "hospitals": [
    {
      "id": "hosp-001",
      "name": "Hospital Central",
      "authorized": true
    }
  ]
}
```

### Webhook MEI

```javascript
// Configurar webhook para notificações do MEI
app.post('/api/v2/mei/webhook', (req, res) => {
  const signature = req.headers['x-mei-signature'];
  const payload = req.body;
  
  // Verificar assinatura
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Processar notificação
  switch (payload.event) {
    case 'mei.verified':
      // Atualizar status do MEI
      break;
    case 'mei.expired':
      // Notificar sobre expiração
      break;
    case 'mei.suspended':
      // Suspender acesso
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 📝 Sistema de Propostas

### Fluxo de Aprovação

```
1. Usuário cadastra propostas
   ↓
2. Sistema valida MEI
   ↓
3. Envia para análise
   ↓
4. Admin revisa
   ↓
5. Aprova/Rejeita
   ↓
6. Notifica usuário
```

### Envio de Proposta

```bash
curl -X POST http://localhost:3002/api/v2/proposals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Serviço de Limpeza Hospitalar",
    "description": "Limpeza e desinfecção de todas as áreas do hospital",
    "value": 50000.00,
    "durationDays": 365,
    "meiId": "mei-123",
    "hospitalId": "hosp-001",
    "documents": [
      {
        "name": "proposta.pdf",
        "url": "/uploads/proposta.pdf"
      }
    ]
  }'
```

---

## 📊 Dashboard Admin (Prefeitura)

### Funcionalidades

- **Visão Geral**:
  - Total de hospitais
  - Total de ambulâncias
  - Propostas pendentes
  - Contratos ativos

- **Gestão de Contratos**:
  - Listagem de todos os contratos
  - Filtro por status (ativo, expirado, cancelado)
  - Alertas de renovação
  - Valor total dos contratos

- **Gestão de Hospitais**:
  - Status de todos os hospitais
  - Ocupação de leitos
  - Níveis de oxigênio
  - Alertas de capacidade crítica

- **Gestão de Propostas**:
  - Listagem de propostas
  - Filtro por status
  - Aprovação rápida
  - Histórico de propostas

- **Relatórios**:
  - Relatórios de desempenho
  - Estatísticas de atendimento
  - Análise de custos
  - Exportação de dados

---

## 💰 Orçamento e Custos

### Pré-Seed 2030

- **Orçamento Total**: R$ 20.000.000,00
- **Alocação**:
  - Desenvolvimento: R$ 8.000.000,00
  - Infraestrutura: R$ 5.000.000,00
  - Operações: R$ 4.000.000,00
  - Marketing: R$ 2.000.000,00
  - Reservas: R$ 1.000.000,00

### Custos de Infraestrutura

- **Mensal**: R$ 5.000,00
- **Anual**: R$ 60.000,00
- **Inclui**:
  - Servidores cloud
  - Banco de dados
  - Redis
  - Kafka
  - Satélite
  - Manutenção

---

## 🛡️ Segurança

- **Autenticação**: JWT com refresh tokens
- **Autorização**: RBAC (Role-Based Access Control)
- **CORS**: Configurável por ambiente
- **Rate Limiting**: 1000 requisições por 15 minutos
- **Helmet**: Proteção contra vulnerabilidades web
- **Criptografia**: bcrypt para senhas
- **HTTPS**: Recomendado para produção

---

## 📞 Suporte

- **Email**: suporte@aurahealthsp.gov.br
- **Telefone**: (11) 1234-5678
- **Documentação**: https://docs.aurahealthsp.gov.br

---

## 📄 Licença

MIT License - Copyright (c) 2024 AuraHealthSP Team

---

## 🏆 Agradecimentos

- Prefeitura de São Paulo
- Ministério da Saúde
- Receita Federal (MEI)
- ANVISA
- Todos os colaboradores e voluntários
