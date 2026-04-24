.PHONY: help up down build test deploy migrate backup health monitor

GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help:
	@echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
	@echo -e "${GREEN}║  AuraHealthSP - Comandos           ║${NC}"
	@echo -e "${GREEN}╚════════════════════════════════════╝${NC}\n"
	@echo "🚀 Desenvolvimento:"
	@echo "  make up              # Iniciar todos os serviços"
	@echo "  make down            # Parar serviços"
	@echo "  make logs            # Ver logs em tempo real"
	@echo "  make build           # Rebuild das imagens"
	@echo ""
	@echo "🧪 Testes & Qualidade:"
	@echo "  make test            # Rodar testes"
	@echo "  make lint            # Rodar linter"
	@echo "  make coverage        # Relatório de cobertura"
	@echo ""
	@echo "🗄️  Banco de Dados:"
	@echo "  make migrate         # Executar migrações"
	@echo "  make backup          # Backup do PostgreSQL"
	@echo "  make restore FILE=x  # Restaurar backup"
	@echo ""
	@echo "🔍 Monitoramento:"
	@echo "  make health          # Health check de serviços"
	@echo "  make metrics         # Abrir Prometheus"
	@echo "  make dashboard       # Abrir Grafana"
	@echo ""
	@echo "🚢 Deploy:"
	@echo "  make deploy-k8s      # Deploy para Kubernetes"
	@echo "  make rollback        # Rollback último deploy"

up:
	@echo -e "${YELLOW}🚀 Iniciando AuraHealthSP...${NC}"
	@docker compose -f infra/docker/docker-compose.yml up -d
	@echo -e "${GREEN}✅ Serviços iniciados!${NC}"
	@echo "   🌐 Frontend: http://localhost:3000"
	@echo "   🔌 API: http://localhost:3001"
	@echo "   📊 Swagger: http://localhost:3001/api-docs"
	@echo "   📈 Prometheus: http://localhost:9090"

down:
	@echo -e "${YELLOW}🛑 Parando serviços...${NC}"
	@docker compose -f infra/docker/docker-compose.yml down -v

build:
	@echo -e "${YELLOW}🔨 Construindo imagens...${NC}"
	@docker compose -f infra/docker/docker-compose.yml build --no-cache

logs:
	@docker compose -f infra/docker/docker-compose.yml logs -f --tail=100

test:
	@echo -e "${YELLOW}🧪 Executando testes...${NC}"
	@cd backend && npm test
	@cd frontend && npm test

lint:
	@echo -e "${YELLOW}🔍 Rodando linter...${NC}"
	@cd backend && npm run lint
	@cd frontend && npm run lint

migrate:
	@echo -e "${YELLOW}🗄️  Executando migrações...${NC}"
	@docker compose -f infra/docker/docker-compose.yml exec -T postgres \
		psql -U $${DB_USER:-aura} -d $${DB_NAME:-aurahealth} \
		-f /docker-entrypoint-initdb.d/init-db.sh

backup:
	@echo -e "${YELLOW}💾 Criando backup...${NC}"
	@mkdir -p backups
	@docker compose -f infra/docker/docker-compose.yml exec -T postgres \
		pg_dump -U $${DB_USER:-aura} $${DB_NAME:-aurahealth} | \
		gzip > backups/aurahealth-$$(date +%Y%m%d-%H%M%S).sql.gz
	@echo -e "${GREEN}✅ Backup: backups/aurahealth-*.sql.gz${NC}"

health:
	@echo -e "${YELLOW}🔍 Health check...${NC}"
	@curl -sf http://localhost:3001/health > /dev/null && echo "✅ API" || echo "❌ API"
	@curl -sf http://localhost/health > /dev/null && echo "✅ Frontend" || echo "❌ Frontend"
	@docker compose -f infra/docker/docker-compose.yml exec -T postgres pg_isready -q && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"

monitor:
	@echo -e "${GREEN}📊 Abrindo dashboards...${NC}"
	@open http://localhost:3002 2>/dev/null || xdg-open http://localhost:3002 2>/dev/null || echo "Grafana: http://localhost:3002"

deploy-k8s:
	@echo -e "${YELLOW}🚢 Deploy Kubernetes...${NC}"
	@kubectl apply -f infra/k8s/namespaces.yml
	@kubectl apply -f infra/k8s/configmaps.yml
	@kubectl apply -f infra/k8s/secrets.yml --dry-run=client -o yaml | kubectl apply -f -
	@kubectl apply -f infra/k8s/
	@kubectl rollout status deployment -n aurahealth --timeout=300s
	@echo -e "${GREEN}✅ Deploy concluído!${NC}"