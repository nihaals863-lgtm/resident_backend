import * as chargeService from '../services/charge.service.js';

export const getResidentCharges = async (req, res) => {
  try {
    const { residentId } = req.query;
    const charges = await chargeService.getResidentCharges(residentId);
    res.json({ success: true, data: charges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCharge = async (req, res) => {
  try {
    const charge = await chargeService.createManualCharge(req.body);
    res.json({ success: true, data: charge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addChargeDefinition = async (req, res) => {
  try {
    const chargeDef = await chargeService.addChargeDefinition(req.body);
    res.json({ success: true, data: chargeDef });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getChargeDefinitions = async (req, res) => {
  try {
    const { residentId } = req.query;
    const definitions = await chargeService.getChargeDefinitions(residentId);
    res.json({ success: true, data: definitions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteChargeDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    await chargeService.deleteChargeDefinition(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateMonthlyCharges = async (req, res) => {
  try {
    const { residentId } = req.params;
    const result = await chargeService.generateMonthlyCharges(residentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
