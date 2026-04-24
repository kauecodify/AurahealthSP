/**
 * AuraHealthSP - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  window.TriageAI = new TriageAI();
  window.SupplyChain = new SupplyChain();
  window.BlockchainAudit = new BlockchainAudit();
  window.SocketClient = new SocketClient();
  
  // Navigation
  setupNavigation();
  
  // Event listeners
  setupEventListeners();
  
  // Initial load
  loadDashboard();
  loadBlockchainStats();
  
  // Connect WebSocket
  window.SocketClient.connect();
});

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active button
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Show selected view
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const viewId = e.target.dataset.view;
      document.getElementById(viewId).classList.add('active');
      
      // Load view-specific data
      if (viewId === 'audit') loadBlockchainBlocks();
    });
  });
}

function setupEventListeners() {
  // Emergency button
  document.getElementById('emergencyBtn')?.addEventListener('click', () => {
    document.getElementById('emergencyModal').classList.remove('hidden');
    logEmergencyAction('Protocolo de emergência ativado');
    
    // Broadcast via WebSocket
    window.SocketClient.emit('emergency:activate', {
      level: 'CRITICAL',
      activatedBy: 'operator',
      timestamp: new Date().toISOString()
    });
  });
  
  document.getElementById('closeEmergency')?.addEventListener('click', () => {
    document.getElementById('emergencyModal').classList.add('hidden');
    logEmergencyAction('Protocolo encerrado');
  });
  
  document.getElementById('dispatchSamu')?.addEventListener('click', () => {
    showToast('🚑 SAMU acionado com prioridade máxima', 'success');
    logEmergencyAction('SAMU despachado');
  });
  
  document.getElementById('alertHospitals')?.addEventListener('click', () => {
    showToast('📡 Todos os hospitais notificados', 'success');
    logEmergencyAction('Alerta enviado para rede hospitalar');
  });
  
  // New patient form
  document.getElementById('newPatientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const patient = {
      name: document.getElementById('patientName').value,
      symptoms: document.getElementById('patientSymptoms').value,
      age: parseInt(document.getElementById('patientAge').value),
      timestamp: new Date().toISOString()
    };
    
    try {
      // Analyze with AI
      const result = await window.TriageAI.analyze(patient);
      
      // Update UI
      addQueueItem({ ...patient, ...result });
      updatePatientCard(patient, result);
      
      // Show recommendation
      showRecommendation(result.recommendation);
      
      // Emit via WebSocket
      window.SocketClient.emit('patient:register', { 
        ...patient, 
        priority: result.priority,
        riskScore: result.score 
      });
      
      // Audit transaction
      window.BlockchainAudit.audit('PATIENT_TRIAGE', { patientId: patient.name, priority: result.priority });
      
      showToast(`✅ Triagem concluída: Prioridade ${result.priority}`, 'success');
      e.target.reset();
      
    } catch (error) {
      showToast('❌ Erro na triagem: ' + error.message, 'error');
      console.error('Triage error:', error);
    }
  });
  
  // Route calculation
  document.getElementById('calculateRoute')?.addEventListener('click', async () => {
    const [lat, lng] = document.getElementById('originSelect').value.split(',').map(Number);
    const origin = { lat, lng };
    const destination = document.getElementById('destinationSelect').value;
    const urgency = document.getElementById('urgencySelect').value;
    
    try {
      const route = await window.SupplyChain.calculateRoute(origin, destination, urgency);
      
      if (route.error) {
        showToast('⚠️ ' + route.error, 'warning');
        return;
      }
      
      // Update UI
      document.getElementById('eta').textContent = route.route.eta;
      document.getElementById('vehicle').textContent = `${route.vehicle.type === 'ambulance_advanced' ? '🚑' : '🚐'} #${route.vehicle.id.toUpperCase()}`;
      document.getElementById('distance').textContent = route.route.distance;
      
      document.getElementById('bedsCount').textContent = route.supplies.beds;
      document.getElementById('icuCount').textContent = route.supplies.icu;
      document.getElementById('o2Level').textContent = route.supplies.oxygen;
      document.getElementById('teamStatus').textContent = route.supplies.team;
      
      document.getElementById('routeResult').classList.remove('hidden');
      showToast('🗺️ Rota ótima calculada', 'success');
      
    } catch (error) {
      showToast('❌ Erro ao calcular rota: ' + error.message, 'error');
    }
  });
  
  document.getElementById('dispatchVehicle')?.addEventListener('click', () => {
    showToast('🚀 Veículo despachado com sucesso!', 'success');
    logEmergencyAction(`Veículo despachado para ${document.getElementById('destinationSelect').options[document.getElementById('destinationSelect').selectedIndex].text}`);
  });
  
  // Blockchain audit
  document.getElementById('refreshBlocks')?.addEventListener('click', loadBlockchainBlocks);
  
  document.getElementById('searchTx')?.addEventListener('click', () => {
    const query = document.getElementById('txSearch').value;
    if (!query) return;
    
    const results = window.BlockchainAudit.search(query);
    displayTransactionResults(results, query);
  });
  
  // Socket event listeners
  window.SocketClient.on('patient:updated', (data) => {
    addQueueItem(data);
    updateStats();
  });
  
  window.SocketClient.on('dashboard:refresh', () => {
    loadDashboard();
  });
  
  window.SocketClient.on('emergency:broadcast', (data) => {
    if (data.level === 'CRITICAL') {
      showToast('🚨 EMERGÊNCIA GLOBAL ATIVADA', 'error');
      document.getElementById('systemStatus').className = 'status-badge offline';
      document.getElementById('systemStatus').textContent = '● EMERGÊNCIA';
    }
  });
}

async function loadDashboard() {
  // Simulate API calls - replace with real fetch in production
  document.getElementById('waitingCount').textContent = Math.floor(Math.random() * 30) + 10;
  document.getElementById('bedsAvailable').textContent = Math.floor(Math.random() * 25) + 5;
  document.getElementById('avgTime').textContent = (Math.random() * 5 + 6).toFixed(1) + 'min';
  document.getElementById('txCount').textContent = (Math.random() * 500 + 1000).toFixed(0) + 'k';
  
  // Load hospital markers
  loadHospitalMarkers();
  
  // Load initial queue
  loadTriageQueue();
}

function loadHospitalMarkers() {
  const container = document.getElementById('hospitalsMap');
  const hospitals = [
    { name: 'Hospital das Clínicas', beds: 42, status: 'available' },
    { name: 'Santa Casa', beds: 8, status: 'busy' },
    { name: 'UPA Zona Leste', beds: 2, status: 'critical' }
  ];
  
  container.innerHTML = hospitals.map(h => `
    <div class="hospital-marker ${h.status}" data-hospital="${h.name}">
      <strong>${h.name}</strong>
      <span class="beds">${h.beds} vagas</span>
    </div>
  `).join('');
}

function loadTriageQueue() {
  const queue = document.getElementById('triageQueue');
  const samplePatients = [
    { name: 'Maria S.', symptoms: 'Dor no peito, sudorese', priority: 'HIGH', timestamp: '2min atrás' },
    { name: 'João P.', symptoms: 'Febre 38.5°C', priority: 'MEDIUM', timestamp: '5min atrás' },
    { name: 'Ana L.', symptoms: 'Trauma leve', priority: 'LOW', timestamp: '8min atrás' }
  ];
  
  queue.innerHTML = samplePatients.map(p => `
    <div class="queue-item priority-${p.priority.toLowerCase()}">
      <div class="queue-info">
        <strong>${p.name}</strong>
        <small>${p.symptoms} • ${p.timestamp}</small>
      </div>
      <span class="priority-badge priority-${p.priority.toLowerCase()}">${p.priority}</span>
    </div>
  `).join('');
}

function addQueueItem(patient) {
  const queue = document.getElementById('triageQueue');
  const item = document.createElement('div');
  item.className = `queue-item priority-${patient.priority.toLowerCase()}`;
  item.innerHTML = `
    <div class="queue-info">
      <strong>${patient.name}</strong>
      <small>${patient.symptoms} • Agora</small>
    </div>
    <span class="priority-badge priority-${patient.priority.toLowerCase()}">${patient.priority}</span>
  `;
  queue.prepend(item);
  
  // Limit queue display
  if (queue.children.length > 10) {
    queue.removeChild(queue.lastChild);
  }
  
  updateStats();
}

function updatePatientCard(patient, analysis) {
  document.getElementById('cardName').textContent = patient.name;
  document.getElementById('cardSymptoms').textContent = patient.symptoms;
  
  const badge = document.getElementById('cardPriority');
  badge.textContent = analysis.priority;
  badge.className = `priority-badge priority-${analysis.priority.toLowerCase()}`;
  
  // Animate risk meter
  const riskFill = document.getElementById('riskFill');
  const riskLabel = document.getElementById('riskLabel');
  riskFill.style.width = `${analysis.score * 100}%`;
  riskLabel.textContent = `Risco: ${(analysis.score * 100).toFixed(0)}% - ${analysis.priority}`;
}

function showRecommendation(rec) {
  const box = document.getElementById('aiRecommendation');
  box.classList.remove('hidden');
  
  document.getElementById('recDestination').textContent = `🎯 Destino: ${rec.destination}`;
  document.getElementById('recTransport').textContent = `🚑 Transporte: ${rec.transport}`;
  document.getElementById('recETA').textContent = `⏱️ ETA: ${rec.eta}`;
}

async function loadBlockchainBlocks() {
  const list = document.getElementById('blocksList');
  const blocks = window.BlockchainAudit.getLatestBlocks(5);
  
  list.innerHTML = blocks.map(block => `
    <div class="block-item">
      <div><strong>Bloco #${block.index}</strong></div>
      <div class="hash">${block.hash.substring(0, 32)}...</div>
      <div style="margin-top:0.25rem;color:var(--text-muted)">${block.transactions?.[0]?.type || 'Sistema'}</div>
      <small>${new Date(block.timestamp).toLocaleTimeString()}</small>
    </div>
  `).join('') || '<p style="color:var(--text-muted)">Nenhum bloco ainda</p>';
}

async function loadBlockchainStats() {
  const stats = window.BlockchainAudit.getStats();
  document.getElementById('chainStats').innerHTML = `
    <p><strong>Blocos:</strong> ${stats.totalBlocks}</p>
    <p><strong>Transações:</strong> ${stats.totalTransactions}</p>
    <p><strong>Pendentes:</strong> ${stats.pendingTransactions}</p>
    <p><strong>Status:</strong> <span style="color:${stats.chainValid ? 'var(--success)' : 'var(--danger)'}">${stats.chainValid ? '✅ Válida' : '❌ Inválida'}</span></p>
  `;
}

function displayTransactionResults(results, query) {
  const details = document.getElementById('txDetails');
  details.classList.remove('hidden');
  
  if (results.length === 0) {
    details.innerHTML = `<p style="color:var(--text-muted)">Nenhuma transação encontrada para "${query}"</p>`;
    return;
  }
  
  details.innerHTML = `
    <h5>🔍 Resultados para "${query}"</h5>
    <pre style="background:var(--bg);padding:1rem;border-radius:8px;overflow-x:auto;margin-top:0.5rem;font-size:0.8rem">
${JSON.stringify(results[0], null, 2)}
    </pre>
  `;
}

function logEmergencyAction(message) {
  const log = document.getElementById('emergencyLog');
  const entry = document.createElement('div');
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  log.prepend(entry);
  
  // Limit log entries
  if (log.children.length > 20) {
    log.removeChild(log.lastChild);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function updateStats() {
  const count = document.getElementById('waitingCount');
  const current = parseInt(count.textContent) || 0;
  count.textContent = current + 1;
}
