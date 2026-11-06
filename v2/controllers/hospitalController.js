const Hospital = require('../models/Hospital');
const MEI = require('../models/MEI');
const { validationResult } = require('express-validator');

class HospitalController {
  static async getAll(req, res) {
    try {
      const hospitals = await Hospital.getAll();
      res.json({ success: true, data: hospitals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const hospital = await Hospital.getById(req.params.id);
      if (!hospital) {
        return res.status(404).json({ success: false, error: 'Hospital não encontrado' });
      }
      res.json({ success: true, data: hospital });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStatus(req, res) {
    try {
      const hospital = await Hospital.getStatus(req.params.id);
      if (!hospital) {
        return res.status(404).json({ success: false, error: 'Hospital não encontrado' });
      }
      res.json({ success: true, data: hospital });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSectors(req, res) {
    try {
      const sectors = await Hospital.getSectors(req.params.id);
      res.json({ success: true, data: sectors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAuthorizedMEIs(req, res) {
    try {
      const meis = await Hospital.getAuthorizedMEIs(req.params.id);
      res.json({ success: true, data: meis });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const hospital = await Hospital.create(req.body);
      res.status(201).json({ success: true, data: hospital });
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
      const hospital = await Hospital.update(req.params.id, req.body);
      if (!hospital) {
        return res.status(404).json({ success: false, error: 'Hospital não encontrado' });
      }
      res.json({ success: true, data: hospital });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Hospital.delete(req.params.id);
      res.json({ success: true, message: 'Hospital removido com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const hospital = await Hospital.updateStatus(
        req.params.id,
        req.body.status,
        req.body.available_beds,
        req.body.oxygen_level
      );
      if (!hospital) {
        return res.status(404).json({ success: false, error: 'Hospital não encontrado' });
      }
      res.json({ success: true, data: hospital });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Hospital.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const hospitals = await Hospital.search(req.query.q);
      res.json({ success: true, data: hospitals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async checkMEIAuthorization(req, res) {
    try {
      const { cnpj } = req.query;
      const hospitalId = req.params.id;
      
      if (!cnpj) {
        return res.status(400).json({ success: false, error: 'CNPJ é obrigatório' });
      }

      const isAuthorized = await MEI.isAuthorizedForHospital(cnpj, hospitalId);
      const mei = await MEI.getByCNPJ(cnpj);

      res.json({ 
        success: true, 
        data: { 
          authorized: isAuthorized,
          mei: mei ? { cnpj: mei.cnpj, companyName: mei.company_name, sectors: mei.sectors } : null
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getServiceDashboard(req, res) {
    try {
      const hospitalId = req.params.id;
      const hospital = await Hospital.getById(hospitalId);
      const sectors = await Hospital.getSectors(hospitalId);
      const authorizedMEIs = await Hospital.getAuthorizedMEIs(hospitalId);
      
      res.json({ 
        success: true, 
        data: { 
          hospital,
          sectors,
          authorizedMEIs,
          stats: {
            totalSectors: sectors.length,
            totalAuthorizedMEIs: authorizedMEIs.length,
            bedOccupancy: hospital ? ((hospital.total_beds - hospital.available_beds) / hospital.total_beds * 100).toFixed(2) + '%' : '0%',
            oxygenLevel: hospital ? hospital.oxygen_level + '%' : '100%'
          }
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = HospitalController;
