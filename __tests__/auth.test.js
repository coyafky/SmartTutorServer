const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('认证接口测试', () => {
  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        role: 'parent',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('应该拒绝重复的电子邮件注册', async () => {
      await User.create({
        username: 'existinguser',
        password: 'password123',
        role: 'parent',
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',

        password: 'password123',
        role: 'parent',
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',

        password: 'password123',
        role: 'parent',
      });
    });

    it('应该成功登录用户', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('应该拒绝错误的密码', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
