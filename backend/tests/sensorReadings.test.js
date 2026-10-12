process.env.JWT_SECRET = 'test-only-sensor-secret-with-adequate-length';
process.env.DEVICE_TOKEN_PEPPER = 'test-only-device-pepper-with-adequate-length';

jest.mock('../models/DeliveryBox', () => ({ findOne: jest.fn() }));
jest.mock('../models/Order', () => ({ findById: jest.fn(), find: jest.fn() }));
jest.mock('../models/SensorReading', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');
const SensorReading = require('../models/SensorReading');
const { hashDeviceToken } = require('../middleware/sensorAuth');
const { resetDeviceSensorRateLimitForTests } = require('../middleware/deviceSensorRateLimit');
const { statusForReceivedAt } = require('../controllers/sensorReadingController');

const CUSTOMER_ID = '64b000000000000000000001';
const OTHER_CUSTOMER_ID = '64b000000000000000000002';
const ORDER_ID = '64c000000000000000000001';
const READING_ID = '64d000000000000000000001';
const BOX_DB_ID = '64e000000000000000000001';
const DEVICE_ID = 'BOX-001';
const DEVICE_TOKEN = 'test-device-token-at-least-thirty-two-characters';

const customerToken = (studentId = CUSTOMER_ID) => jwt.sign(
  { studentId, email: 'customer@example.com', role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' },
);

const device = (overrides = {}) => ({
  _id: BOX_DB_ID,
  boxId: DEVICE_ID,
  deviceTokenHash: hashDeviceToken(DEVICE_TOKEN),
  orderId: ORDER_ID,
  status: 'assigned',
  ...overrides,
});

const order = (overrides = {}) => ({
  _id: ORDER_ID,
  student: CUSTOMER_ID,
  status: 'dispatched',
  delivery: { boxId: DEVICE_ID, assignedAt: new Date('2026-07-20T04:00:00.000Z') },
  createdAt: new Date('2026-07-20T03:00:00.000Z'),
  ...overrides,
});

const reading = (overrides = {}) => ({
  _id: READING_ID,
  temperatureC: 58.4,
  humidityPercent: 64,
  latitude: 6.0535,
  longitude: 80.221,
  motionDetected: true,
  accelerationX: 0.03,
  accelerationY: 0.12,
  accelerationZ: 0.97,
  boxOpen: null,
  batteryPercent: null,
  deviceRecordedAt: new Date('2026-07-20T05:00:00.000Z'),
  receivedAt: new Date(),
  ...overrides,
});

const mockDeviceLookup = (value = device()) => {
  DeliveryBox.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(value) });
};

const mockLatest = (value) => {
  const lean = jest.fn().mockResolvedValue(value);
  const sort = jest.fn().mockReturnValue({ lean });
  SensorReading.findOne.mockReturnValue({ sort });
  return { sort, lean };
};

const validPayload = {
  device_id: DEVICE_ID,
  order_id: ORDER_ID,
  temperature_c: 58.4,
  humidity_percent: 64,
  latitude: 6.0535,
  longitude: 80.221,
  motion_detected: true,
  acceleration_x: 0.03,
  acceleration_y: 0.12,
  acceleration_z: 0.97,
  box_open: null,
  battery_percent: null,
  device_recorded_at: '2026-07-20T10:30:00+05:30',
};

