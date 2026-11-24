const express = require('express');
const {
  listDevices,
  registerDevice,
  assignDevice,
  unassignDevice,
  issueDeviceToken,
  updateDeviceSettings,
} = require('../controllers/adminDeviceController');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdmin);

router.get('/devices', listDevices);
router.post('/devices', registerDevice);
router.post('/devices/assign', assignDevice);
router.post('/devices/unassign', unassignDevice);
router.post('/devices/:boxId/token', issueDeviceToken);
router.patch('/devices/:boxId/settings', updateDeviceSettings);

module.exports = router;

