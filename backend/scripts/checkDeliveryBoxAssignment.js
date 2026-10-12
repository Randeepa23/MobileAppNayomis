const adminService = require('../services/deliveryBoxAdminService');
const { noValue, runCli, withDatabase, yesNo } = require('./deliveryBoxCliUtils');

const run = async ({
  env = process.env,
  service = adminService,
  logger = console,
  database = {},
} = {}) => {
  const deviceId = adminService.normalizeDeviceId(env.DEVICE_ID);
  const orderId = env.ORDER_ID == null || String(env.ORDER_ID).trim() === ''
    ? null
    : adminService.normalizeOrderId(env.ORDER_ID);
  return withDatabase(async () => {
    const result = await service.checkDeliveryBoxAssignment(deviceId, orderId);
    logger.log(`Device ID: ${result.deviceId}`);
    logger.log(`Box status: ${result.boxStatus}`);
    logger.log(`Assigned order ID: ${noValue(result.assignedOrderId)}`);
    logger.log(`Order status: ${noValue(result.orderStatus)}`);
    logger.log(`Order.delivery.boxId: ${noValue(result.orderDeliveryBoxId)}`);
    logger.log(`Records agree: ${yesNo(result.agrees)}`);
    logger.log(`Device token digest configured: ${yesNo(result.deviceTokenConfigured)}`);
    if (!result.agrees) throw new Error('Delivery-box assignment is inconsistent.');
    return result;
  }, database);
};

if (require.main === module) runCli(run, 'Delivery-box assignment check failed.');

module.exports = { run };
