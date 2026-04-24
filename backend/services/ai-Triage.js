/**
 * AI Triage Service - Protocol-based risk assessment
 * Production: Replace with TensorFlow/PyTorch model
 */

const ESC_PROTOCOLS = {
  'dor no peito': { 
    baseRisk: 0.85, 
    keywords: ['irradia', 'sudorese', 'náusea', 'dispneia', 'palidez'],
    protocol: 'ESC-2024-CHEST-PAIN',
    destination: 'UTI/EMERGÊNCIA'
  },
  'dificuldade respiratória': { 
    baseRisk: 0.78, 
    keywords: ['cianose', 'tiragem', 'saturação', 'estridor', 'apneia'],
    protocol: 'ATS-2024-RESPIRATORY',
    destination: 'PRONTO SOCORRO'
  },
  'alteração neurológica': { 
    baseRisk: 0.92, 
    keywords: ['confusão', 'assimetria', 'desmaio', 'convulsão', 'afasia'],
    protocol: 'AHA-2024-STROKE',
    destination: 'UTI NEURO'
  },
  'febre': { 
    baseRisk: 0.35, 
    keywords: ['rigidez', 'petéquia', 'convulsão', 'prostração'],
    protocol: 'IDSA-2024-FEVER',
    destination: 'OBSERVAÇÃO'
  },
  'trauma': { 
    baseRisk: 0.65, 
    keywords: ['sangramento', 'fratura', 'inconsciente', 'deformidade'],
    protocol: 'ATLS-2024-TRAUMA',
    destination: 'TRAUMA CENTER'
  },
  'abdome agudo': {
    baseRisk: 0.72,
    keywords: ['distensão', 'defesa', 'rigidez', 'vomito', 'melena'],
    protocol: 'WSES-2024-ABDOMEN',
    destination: 'CIRURGIA EMERGÊNCIA'
  }
};

function calculateRisk(symptoms, age, vitals = {}) {
  let riskScore = 0;
  const matched = [];
  const symptomsLower = symptoms.toLowerCase();
  
  // Match symptoms against protocols
  for (const [symptom, config] of Object.entries(ESC_PROTOCOLS)) {
    if (symptomsLower.includes(symptom)) {
      riskScore += config.baseRisk;
      matched.push({ symptom, protocol: config.protocol });
      
      // Boost for additional keywords
      for (const kw of config.keywords) {
        if (symptomsLower.includes(kw)) {
          riskScore += 0.08;
        }
      }
    }
  }
  
  // Age adjustments
  if (age < 2 || age > 75) riskScore += 0.12;
  if (age > 60 && matched.some(m => m.protocol.includes('CARD'))) riskScore += 0.1;
  
  // Vital signs adjustments
  if (vitals.hr > 120 || vitals.hr < 50) riskScore += 0.15;
  if (vitals.spo2 && vitals.spo2 < 94) riskScore += 0.2;
  if (vitals.bp) {
    const [sys, dia] = vitals.bp.split('x').map(Number);
    if (sys > 180 || sys < 90 || dia > 110) riskScore += 0.15;
  }
  if (vitals.temp && vitals.temp > 39) riskScore += 0.1;
  
  // Normalize score
  const normalizedScore = Math.min(1, Math.max(0, riskScore));
  
  // Determine priority and recommendation
  const priority = normalizedScore >= 0.75 ? 'CRITICAL' 
                 : normalizedScore >= 0.55 ? 'HIGH' 
                 : normalizedScore >= 0.35 ? 'MEDIUM' : 'LOW';
  
  const recommendation = getRecommendation(normalizedScore, matched, vitals);
  
  return {
    score: parseFloat(normalizedScore.toFixed(2)),
    priority,
    matchedProtocols: matched.map(m => m.protocol),
    matchedSymptoms: matched.map(m => m.symptom),
    recommendation,
    confidence: calculateConfidence(normalizedScore, matched.length),
    timestamp: new Date().toISOString()
  };
}

function getRecommendation(score, matched, vitals) {
  const primaryProtocol = matched[0]?.protocol;
  
  if (score >= 0.85) {
    return {
      destination: 'UTI EMERGENCIAL',
      transport: 'SAMU - URGÊNCIA MÁXIMA',
      eta: '< 8 minutos',
      resources: ['Equipe de reanimação', 'Monitorização contínua', 'Ventilação mecânica'],
      preAlert: true
    };
  }
  if (score >= 0.65) {
    return {
      destination: 'PRONTO SOCORRO - VERMELHO',
      transport: 'Ambulância SUporte Avançado',
      eta: '< 15 minutos',
      resources: ['Médico plantonista', 'Exames rápidos', 'Medicação emergencial'],
      preAlert: true
    };
  }
  if (score >= 0.45) {
    return {
      destination: 'PRONTO SOCORRO - LARANJA',
      transport: 'Ambulância Básica',
      eta: '< 30 minutos',
      resources: ['Enfermagem especializada', 'Exames laboratoriais'],
      preAlert: false
    };
  }
  if (score >= 0.25) {
    return {
      destination: 'UPA / UBS',
      transport: 'Van médica / Orientação',
      eta: '< 60 minutos',
      resources: ['Atendimento ambulatorial', 'Encaminhamento programado'],
      preAlert: false
    };
  }
  return {
    destination: 'Agendamento Ambulatorial',
    transport: 'Orientação por telefone',
    eta: 'Conforme agenda',
    resources: ['Teleorientação', 'Receituário eletrônico'],
    preAlert: false
  };
}

function calculateConfidence(score, matchCount) {
  // Higher confidence with more symptom matches and extreme scores
  const baseConfidence = 0.6;
  const matchBonus = Math.min(0.3, matchCount * 0.1);
  const scoreBonus = score > 0.8 || score < 0.2 ? 0.1 : 0;
  return parseFloat(Math.min(0.99, baseConfidence + matchBonus + scoreBonus).toFixed(2));
}

// Export for use in routes
module.exports = { 
  calculateRisk, 
  ESC_PROTOCOLS,
  getRecommendation 
};