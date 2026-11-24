const Alert = require('../models/Alert');

const listAlerts = async (req, res) => {
  try {
    const { resolved, severity, boxId, orderId, limit = 50 } = req.query;
    const filter = {};

    if (resolved !== undefined) {
      filter.resolved = resolved === 'true';
    }
    if (severity) filter.severity = severity;
    if (boxId) filter.boxId = boxId;
    if (orderId) filter.orderId = orderId;

    const alerts = await Alert.find(filter)
      .populate('orderId', 'pickupLocation deliveryDate status')
      .populate('triggerReading', 'temperatureC humidityPercent gasRaw receivedAt')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Number(limit)))
      .lean();

    return res.json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    console.error('Failed to list alerts:', error);
    return res.status(500).json({ success: false, message: 'Unable to retrieve alerts.' });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentNotes = '' } = req.body;
    const resolvedBy = req.admin?.email || req.driver?.name || 'Authorized Staff';

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    if (incidentNotes) alert.incidentNotes = incidentNotes;
    await alert.save();

    return res.json({
      success: true,
      message: 'Alert marked as resolved.',
      data: { alert },
    });
  } catch (error) {
    console.error('Failed to resolve alert:', error);
    return res.status(500).json({ success: false, message: 'Unable to resolve alert.' });
  }
};

const getAlertSummary = async (req, res) => {
  try {
    const [unresolvedCount, criticalCount, totalCount] = await Promise.all([
      Alert.countDocuments({ resolved: false }),
      Alert.countDocuments({ resolved: false, severity: 'critical' }),
      Alert.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        unresolvedCount,
        criticalCount,
        totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load alert summary.' });
  }
};

module.exports = {
  listAlerts,
  resolveAlert,
  getAlertSummary,
};