beforeEach(() => {
  jest.clearAllMocks();
  resetDeviceSensorRateLimitForTests();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('a valid authenticated device reading is stored with a server received timestamp', async () => {
  mockDeviceLookup();
  Order.findById.mockResolvedValue(order());
  SensorReading.create.mockImplementation(async (value) => ({ ...value, _id: READING_ID }));

  const response = await request(app).post('/api/device/sensor-readings')
    .set('Authorization', `Device ${DEVICE_TOKEN}`).send(validPayload);

  expect(response.status).toBe(201);
  expect(SensorReading.create).toHaveBeenCalledWith(expect.objectContaining({
    smartBox: BOX_DB_ID, deviceId: DEVICE_ID, order: ORDER_ID, temperatureC: 58.4,
    receivedAt: expect.any(Date),
  }));
  expect(response.body.data).toEqual(expect.objectContaining({ id: READING_ID, received_at: expect.any(String) }));
});

test('an invalid device token is rejected without storing a reading', async () => {
  mockDeviceLookup();
  const response = await request(app).post('/api/device/sensor-readings')
    .set('Authorization', 'Device wrong-device-token').send(validPayload);
  expect(response.status).toBe(401);
  expect(response.body.code).toBe('INVALID_DEVICE_CREDENTIALS');
  expect(SensorReading.create).not.toHaveBeenCalled();
});

test.each([
  ['temperature', { temperature_c: 126 }],
  ['humidity', { humidity_percent: 101 }],
  ['latitude', { latitude: -91 }],
  ['longitude', { longitude: 181 }],
])('invalid %s input is rejected', async (_field, invalidValue) => {
  mockDeviceLookup();
  const response = await request(app).post('/api/device/sensor-readings')
    .set('Authorization', `Device ${DEVICE_TOKEN}`).send({ ...validPayload, ...invalidValue });
  expect(response.status).toBe(400);
  expect(response.body.code).toBe('VALIDATION_ERROR');
  expect(SensorReading.create).not.toHaveBeenCalled();
});

test('missing optional sensor fields are stored as null rather than false or zero', async () => {
  mockDeviceLookup();
  Order.findById.mockResolvedValue(order());
  SensorReading.create.mockImplementation(async (value) => ({ ...value, _id: READING_ID }));
  const response = await request(app).post('/api/device/sensor-readings')
    .set('Authorization', `Device ${DEVICE_TOKEN}`).send({ device_id: DEVICE_ID, order_id: ORDER_ID });
  expect(response.status).toBe(201);
  expect(SensorReading.create).toHaveBeenCalledWith(expect.objectContaining({
    temperatureC: null, humidityPercent: null, latitude: null, longitude: null,
    motionDetected: null, boxOpen: null, batteryPercent: null, deviceRecordedAt: null,
  }));
});

test('an unassigned device cannot submit a reading for an order', async () => {
  mockDeviceLookup(device({ orderId: OTHER_CUSTOMER_ID }));
  const response = await request(app).post('/api/device/sensor-readings')
    .set('Authorization', `Device ${DEVICE_TOKEN}`).send(validPayload);
  expect(response.status).toBe(409);
  expect(response.body.code).toBe('DEVICE_NOT_ASSIGNED');
  expect(Order.findById).not.toHaveBeenCalled();
  expect(SensorReading.create).not.toHaveBeenCalled();
});

test('a customer can view paginated readings for their own order', async () => {
  Order.findById.mockResolvedValue(order());
  const first = reading();
  SensorReading.find.mockReturnValue({
    sort: () => ({ skip: () => ({ limit: () => ({ lean: async () => [first] }) }) }),
  });
  SensorReading.countDocuments.mockResolvedValue(1);
  mockLatest(first);
  const response = await request(app).get(`/api/pre-orders/${ORDER_ID}/sensor-readings?page=1&per_page=25`)
    .set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(response.body.data.readings).toHaveLength(1);
  expect(response.body.data.pagination).toEqual(expect.objectContaining({ page: 1, total: 1, total_pages: 1 }));
  expect(response.body.data.readings[0]).not.toHaveProperty('deviceTokenHash');
});

test('a customer receives 403 for another customer order', async () => {
  Order.findById.mockResolvedValue(order({ student: OTHER_CUSTOMER_ID }));
  const response = await request(app).get(`/api/pre-orders/${ORDER_ID}/sensor-readings/latest`)
    .set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(403);
  expect(response.body.code).toBe('ORDER_ACCESS_DENIED');
  expect(SensorReading.findOne).not.toHaveBeenCalled();
});

test('the active-delivery selector query is restricted to the authenticated customer', async () => {
  const lean = jest.fn().mockResolvedValue([order()]);
  const sort = jest.fn().mockReturnValue({ lean });
  const select = jest.fn().mockReturnValue({ sort });
  Order.find.mockReturnValue({ select });
  const response = await request(app).get('/api/pre-orders/sensor-orders')
    .set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(Order.find).toHaveBeenCalledWith(expect.objectContaining({ student: CUSTOMER_ID }));
  expect(response.body.data.orders[0]).toEqual(expect.objectContaining({
    order_id: ORDER_ID, device_id: DEVICE_ID, delivery_status: 'dispatched',
  }));
});

test('an assigned order with no readings returns the waiting-for-data empty response', async () => {
  Order.findById.mockResolvedValue(order());
  mockLatest(null);
  const response = await request(app).get(`/api/pre-orders/${ORDER_ID}/sensor-readings/latest`)
    .set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(response.body.data).toEqual(expect.objectContaining({
    assignment_status: 'waiting_for_data', device_status: 'waiting_for_data', latest: null,
  }));
});

test('the latest-reading endpoint requests and returns the newest received record', async () => {
  Order.findById.mockResolvedValue(order());
  const newest = reading({ temperatureC: 61.25 });
  const query = mockLatest(newest);
  const response = await request(app).get(`/api/pre-orders/${ORDER_ID}/sensor-readings/latest`)
    .set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(query.sort).toHaveBeenCalledWith({ receivedAt: -1 });
  expect(response.body.data.latest.temperature_c).toBe(61.25);
});

test('device online, stale and offline status uses the server comparison time', () => {
  const now = new Date('2026-07-20T10:10:00.000Z');
  expect(statusForReceivedAt(new Date('2026-07-20T10:09:00.000Z'), now)).toBe('online');
  expect(statusForReceivedAt(new Date('2026-07-20T10:08:59.999Z'), now)).toBe('stale');
  expect(statusForReceivedAt(new Date('2026-07-20T10:05:00.000Z'), now)).toBe('stale');
  expect(statusForReceivedAt(new Date('2026-07-20T10:04:59.999Z'), now)).toBe('offline');
  expect(statusForReceivedAt(null, now)).toBe('waiting_for_data');
});

test('the existing pre-order history route remains available', async () => {
  const sort = jest.fn().mockResolvedValue([]);
  Order.find.mockReturnValue({ populate: () => ({ populate: () => ({ sort }) }) });
  const response = await request(app).get(`/api/orders/student/${CUSTOMER_ID}`);
  expect(response.status).toBe(200);
  expect(response.body.data.orders).toEqual([]);
});
