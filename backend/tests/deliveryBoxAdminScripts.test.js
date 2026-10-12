const {
  createDeliveryBoxAdminService,
} = require('../services/deliveryBoxAdminService');
const { run: runRegistration } = require('../scripts/registerDeliveryBox');
const { run: runCheck } = require('../scripts/checkDeliveryBoxAssignment');

const DEVICE_ID = 'BOX-001';
const OTHER_DEVICE_ID = 'BOX-002';
const ORDER_ID = '64c000000000000000000001';
const OTHER_ORDER_ID = '64c000000000000000000002';
const BOX_DB_ID = '64e000000000000000000001';

const box = (overrides = {}) => ({
  _id: BOX_DB_ID,
  boxId: DEVICE_ID,
  orderId: null,
  status: 'idle',
  assignedDate: null,
  deliveredDate: null,
  ...overrides,
});

const order = (overrides = {}) => ({
  _id: ORDER_ID,
  status: 'confirmed',
  delivery: {},
  ...overrides,
});

const models = () => {
  const DeliveryBoxModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };
  const OrderModel = {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  return {
    DeliveryBoxModel,
    OrderModel,
    service: createDeliveryBoxAdminService({ DeliveryBoxModel, OrderModel }),
  };
};

test('registration requires DEVICE_ID without opening a database connection', async () => {
  const connect = jest.fn();
  const disconnect = jest.fn();
  await expect(runRegistration({
    env: {},
    database: { connect, disconnect },
  })).rejects.toThrow('Set DEVICE_ID');
  expect(connect).not.toHaveBeenCalled();
  expect(disconnect).not.toHaveBeenCalled();
});

test('registration creates the minimum valid unassigned delivery box', async () => {
  const context = models();
  context.DeliveryBoxModel.findOne.mockResolvedValue(null);
  context.DeliveryBoxModel.create.mockImplementation(async (value) => value);

  const result = await context.service.registerDeliveryBox(`  ${DEVICE_ID}  `);

  expect(context.DeliveryBoxModel.create).toHaveBeenCalledWith({
    boxId: DEVICE_ID,
    orderId: null,
    status: 'idle',
    assignedDate: null,
    deliveredDate: null,
  });
  expect(result).toEqual({ created: true, deviceId: DEVICE_ID, status: 'idle', assignedOrderId: null });
});

test('repeated registration is idempotent', async () => {
  const context = models();
  context.DeliveryBoxModel.findOne.mockResolvedValue(box());

  const result = await context.service.registerDeliveryBox(DEVICE_ID);

  expect(result.created).toBe(false);
  expect(context.DeliveryBoxModel.create).not.toHaveBeenCalled();
});

test('an invalid ORDER_ID is rejected before querying either record', async () => {
  const context = models();
  await expect(context.service.assignDeliveryBox(DEVICE_ID, 'not-an-object-id'))
    .rejects.toThrow('valid MongoDB ObjectId');
  expect(context.OrderModel.findById).not.toHaveBeenCalled();
  expect(context.DeliveryBoxModel.findOne).not.toHaveBeenCalled();
});

test('a missing order is rejected', async () => {
  const context = models();
  context.OrderModel.findById.mockResolvedValue(null);
  context.DeliveryBoxModel.findOne.mockResolvedValue(box());

  await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow(`Order ${ORDER_ID} does not exist`);
  expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
});

test('a missing delivery box is rejected', async () => {
  const context = models();
  context.OrderModel.findById.mockResolvedValue(order());
  context.DeliveryBoxModel.findOne.mockResolvedValue(null);

  await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow(`Delivery box ${DEVICE_ID} does not exist`);
  expect(context.OrderModel.findOneAndUpdate).not.toHaveBeenCalled();
});

test.each(['delivered', 'completed', 'cancelled', 'rejected'])(
  'a terminal %s order is rejected',
  async (status) => {
    const context = models();
    context.OrderModel.findById.mockResolvedValue(order({ status }));
    context.DeliveryBoxModel.findOne.mockResolvedValue(box());

    await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
      .rejects.toThrow('not eligible for assignment');
    expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
  },
);

test.each(['pending', 'validated'])(
  'an unconfirmed %s order is not yet eligible for assignment',
  async (status) => {
    const context = models();
    context.OrderModel.findById.mockResolvedValue(order({ status }));
    context.DeliveryBoxModel.findOne.mockResolvedValue(box());

    await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
      .rejects.toThrow('not eligible for assignment');
    expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
  },
);

