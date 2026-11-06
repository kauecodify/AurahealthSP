const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');
const ambulanceService = require('../services/ambulanceService');
const { validationResult } = require('express-validator');

class AmbulanceController {
  static async getAll(req, res) {
    try {
      const ambulances = await Ambulance.getAll();
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const ambulance = await Ambulance.getById(req.params.id);
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      res.json({ success: true, data: ambulance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByVehicleId(req, res) {
    try {
      const ambulance = await Ambulance.getByVehicleId(req.params.vehicleId);
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      res.json({ success: true, data: ambulance });
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
      const ambulance = await Ambulance.create(req.body);
      res.status(201).json({ success: true, data: ambulance });
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
      const ambulance = await Ambulance.update(req.params.id, req.body);
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      res.json({ success: true, data: ambulance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Ambulance.delete(req.params.id);
      res.json({ success: true, message: 'Ambulância removida com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getLocation(req, res) {
    try {
      const location = await Ambulance.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      res.json({ success: true, data: location });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateLocation(req, res) {
    try {
      const { latitude, longitude, speed, heading } = req.body;
      const ambulance = await Ambulance.updateLocation(
        req.params.id,
        latitude,
        longitude,
        speed,
        heading
      );
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      
      ambulanceService.broadcastLocation(ambulance);
      res.json({ success: true, data: ambulance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const ambulance = await Ambulance.updateStatus(req.params.id, status);
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }
      
      ambulanceService.broadcastStatus(ambulance);
      res.json({ success: true, data: ambulance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async assignToEmergency(req, res) {
    try {
      const { emergencyId } = req.body;
      await Ambulance.assignToEmergency(req.params.id, emergencyId);
      
      const ambulance = await Ambulance.getById(req.params.id);
      ambulanceService.broadcastStatus(ambulance);
      
      res.json({ success: true, message: 'Ambulância atribuída à emergência' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAvailable(req, res) {
    try {
      const ambulances = await Ambulance.getAvailable();
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByStatus(req, res) {
    try {
      const ambulances = await Ambulance.getByStatus(req.params.status);
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByHospital(req, res) {
    try {
      const ambulances = await Ambulance.getByHospital(req.params.hospitalId);
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Ambulance.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getNearby(req, res) {
    try {
      const { latitude, longitude, radiusKm } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({ success: false, error: 'Latitude e longitude são obrigatórios' });
      }
      
      const ambulances = await Ambulance.getNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        radiusKm ? parseFloat(radiusKm) : 10
      );
      res.json({ success: true, data: ambulances });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRealTimeTracking(req, res) {
    try {
      const ambulances = await Ambulance.getAll();
      const trackingData = ambulances.map(ambulance => ({
        id: ambulance.id,
        vehicleId: ambulance.vehicle_id,
        latitude: ambulance.latitude,
        longitude: ambulance.longitude,
        speed: ambulance.speed,
        heading: ambulance.heading,
        status: ambulance.status,
        hospital: ambulance.hospital_name,
        lastUpdate: ambulance.last_update
      }));
      
      res.json({ success: true, data: trackingData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async emergencyBroadcast(req, res) {
    try {
      const { emergency, location } = req.body;
      
      if (!emergency || !location) {
        return res.status(400).json({ success: false, error: 'Emergência e localização são obrigatórios' });
      }

      ambulanceService.broadcastEmergency(emergency, location);
      
      res.json({ 
        success: true, 
        message: 'Emergência transmitida para todas as ambulâncias disponíveis'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AmbulanceController;
