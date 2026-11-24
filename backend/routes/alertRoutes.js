const express = require('express');
const {
  listAlerts,
  resolveAlert,
  getAlertSummary,
} = require('../controllers/alertController');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdmin);

router.get('/', listAlerts);
router.get('/summary', getAlertSummary);
router.patch('/:id/resolve', resolveAlert);

module.exports = router;