test('successful assignment conditionally updates and verifies both records', async () => {
  const context = models();
  const initialOrder = order();
  const initialBox = box();
  const assignedBox = box({ orderId: ORDER_ID, status: 'assigned', assignedDate: new Date() });
  const assignedOrder = order({ delivery: { boxId: DEVICE_ID, assignedAt: assignedBox.assignedDate } });
  context.OrderModel.findById
    .mockResolvedValueOnce(initialOrder)
    .mockResolvedValueOnce(assignedOrder);
  context.DeliveryBoxModel.findOne
    .mockResolvedValueOnce(initialBox)
    .mockResolvedValueOnce(assignedBox);
  context.DeliveryBoxModel.findOneAndUpdate.mockResolvedValue(assignedBox);
  context.OrderModel.findOneAndUpdate.mockResolvedValue(assignedOrder);

  const result = await context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID);

  expect(context.DeliveryBoxModel.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ boxId: DEVICE_ID, orderId: null, status: 'idle' }),
    expect.objectContaining({ $set: expect.objectContaining({ orderId: ORDER_ID, status: 'assigned' }) }),
    expect.objectContaining({ new: true, runValidators: true }),
  );
  expect(context.OrderModel.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ _id: ORDER_ID, status: { $in: expect.any(Array) } }),
    expect.objectContaining({ $set: expect.objectContaining({ 'delivery.boxId': DEVICE_ID }) }),
    expect.objectContaining({ new: true, runValidators: true }),
  );
  expect(result).toEqual(expect.objectContaining({ deviceId: DEVICE_ID, orderId: ORDER_ID, boxStatus: 'assigned' }));
});

test('assignment restores the box when the conditional order update loses a race', async () => {
  const context = models();
  const initialBox = box();
  const initialOrder = order();
  context.DeliveryBoxModel.findOne.mockResolvedValue(initialBox);
  context.OrderModel.findById.mockResolvedValue(initialOrder);
  context.DeliveryBoxModel.findOneAndUpdate.mockResolvedValue(box({
    orderId: ORDER_ID,
    status: 'assigned',
    assignedDate: new Date(),
  }));
  context.OrderModel.findOneAndUpdate.mockResolvedValue(null);
  context.DeliveryBoxModel.updateOne.mockResolvedValue({ matchedCount: 1 });

  await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow('delivery box change was restored');
  expect(context.DeliveryBoxModel.updateOne).toHaveBeenCalledWith(
    expect.objectContaining({ _id: BOX_DB_ID, orderId: ORDER_ID, status: 'assigned' }),
    expect.objectContaining({ $set: expect.objectContaining({ orderId: null, status: 'idle' }) }),
    { runValidators: true },
  );
});

test('a box assigned to another order is rejected', async () => {
  const context = models();
  context.OrderModel.findById.mockResolvedValue(order());
  context.DeliveryBoxModel.findOne.mockResolvedValue(box({ orderId: OTHER_ORDER_ID, status: 'assigned' }));

  await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow(`already assigned to order ${OTHER_ORDER_ID}`);
  expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
});

