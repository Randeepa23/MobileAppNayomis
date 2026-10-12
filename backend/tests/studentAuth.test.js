process.env.JWT_SECRET = 'test-only-customer-secret-with-adequate-length';
process.env.CUSTOMER_JWT_EXPIRES_IN = '24h';

jest.mock('../models/Student', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const Student = require('../models/Student');
const { resetAuthRateLimitForTests } = require('../middleware/authRateLimit');

const student = {
  _id: { toString: () => 'student-1' },
  name: 'Nayomi Perera',
  email: 'nayomi@example.com',
  role: 'user',
  points: 0,
  orders: [],
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
};

const customerToken = () => jwt.sign(
  { studentId: 'student-1', email: student.email, role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' },
);

beforeEach(() => {
  jest.clearAllMocks();
  resetAuthRateLimitForTests();
});

test('successful registration normalizes email, hashes password, and never returns hash', async () => {
  Student.findOne.mockReturnValue({ select: () => ({ lean: async () => null }) });
  Student.create.mockImplementation(async (value) => ({ ...student, ...value, _id: student._id }));
  const response = await request(app).post('/api/students/register').send({
    name: '  Nayomi Perera ', email: ' NAYOMI@EXAMPLE.COM ', password: 'secret',
  });
  expect(response.status).toBe(201);
  expect(response.body.data.student.password).toBeUndefined();
  const created = Student.create.mock.calls[0][0];
  expect(created.email).toBe('nayomi@example.com');
  expect(await bcrypt.compare('secret', created.password)).toBe(true);
});

test('duplicate registration has stable response', async () => {
  Student.findOne.mockReturnValue({ select: () => ({ lean: async () => ({ _id: 'existing' }) }) });
  const response = await request(app).post('/api/students/register').send({ name: 'Nayomi', email: student.email, password: 'secret' });
  expect(response.status).toBe(400);
  expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
});

test('invalid registration payload returns field validation without internals', async () => {
  const response = await request(app).post('/api/students/register').send({ name: '', email: 'bad', password: '1' });
  expect(response.status).toBe(400);
  expect(response.body.code).toBe('VALIDATION_ERROR');
  expect(response.body.errors).toEqual(expect.objectContaining({ name: expect.any(String), email: expect.any(String), password: expect.any(String) }));
});

test('successful login returns a 24 hour customer JWT and safe student', async () => {
  const password = await bcrypt.hash('secret', 10);
  Student.findOne.mockReturnValue({ select: async () => ({ ...student, password }) });
  const response = await request(app).post('/api/students/login').send({ email: student.email, password: 'secret' });
  expect(response.status).toBe(200);
  expect(response.body.data.student.password).toBeUndefined();
  const payload = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
  expect(payload.studentId).toBe('student-1');
  expect(payload.role).toBe('user');
  expect(payload.exp - payload.iat).toBe(24 * 60 * 60);
});

test.each([
  ['wrong password', { ...student, password: bcrypt.hashSync('secret', 10) }, 'wrong'],
  ['unknown email', null, 'secret'],
])('%s returns the same invalid credentials response', async (_name, record, password) => {
  Student.findOne.mockReturnValue({ select: async () => record });
  const response = await request(app).post('/api/students/login').send({ email: student.email, password });
  expect(response.status).toBe(401);
  expect(response.body).toEqual(expect.objectContaining({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }));
});

test('current-customer endpoint requires a token and returns only token owner', async () => {
  expect((await request(app).get('/api/students/me')).status).toBe(401);
  Student.findById.mockResolvedValue(student);
  const response = await request(app).get('/api/students/me').set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(Student.findById).toHaveBeenCalledWith('student-1');
  expect(response.body.data.student.password).toBeUndefined();
});

test('invalid token and admin token are rejected', async () => {
  expect((await request(app).get('/api/students/me').set('Authorization', 'Bearer invalid')).status).toBe(401);
  const admin = jwt.sign({ type: 'admin', email: 'admin@example.com' }, process.env.JWT_SECRET);
  const response = await request(app).get('/api/students/me').set('Authorization', `Bearer ${admin}`);
  expect(response.status).toBe(403);
});

test('legacy profile endpoint enforces ownership', async () => {
  const response = await request(app).get('/api/students/someone-else').set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(403);
  expect(Student.findById).not.toHaveBeenCalled();
});

test('legacy owner profile preserves the website flat data shape', async () => {
  Student.findById.mockResolvedValue(student);
  const response = await request(app).get('/api/students/student-1').set('Authorization', `Bearer ${customerToken()}`);
  expect(response.status).toBe(200);
  expect(response.body.data.email).toBe(student.email);
  expect(response.body.data.student).toBeUndefined();
});

test('auth endpoints are rate limited', async () => {
  Student.findOne.mockReturnValue({ select: async () => null });
  for (let index = 0; index < 10; index += 1) {
    await request(app).post('/api/students/login').send({ email: student.email, password: 'wrong' });
  }
  const response = await request(app).post('/api/students/login').send({ email: student.email, password: 'wrong' });
  expect(response.status).toBe(429);
  expect(response.body.code).toBe('RATE_LIMITED');
});
