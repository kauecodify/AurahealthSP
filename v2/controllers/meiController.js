const MEI = require('../models/MEI');
const Hospital = require('../models/Hospital');
const { validationResult } = require('express-validator');
const meiService = require('../services/meiService');

class MEIController {
  static async verify(req, res) {
    try {
      const { cnpj } = req.params;
      
      if (!cnpj || cnpj.length !== 14) {
        return res.status(400).json({ success: false, error: 'CNPJ inválido. Deve conter 14 dígitos.' });
      }

      let mei = await MEI.getByCNPJ(cnpj);
      
      if (!mei) {
        const verifiedData = await meiService.verifyMEI(cnpj);
        if (verifiedData) {
          mei = await MEI.create({
            cnpj: verifiedData.cnpj,
            company_name: verifiedData.companyName,
            owner_name: verifiedData.ownerName,
            owner_cpf: verifiedData.ownerCpf,
            sectors: verifiedData.sectors,
            registration_date: verifiedData.registrationDate,
            expiry_date: verifiedData.expiryDate
          });
          mei = await MEI.verify(cnpj);
        }
      }

      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }

      res.json({ success: true, data: mei });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStatus(req, res) {
    try {
      const { cnpj } = req.params;
      const mei = await MEI.getByCNPJ(cnpj);
      
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }

      res.json({ success: true, data: { status: mei.status, verified: mei.verified } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { cnpj, company_name, owner_name, owner_cpf, sectors } = req.body;
      
      let mei = await MEI.getByCNPJ(cnpj);
      if (mei) {
        return res.status(409).json({ success: false, error: 'MEI já cadastrado' });
      }

      mei = await MEI.create({
        cnpj,
        company_name,
        owner_name,
        owner_cpf,
        sectors,
        registration_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      res.status(201).json({ success: true, data: mei });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const meis = await MEI.getAll();
      res.json({ success: true, data: meis });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const mei = await MEI.getById(req.params.id);
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }
      res.json({ success: true, data: mei });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHospitals(req, res) {
    try {
      const { cnpj } = req.params;
      const mei = await MEI.getByCNPJ(cnpj);
      
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }

      const hospitals = await MEI.getHospitalsForMEI(mei.id);
      res.json({ success: true, data: hospitals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async authorizeForHospital(req, res) {
    try {
      const { meiId, hospitalId } = req.params;
      const { sectors } = req.body;
      
      await MEI.authorizeForHospital(meiId, hospitalId, sectors);
      res.json({ success: true, message: 'MEI autorizado para o hospital' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async isAuthorizedForHospital(req, res) {
    try {
      const { cnpj, hospitalId } = req.params;
      const isAuthorized = await MEI.isAuthorizedForHospital(cnpj, hospitalId);
      res.json({ success: true, data: { authorized: isAuthorized } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSectors(req, res) {
    try {
      const { cnpj } = req.params;
      const sectors = await MEI.getSectors(cnpj);
      res.json({ success: true, data: { cnpj, sectors } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await MEI.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const meis = await MEI.search(req.query.q);
      res.json({ success: true, data: meis });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const mei = await MEI.update(req.params.id, req.body);
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }
      res.json({ success: true, data: mei });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await MEI.delete(req.params.id);
      res.json({ success: true, message: 'MEI removido com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAuthorizedHospitals(req, res) {
    try {
      const { cnpj } = req.params;
      const mei = await MEI.getByCNPJ(cnpj);
      
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado' });
      }

      const hospitals = await Hospital.getAll();
      const authorizedHospitals = [];
      
      for (const hospital of hospitals) {
        const isAuthorized = await MEI.isAuthorizedForHospital(cnpj, hospital.id);
        if (isAuthorized) {
          authorizedHospitals.push({ ...hospital, authorized: true });
        }
      }

      res.json({ success: true, data: authorizedHospitals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async verifyAndAuthorize(req, res) {
    try {
      const { cnpj, hospitalId } = req.body;
      
      if (!cnpj || !hospitalId) {
        return res.status(400).json({ success: false, error: 'CNPJ e hospitalId são obrigatórios' });
      }

      const mei = await MEI.getByCNPJ(cnpj);
      
      if (!mei) {
        const verifiedData = await meiService.verifyMEI(cnpj);
        if (!verifiedData) {
          return res.status(404).json({ success: false, error: 'MEI não verificado' });
        }
      }

      const isAuthorized = await MEI.isAuthorizedForHospital(cnpj, hospitalId);
      
      if (!isAuthorized) {
        await MEI.authorizeForHospital((await MEI.getByCNPJ(cnpj)).id, hospitalId, ['saude', 'transporte']);
      }

      res.json({ 
        success: true, 
        data: { 
          authorized: true,
          message: 'MEI verificado e autorizado para o hospital'
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MEIController;
