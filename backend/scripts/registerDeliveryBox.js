const adminService = require('../services/deliveryBoxAdminService');
const { noValue, runCli, withDatabase } = require('./deliveryBoxCliUtils');

const run = async ({
  env = process.env,
  service = adminService,
  logger = console,
  database = {},
} = {}) => {
  const deviceId = adminService.normalizeDeviceId(env.DEVICE_ID);
  return withDatabase(async () => {
    const result = await service.registerDeliveryBox(deviceId);
    logger.log(`Device ID: ${result.deviceId}`);
    logger.log(`Box status: ${result.status}`);
    logger.log(`Assigned order ID: ${noValue(result.assignedOrderId)}`);
    logger.log(`Registration result: ${result.created ? 'created' : 'already registered; no duplicate created'}`);
    return result;
  }, database);
};

if (require.main === module) runCli(run, 'Delivery-box registration failed.');

module.exports = { run };
