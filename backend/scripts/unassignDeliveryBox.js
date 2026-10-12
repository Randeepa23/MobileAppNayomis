const adminService = require('../services/deliveryBoxAdminService');
const { runCli, withDatabase } = require('./deliveryBoxCliUtils');

const run = async ({
  env = process.env,
  service = adminService,
  logger = console,
  database = {},
} = {}) => {
  const deviceId = adminService.normalizeDeviceId(env.DEVICE_ID);
  const orderId = adminService.normalizeOrderId(env.ORDER_ID);
  return withDatabase(async () => {
    const result = await service.unassignDeliveryBox(deviceId, orderId);
    logger.log(`Device ID: ${result.deviceId}`);
    logger.log(`Unassigned order ID: ${result.orderId}`);
    logger.log(`Box status: ${result.boxStatus}`);
    logger.log('Unassignment result: relationship cleared and verified');
    return result;
  }, database);
};

if (require.main === module) runCli(run, 'Delivery-box unassignment failed.');

module.exports = { run };
