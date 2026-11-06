const axios = require('axios');
const { query } = require('../config/database');
const { get, set } = require('../config/redis');
const { logger } = require('../middleware/logger');

class MEIService {
  constructor() {
    this.apiUrl = process.env.MEI_API_URL || 'https://api.gateways.mei.gov.br/v2';
    this.apiKey = process.env.MEI_API_KEY || '';
    this.timeout = 10000;
    this.cacheTTL = 86400; // 24 hours
  }

  // Verificar CNPJ MEI na API do governo
  async verifyMEI(cnpj) {
    try {
      // Normalize CNPJ
      const normalizedCnpj = cnpj.replace(/[^\d]/g, '');
      
      // Check cache first
      const cacheKey = `mei:${normalizedCnpj}`;
      const cached = await get(cacheKey);
      
      if (cached) {
        logger.info(`📦 MEI cache hit for CNPJ: ${normalizedCnpj}`);
        return cached;
      }
      
      // Call MEI API
      logger.info(`🔍 Verifying MEI CNPJ: ${normalizedCnpj}`);
      
      const response = await axios.get(`${this.apiUrl}/cnpj/${normalizedCnpj}`, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });
      
      const meiData = response.data;
      
      // Validate response
      if (!meiData || !meiData.cnpj) {
        throw new Error('Invalid MEI data received');
      }
      
      // Check if it's actually a MEI
      if (meiData.natureza_juridica !== '206-2' && !meiData optante_simples) {
        throw new Error('CNPJ is not registered as MEI');
      }
      
      // Format response
      const formattedData = this._formatMEIData(meiData);
      
      // Cache for 24 hours
      await set(cacheKey, formattedData, this.cacheTTL);
      
      logger.info(`✅ MEI verified: ${formattedData.companyName}`);
      
      return formattedData;
    } catch (err) {
      logger.error(`❌ MEI verification failed for CNPJ: ${cnpj}: ${err.message}`);
      
      if (err.response && err.response.status === 404) {
        throw new Error('MEI not found');
      }
      
      if (err.response && err.response.status === 401) {
        throw new Error('Invalid API key');
      }
      
      throw new Error(`Failed to verify MEI: ${err.message}`);
    }
  }

  // Format MEI data from government API
  _formatMEIData(data) {
    const sectors = this._extractSectors(data);
    
    return {
      cnpj: data.cnpj,
      companyName: data.razao_social || data.nome_empresarial || '',
      fantasyName: data.nome_fantasia || '',
      ownerName: data.nome_empresario || data.socio || '',
      ownerCpf: data.cpf || '',
      ownerEmail: '',
      ownerPhone: '',
      sectors: sectors,
      registrationDate: data.data_abertura || data.data_inicio_atividade || '',
      expiryDate: data.data_situacao_cadastral || '',
      status: this._mapStatus(data.situacao_cadastral || data.situacao),
      verified: true,
      verificationDate: new Date().toISOString(),
      address: this._formatAddress(data),
      capitalSocial: data.capital_social || 0,
      nature: data.natureza_juridica || '',
      legalNatureDescription: data.descricao_natureza_juridica || '',
      optanteSimples: data.optante_simples || false,
      dataOptanteSimples: data.data_opcao_simples || '',
      dataExclusaoSimples: data.data_exclusao_simples || '',
      motiveExclusaoSimples: data.motivo_exclusao_simples || '',
      cnaePrincipal: data.cnae_fiscal || '',
      cnaePrincipalDescription: data.descricao_cnae_fiscal || '',
      cnaeSecundarios: data.cnaes_secundarios || []
    };
  }

  // Extract sectors from MEI data
  _extractSectors(data) {
    const sectors = [];
    
    // Main CNAE
    if (data.cnae_fiscal) {
      sectors.push({
        code: data.cnae_fiscal,
        description: data.descricao_cnae_fiscal || '',
        isPrimary: true
      });
    }
    
    // Secondary CNAEs
    if (data.cnaes_secundarios && Array.isArray(data.cnaes_secundarios)) {
      data.cnaes_secundarios.forEach(cnae => {
        sectors.push({
          code: cnae.cnae || cnae,
          description: cnae.descricao || '',
          isPrimary: false
        });
      });
    }
    
    // Map to common sector names
    const sectorMap = {
      '8610101': 'Atividade de atendimento hospitalar',
      '8610102': 'Atividade de atendimento em pronto-socorro',
      '8621400': 'Serviços de médicos',
      '8622100': 'Serviços de enfermagem',
      '8630501': 'Atividade de atendimento ambulatorial',
      '8640201': 'Serviços de profissionais da área de saúde',
      '8650001': 'Atividades de enfermagem',
      '8690999': 'Atividades de atenção ambulatorial não especificadas anteriormente',
      '4930201': 'Transporte de passageiros por ambulância',
      '4930202': 'Serviço de remoção de doentes e vítimas de acidentes',
      '8121400': 'Serviços de limpeza em prédios e em domicílio',
      '8122200': 'Serviços de desinfecção e dedetização',
      '8129990': 'Outras atividades de limpeza em prédios e em domicílio',
      '3311201': 'Manutenção e reparação de equipamentos hospitalares',
      '4711901': 'Comércio varejista de medicamentos, cosméticos e produtos de perfumaria'
    };
    
    return sectors.map(sector => ({
      ...sector,
      commonName: sectorMap[sector.code] || sector.description
    }));
  }

  // Map government status to our status
  _mapStatus(status) {
    const statusMap = {
      'Ativo': 'active',
      'Ativa': 'active',
      'ATIVO': 'active',
      '2': 'active', // Active code
      'Baixado': 'inactive',
      'Baixada': 'inactive',
      '3': 'inactive', // Inactive code
      'Suspenso': 'suspended',
      'Suspensa': 'suspended',
      '4': 'suspended', // Suspended code
      'Cancelado': 'cancelled',
      'Cancelada': 'cancelled'
    };
    
    return statusMap[status] || 'unknown';
  }

  // Format address
  _formatAddress(data) {
    return {
      street: data.logradouro || '',
      number: data.numero || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.municipio || '',
      state: data.uf || '',
      zipCode: data.cep || '',
      country: 'Brasil'
    };
  }

  // Save MEI to database
  async saveMEI(meiData) {
    try {
      const normalizedCnpj = meiData.cnpj.replace(/[^\d]/g, '');
      
      // Check if already exists
      const existing = await query(
        'SELECT id FROM mei WHERE cnpj = $1',
        [normalizedCnpj]
      );
      
      if (existing.rows.length > 0) {
        // Update existing
        const result = await query(
          `UPDATE mei SET
            company_name = $1,
            owner_name = $2,
            owner_cpf = $3,
            sectors = $4,
            registration_date = $5,
            expiry_date = $6,
            status = $7,
            verified = $8,
            verification_date = $9,
            address = $10,
            updated_at = NOW()
          WHERE cnpj = $11
          RETURNING *`,
          [
            meiData.companyName,
            meiData.ownerName,
            meiData.ownerCpf,
            JSON.stringify(meiData.sectors),
            meiData.registrationDate,
            meiData.expiryDate,
            meiData.status,
            meiData.verified,
            meiData.verificationDate,
            JSON.stringify(meiData.address),
            normalizedCnpj
          ]
        );
        
        return result.rows[0];
      }
      
      // Insert new
      const result = await query(
        `INSERT INTO mei (
          cnpj, company_name, owner_name, owner_cpf, sectors,
          registration_date, expiry_date, status, verified,
          verification_date, address, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          normalizedCnpj,
          meiData.companyName,
          meiData.ownerName,
          meiData.ownerCpf,
          JSON.stringify(meiData.sectors),
          meiData.registrationDate,
          meiData.expiryDate,
          meiData.status,
          meiData.verified,
          meiData.verificationDate,
          JSON.stringify(meiData.address)
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      logger.error('❌ Failed to save MEI:', err);
      throw err;
    }
  }

  // Get MEI from database
  async getMEI(cnpj) {
    try {
      const normalizedCnpj = cnpj.replace(/[^\d]/g, '');
      
      const result = await query(
        'SELECT * FROM mei WHERE cnpj = $1',
        [normalizedCnpj]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this._formatDatabaseMEI(result.rows[0]);
    } catch (err) {
      logger.error('❌ Failed to get MEI:', err);
      throw err;
    }
  }

  // Format MEI from database
  _formatDatabaseMEI(row) {
    return {
      id: row.id,
      cnpj: row.cnpj,
      companyName: row.company_name,
      ownerName: row.owner_name,
      ownerCpf: row.owner_cpf,
      ownerEmail: row.owner_email || '',
      ownerPhone: row.owner_phone || '',
      sectors: row.sectors ? JSON.parse(row.sectors) : [],
      registrationDate: row.registration_date,
      expiryDate: row.expiry_date,
      status: row.status,
      verified: row.verified,
      verificationDate: row.verification_date,
      verificationCode: row.verification_code || '',
      address: row.address ? JSON.parse(row.address) : {},
      documents: row.documents ? JSON.parse(row.documents) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // List all MEIs
  async listMEIs(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = pagination;
      const { status, verified, search } = filters;
      
      let queryText = `
        SELECT * FROM mei
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      if (status) {
        queryText += ` AND status = $${paramIndex++}`;
        params.push(status);
      }
      
      if (verified !== undefined) {
        queryText += ` AND verified = $${paramIndex++}`;
        params.push(verified);
      }
      
      if (search) {
        queryText += ` AND (company_name ILIKE $${paramIndex++} OR owner_name ILIKE $${paramIndex++})`;
        params.push(`%${search}%`, `%${search}%`);
      }
      
      // Count query
      const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS count_query`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);
      
      // Add sorting and pagination
      queryText += `
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, (page - 1) * limit);
      
      const result = await query(queryText, params);
      
      return {
        data: result.rows.map(row => this._formatDatabaseMEI(row)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      logger.error('❌ Failed to list MEIs:', err);
      throw err;
    }
  }

  // Check if MEI is authorized for hospital sector
  async isMEIAuthorizedForHospital(cnpj, hospitalId) {
    try {
      const mei = await this.getMEI(cnpj);
      if (!mei) {
        return false;
      }
      
      // Get hospital sectors
      const hospitalResult = await query(
        `SELECT hs.* FROM hospital_sectors hs
         WHERE hs.hospital_id = $1 AND hs.mei_required = true`,
        [hospitalId]
      );
      
      const requiredSectors = hospitalResult.rows.map(row => row.name.toLowerCase());
      
      if (requiredSectors.length === 0) {
        return true; // No specific sector requirements
      }
      
      // Check if MEI has any of the required sectors
      const meiSectorNames = mei.sectors.map(s => s.commonName.toLowerCase());
      
      return requiredSectors.some(sector => 
        meiSectorNames.some(meiSector => meiSector.includes(sector))
      );
    } catch (err) {
      logger.error('❌ Failed to check MEI authorization:', err);
      return false;
    }
  }

  // Get all hospitals where MEI is authorized
  async getAuthorizedHospitals(cnpj) {
    try {
      const mei = await this.getMEI(cnpj);
      if (!mei) {
        return [];
      }
      
      // Get all hospital sectors
      const sectorsResult = await query(
        `SELECT hs.hospital_id, h.name as hospital_name, h.status as hospital_status
         FROM hospital_sectors hs
         JOIN hospitals h ON hs.hospital_id = h.id
         WHERE hs.mei_required = true`
      );
      
      const authorizedHospitals = [];
      
      for (const sector of sectorsResult.rows) {
        const isAuthorized = await this.isMEIAuthorizedForHospital(cnpj, sector.hospital_id);
        
        if (isAuthorized) {
          authorizedHospitals.push({
            hospitalId: sector.hospital_id,
            hospitalName: sector.hospital_name,
            hospitalStatus: sector.hospital_status
          });
        }
      }
      
      return authorizedHospitals;
    } catch (err) {
      logger.error('❌ Failed to get authorized hospitals:', err);
      return [];
    }
  }

  // Generate verification code
  async generateVerificationCode(cnpj) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await query(
        `UPDATE mei SET
          verification_code = $1,
          verification_date = NULL,
          verified = false,
          updated_at = NOW()
        WHERE cnpj = $2`,
        [code, cnpj]
      );
      
      return {
        code,
        expiresAt: expiresAt.toISOString()
      };
    } catch (err) {
      logger.error('❌ Failed to generate verification code:', err);
      throw err;
    }
  }

  // Verify code
  async verifyCode(cnpj, code) {
    try {
      const result = await query(
        'SELECT verification_code FROM mei WHERE cnpj = $1',
        [cnpj]
      );
      
      if (result.rows.length === 0) {
        throw new Error('MEI not found');
      }
      
      if (result.rows[0].verification_code !== code) {
        throw new Error('Invalid verification code');
      }
      
      // Mark as verified
      await query(
        `UPDATE mei SET
          verified = true,
          verification_date = NOW(),
          verification_code = NULL,
          updated_at = NOW()
        WHERE cnpj = $1`,
        [cnpj]
      );
      
      return true;
    } catch (err) {
      logger.error('❌ Failed to verify code:', err);
      throw err;
    }
  }

  // Update MEI status
  async updateStatus(cnpj, status) {
    try {
      await query(
        `UPDATE mei SET
          status = $1,
          updated_at = NOW()
        WHERE cnpj = $2`,
        [status, cnpj]
      );
      
      return true;
    } catch (err) {
      logger.error('❌ Failed to update MEI status:', err);
      throw err;
    }
  }
}

module.exports = new MEIService();
