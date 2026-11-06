const Contract = require('../models/Contract');
const Hospital = require('../models/Hospital');
const Proposal = require('../models/Proposal');
const MEI = require('../models/MEI');
const User = require('../models/User');
const Ambulance = require('../models/Ambulance');

class AdminController {
  static async getDashboard(req, res) {
    try {
      const [contracts, hospitals, proposals, meis, users, ambulances] = await Promise.all([
        Contract.getStats(),
        Hospital.getStats(),
        Proposal.getStats(),
        MEI.getStats(),
        User.getStats(),
        Ambulance.getStats()
      ]);

      const dashboard = {
        contracts: contracts,
        hospitals: hospitals,
        proposals: proposals,
        meis: meis,
        users: users,
        ambulances: ambulances,
        budget: {
          total: 20000000,
          allocated: contracts?.total_value || 0,
          available: 20000000 - (contracts?.total_value || 0)
        },
        infrastructure: {
          type: 'OldButGold TR8',
          satellites: process.env.SATELLITE_COUNT || 3,
          coverage: '98%'
        }
      };

      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getContracts(req, res) {
    try {
      const contracts = await Contract.getAll();
      res.json({ success: true, data: contracts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getContract(req, res) {
    try {
      const contract = await Contract.getById(req.params.id);
      if (!contract) {
        return res.status(404).json({ success: false, error: 'Contrato não encontrado' });
      }
      res.json({ success: true, data: contract });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createContract(req, res) {
    try {
      const contract = await Contract.create(req.body);
      res.status(201).json({ success: true, data: contract });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateContract(req, res) {
    try {
      const contract = await Contract.update(req.params.id, req.body);
      if (!contract) {
        return res.status(404).json({ success: false, error: 'Contrato não encontrado' });
      }
      res.json({ success: true, data: contract });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteContract(req, res) {
    try {
      await Contract.delete(req.params.id);
      res.json({ success: true, message: 'Contrato removido com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHospitals(req, res) {
    try {
      const hospitals = await Hospital.getAll();
      res.json({ success: true, data: hospitals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHospital(req, res) {
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

  static async getProposals(req, res) {
    try {
      const proposals = await Proposal.getAll();
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getProposal(req, res) {
    try {
      const proposal = await Proposal.getById(req.params.id);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }
      res.json({ success: true, data: proposal });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async approveProposal(req, res) {
    try {
      const proposal = await Proposal.approve(req.params.id, req.user.id);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }
      res.json({ success: true, data: proposal, message: 'Proposta aprovada' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async rejectProposal(req, res) {
    try {
      const { notes } = req.body;
      const proposal = await Proposal.reject(req.params.id, req.user.id, notes);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }
      res.json({ success: true, data: proposal, message: 'Proposta rejeitada' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMEIs(req, res) {
    try {
      const meis = await MEI.getAll();
      res.json({ success: true, data: meis });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMEI(req, res) {
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

  static async getUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAmbulances(req, res) {
    try {
      const ambulances = await Ambulance.getAll();
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getReports(req, res) {
    try {
      const [contracts, hospitals, proposals, meis, users, ambulances] = await Promise.all([
        Contract.getStats(),
        Hospital.getStats(),
        Proposal.getStats(),
        MEI.getStats(),
        User.getStats(),
        Ambulance.getStats()
      ]);

      const reports = {
        contracts: contracts,
        hospitals: hospitals,
        proposals: proposals,
        meis: meis,
        users: users,
        ambulances: ambulances,
        budget: {
          total: 20000000,
          allocated: contracts?.total_value || 0,
          available: 20000000 - (contracts?.total_value || 0),
          utilization: contracts?.total_value ? ((contracts.total_value / 20000000) * 100).toFixed(2) + '%' : '0%'
        },
        infrastructure: {
          type: 'OldButGold TR8',
          satellites: process.env.SATELLITE_COUNT || 3,
          coverage: '98%',
          cost: 'R$ 20.000.000,00 (Pre-Seed 2030)'
        }
      };

      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getContractReports(req, res) {
    try {
      const contracts = await Contract.getAll();
      const report = {
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => c.status === 'active').length,
        totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
        avgValue: contracts.length > 0 ? contracts.reduce((sum, c) => sum + (c.value || 0), 0) / contracts.length : 0,
        expiringSoon: await Contract.getExpiringSoon(30)
      };
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHospitalReports(req, res) {
    try {
      const hospitals = await Hospital.getAll();
      const report = {
        totalHospitals: hospitals.length,
        available: hospitals.filter(h => h.status === 'available').length,
        busy: hospitals.filter(h => h.status === 'busy').length,
        critical: hospitals.filter(h => h.status === 'critical').length,
        totalBeds: hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0),
        availableBeds: hospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0),
        avgOxygen: hospitals.length > 0 ? hospitals.reduce((sum, h) => sum + (h.oxygen_level || 100), 0) / hospitals.length : 100
      };
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getProposalReports(req, res) {
    try {
      const proposals = await Proposal.getAll();
      const report = {
        totalProposals: proposals.length,
        pending: proposals.filter(p => p.status === 'pending').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        rejected: proposals.filter(p => p.status === 'rejected').length,
        totalValue: proposals.reduce((sum, p) => sum + (p.value || 0), 0),
        avgValue: proposals.length > 0 ? proposals.reduce((sum, p) => sum + (p.value || 0), 0) / proposals.length : 0
      };
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getBudgetReport(req, res) {
    try {
      const contracts = await Contract.getStats();
      const proposals = await Proposal.getStats();
      
      const budgetReport = {
        totalBudget: 20000000,
        allocated: contracts?.total_value || 0,
        available: 20000000 - (contracts?.total_value || 0),
        utilization: contracts?.total_value ? ((contracts.total_value / 20000000) * 100).toFixed(2) + '%' : '0%',
        pendingProposalsValue: proposals?.total_value || 0,
        projections: {
          q1: 5000000,
          q2: 7000000,
          q3: 5000000,
          q4: 3000000
        },
        infrastructureCost: {
          satellites: 1500000,
          ambulances: 3000000,
          servers: 1000000,
          maintenance: 2000000,
          total: 7500000
        }
      };

      res.json({ success: true, data: budgetReport });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async quickApproveAll(req, res) {
    try {
      const pendingProposals = await Proposal.getPending();
      const results = [];
      
      for (const proposal of pendingProposals) {
        const approved = await Proposal.approve(proposal.id, req.user.id);
        results.push(approved);
      }

      res.json({ 
        success: true, 
        data: results,
        message: `${results.length} propostas aprovadas rapidamente`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AdminController;
