const Proposal = require('../models/Proposal');
const User = require('../models/User');
const MEI = require('../models/MEI');
const Hospital = require('../models/Hospital');
const { validationResult } = require('express-validator');

class ProposalController {
  static async getAll(req, res) {
    try {
      const proposals = await Proposal.getAll();
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
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

  static async getByUser(req, res) {
    try {
      const proposals = await Proposal.getByUser(req.params.userId);
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPending(req, res) {
    try {
      const proposals = await Proposal.getPending();
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByStatus(req, res) {
    try {
      const proposals = await Proposal.getByStatus(req.params.status);
      res.json({ success: true, data: proposals });
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
      const { user_id, mei_id, hospital_id, title, description, value, duration_days, documents, priority } = req.body;
      
      const user = await User.getById(user_id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      if (mei_id) {
        const mei = await MEI.getById(mei_id);
        if (!mei) {
          return res.status(404).json({ success: false, error: 'MEI não encontrado' });
        }
      }

      if (hospital_id) {
        const hospital = await Hospital.getById(hospital_id);
        if (!hospital) {
          return res.status(404).json({ success: false, error: 'Hospital não encontrado' });
        }
      }

      const proposal = await Proposal.create({
        user_id,
        mei_id,
        hospital_id,
        title,
        description,
        value,
        duration_days,
        documents,
        priority
      });

      res.status(201).json({ success: true, data: proposal });
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
      const proposal = await Proposal.update(req.params.id, req.body);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }
      res.json({ success: true, data: proposal });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async approve(req, res) {
    try {
      const proposal = await Proposal.getById(req.params.id);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }

      const approvedProposal = await Proposal.approve(req.params.id, req.user.id);
      res.json({ success: true, data: approvedProposal, message: 'Proposta aprovada com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async reject(req, res) {
    try {
      const { notes } = req.body;
      const proposal = await Proposal.getById(req.params.id);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }

      const rejectedProposal = await Proposal.reject(req.params.id, req.user.id, notes);
      res.json({ success: true, data: rejectedProposal, message: 'Proposta rejeitada' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Proposal.delete(req.params.id);
      res.json({ success: true, message: 'Proposta removida com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Proposal.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByMEI(req, res) {
    try {
      const proposals = await Proposal.getByMEI(req.params.meiId);
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByHospital(req, res) {
    try {
      const proposals = await Proposal.getByHospital(req.params.hospitalId);
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async quickApprove(req, res) {
    try {
      const { proposalId } = req.params;
      
      const proposal = await Proposal.getById(proposalId);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
      }

      if (proposal.status !== 'pending') {
        return res.status(400).json({ success: false, error: 'Proposta já processada' });
      }

      const approvedProposal = await Proposal.approve(proposalId, req.user.id);
      
      res.json({ 
        success: true, 
        data: approvedProposal,
        message: 'Proposta aprovada rapidamente para o governo'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async submitWithMEI(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { user_id, cnpj, hospital_id, title, description, value, duration_days, documents } = req.body;
      
      const user = await User.getById(user_id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      let mei = await MEI.getByCNPJ(cnpj);
      if (!mei) {
        return res.status(404).json({ success: false, error: 'MEI não encontrado. Verifique o CNPJ.' });
      }

      const proposal = await Proposal.create({
        user_id,
        mei_id: mei.id,
        hospital_id,
        title,
        description,
        value,
        duration_days,
        documents,
        priority: 'normal'
      });

      res.status(201).json({ 
        success: true, 
        data: proposal,
        message: 'Proposta enviada com MEI para aprovação rápida'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ProposalController;
