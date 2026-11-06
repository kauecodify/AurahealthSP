const SatelliteConfig = require('../config/satellite');
const Ambulance = require('../models/Ambulance');
const ambulanceService = require('../services/ambulanceService');

class SatelliteController {
  constructor() {
    this.satellite = new SatelliteConfig();
  }

  static async getCoverage(req, res) {
    try {
      const coverage = await new SatelliteConfig().getCoverage();
      res.json({ success: true, data: coverage });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStatus(req, res) {
    try {
      const status = await new SatelliteConfig().getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async sendCommand(req, res) {
    try {
      const { command, target, priority } = req.body;
      
      if (!command) {
        return res.status(400).json({ success: false, error: 'Comando é obrigatório' });
      }

      const result = await new SatelliteConfig().sendCommand({ command, target, priority });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async trackAmbulance(req, res) {
    try {
      const { ambulanceId } = req.params;
      
      const ambulance = await Ambulance.getByVehicleId(ambulanceId);
      if (!ambulance) {
        return res.status(404).json({ success: false, error: 'Ambulância não encontrada' });
      }

      const tracking = await new SatelliteConfig().trackAmbulance(ambulanceId);
      
      res.json({ 
        success: true, 
        data: { 
          ambulance: ambulance,
          tracking: tracking
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async trackAllAmbulances(req, res) {
    try {
      const ambulances = await Ambulance.getAll();
      const trackingData = [];
      
      for (const ambulance of ambulances) {
        const tracking = await new SatelliteConfig().trackAmbulance(ambulance.vehicle_id);
        trackingData.push({
          ambulance: ambulance,
          tracking: tracking
        });
      }

      res.json({ success: true, data: trackingData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSatelliteAmbulanceLocation(req, res) {
    try {
      const { ambulanceId } = req.params;
      
      const location = await new SatelliteConfig().trackAmbulance(ambulanceId);
      
      if (!location) {
        return res.status(404).json({ success: false, error: 'Localização não encontrada' });
      }

      res.json({ success: true, data: location });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async sendEmergencyCommand(req, res) {
    try {
      const { ambulanceId, emergencyLocation } = req.body;
      
      if (!ambulanceId || !emergencyLocation) {
        return res.status(400).json({ success: false, error: 'ambulanceId e emergencyLocation são obrigatórios' });
      }

      const result = await new SatelliteConfig().sendCommand({
        command: 'emergency_redirect',
        target: ambulanceId,
        priority: 'urgent',
        data: emergencyLocation
      });

      ambulanceService.broadcastEmergency(
        { id: `emergency-${Date.now()}`, location: emergencyLocation },
        emergencyLocation
      );

      res.json({ 
        success: true, 
        data: result,
        message: 'Comando de emergência enviado via satélite'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSatelliteStats(req, res) {
    try {
      const coverage = await new SatelliteConfig().getCoverage();
      const status = await new SatelliteConfig().getStatus();
      
      res.json({ 
        success: true, 
        data: { 
          coverage: coverage,
          status: status,
          satellites: process.env.SATELLITE_COUNT || 3,
          signalStrength: process.env.SATELLITE_SIGNAL || '-75dBm'
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async testConnection(req, res) {
    try {
      const result = await new SatelliteConfig().getStatus();
      
      if (result && result.connected) {
        res.json({ 
          success: true, 
          data: { 
            connected: true,
            latency: result.latency || '120ms',
            signal: result.signal || '-75dBm'
          } 
        });
      } else {
        res.status(503).json({ 
          success: false, 
          error: 'Conexão com satélite não disponível'
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAmbulanceSatelliteData(req, res) {
    try {
      const ambulances = await Ambulance.getAll();
      const satelliteData = [];
      
      for (const ambulance of ambulances) {
        const location = await new SatelliteConfig().trackAmbulance(ambulance.vehicle_id);
        satelliteData.push({
          ambulanceId: ambulance.vehicle_id,
          hospital: ambulance.hospital_name,
          latitude: location?.latitude || ambulance.latitude,
          longitude: location?.longitude || ambulance.longitude,
          signalStrength: location?.signalStrength || 'N/A',
          lastUpdate: location?.timestamp || ambulance.last_update
        });
      }

      res.json({ success: true, data: satelliteData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SatelliteController;