test('an order assigned to another box is rejected', async () => {
  const context = models();
  context.OrderModel.findById.mockResolvedValue(order({ delivery: { boxId: OTHER_DEVICE_ID } }));
  context.DeliveryBoxModel.findOne.mockResolvedValue(box());

  await expect(context.service.assignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow(`already assigned to delivery box ${OTHER_DEVICE_ID}`);
  expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
});

test('assignment verification detects disagreement between the two records', async () => {
  const context = models();
  const select = jest.fn().mockResolvedValue(box({
    orderId: ORDER_ID,
    status: 'assigned',
    deviceTokenHash: 'a'.repeat(64),
  }));
  context.DeliveryBoxModel.findOne.mockReturnValue({ select });
  context.OrderModel.findById.mockResolvedValue(order({ delivery: { boxId: OTHER_DEVICE_ID } }));

  const result = await context.service.checkDeliveryBoxAssignment(DEVICE_ID, ORDER_ID);

  expect(result.agrees).toBe(false);
  expect(result).not.toHaveProperty('deviceTokenHash');

  const disconnect = jest.fn();
  await expect(runCheck({
    env: { DEVICE_ID, ORDER_ID },
    service: { checkDeliveryBoxAssignment: jest.fn().mockResolvedValue(result) },
    logger: { log: jest.fn() },
    database: { connect: jest.fn(), disconnect },
  })).rejects.toThrow('assignment is inconsistent');
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test('unassignment requires DEVICE_ID and ORDER_ID to match both existing links', async () => {
  const context = models();
  context.DeliveryBoxModel.findOne.mockResolvedValue(box({ orderId: OTHER_ORDER_ID, status: 'assigned' }));
  context.OrderModel.findById.mockResolvedValue(order({ delivery: { boxId: DEVICE_ID } }));

  await expect(context.service.unassignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow('do not match the existing two-sided assignment');
  expect(context.DeliveryBoxModel.findOneAndUpdate).not.toHaveBeenCalled();
  expect(context.OrderModel.findOneAndUpdate).not.toHaveBeenCalled();
});

test('successful unassignment clears and verifies both records', async () => {
  const context = models();
  const initialBox = box({ orderId: ORDER_ID, status: 'assigned', assignedDate: new Date() });
  const initialOrder = order({ delivery: { boxId: DEVICE_ID, assignedAt: initialBox.assignedDate } });
  const idleBox = box();
  const unassignedOrder = order();
  context.DeliveryBoxModel.findOne
    .mockResolvedValueOnce(initialBox)
    .mockResolvedValueOnce(idleBox);
  context.OrderModel.findById
    .mockResolvedValueOnce(initialOrder)
    .mockResolvedValueOnce(unassignedOrder);
  context.DeliveryBoxModel.findOneAndUpdate.mockResolvedValue(idleBox);
  context.OrderModel.findOneAndUpdate.mockResolvedValue(unassignedOrder);

  const result = await context.service.unassignDeliveryBox(DEVICE_ID, ORDER_ID);

  expect(context.DeliveryBoxModel.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ boxId: DEVICE_ID, orderId: ORDER_ID, status: 'assigned' }),
    { $set: { orderId: null, status: 'idle', assignedDate: null, deliveredDate: null } },
    expect.objectContaining({ new: true, runValidators: true }),
  );
  expect(context.OrderModel.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: ORDER_ID, 'delivery.boxId': DEVICE_ID },
    { $unset: { 'delivery.boxId': '', 'delivery.assignedAt': '' } },
    expect.objectContaining({ new: true, runValidators: true }),
  );
  expect(result.boxStatus).toBe('idle');
});

test('unassignment restores the box when the conditional order update loses a race', async () => {
  const context = models();
  const assignedDate = new Date();
  context.DeliveryBoxModel.findOne.mockResolvedValue(box({
    orderId: ORDER_ID,
    status: 'assigned',
    assignedDate,
  }));
  context.OrderModel.findById.mockResolvedValue(order({
    delivery: { boxId: DEVICE_ID, assignedAt: assignedDate },
  }));
  context.DeliveryBoxModel.findOneAndUpdate.mockResolvedValue(box());
  context.OrderModel.findOneAndUpdate.mockResolvedValue(null);
  context.DeliveryBoxModel.updateOne.mockResolvedValue({ matchedCount: 1 });

  await expect(context.service.unassignDeliveryBox(DEVICE_ID, ORDER_ID))
    .rejects.toThrow('delivery box change was restored');
  expect(context.DeliveryBoxModel.updateOne).toHaveBeenCalledWith(
    expect.objectContaining({ _id: BOX_DB_ID, orderId: null, status: 'idle' }),
    {
      $set: {
        orderId: ORDER_ID,
        status: 'assigned',
        assignedDate,
        deliveredDate: null,
      },
    },
    { runValidators: true },
  );
});

test('verification output never prints token fields or secret values', async () => {
  const logs = [];
  const logger = { log: (message) => logs.push(message) };
  const privateToken = 'private-device-token-that-must-not-be-printed';
  const privatePepper = 'private-pepper-that-must-not-be-printed';
  const privateDigest = 'f'.repeat(64);
  const service = {
    checkDeliveryBoxAssignment: jest.fn().mockResolvedValue({
      deviceId: DEVICE_ID,
      boxStatus: 'assigned',
      assignedOrderId: ORDER_ID,
      orderStatus: 'confirmed',
      orderDeliveryBoxId: DEVICE_ID,
      agrees: true,
      deviceTokenConfigured: true,
      deviceTokenHash: privateDigest,
    }),
  };

  await runCheck({
    env: {
      DEVICE_ID,
      ORDER_ID,
      DEVICE_TOKEN: privateToken,
      DEVICE_TOKEN_PEPPER: privatePepper,
    },
    service,
    logger,
    database: { connect: jest.fn(), disconnect: jest.fn() },
  });

  const output = logs.join('\n');
  expect(output).not.toContain(privateToken);
  expect(output).not.toContain(privatePepper);
  expect(output).not.toContain(privateDigest);
  expect(output).not.toContain('deviceTokenHash');
  expect(output).not.toContain('DEVICE_TOKEN_PEPPER');
});
