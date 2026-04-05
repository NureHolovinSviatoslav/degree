'use strict';

const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');

process.env.MODE_TEST = 'true';
process.env.JWT_SECRET = 'test-secret-key';

const mockUser = {
  findAll: mock.fn(),
  findByPk: mock.fn(),
  findOne: mock.fn(),
  create: mock.fn(),
  update: mock.fn(),
  destroy: mock.fn(),
  hasMany: mock.fn(),
  hasOne: mock.fn(),
};

const mockGamificationSettings = {
  create: mock.fn(),
  belongsTo: mock.fn(),
};

const mockSequelize = {
  define: mock.fn(() => mockUser),
  sync: mock.fn(),
};

const dbPath = require.resolve(path.join(__dirname, '..', 'services', 'db.js'));
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { sequelize: mockSequelize },
};

const userModelPath = require.resolve(
  path.join(__dirname, '..', 'models', 'User.js'),
);
require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: { User: mockUser },
};

const gamSettingsModelPath = require.resolve(
  path.join(__dirname, '..', 'models', 'GamificationSettings.js'),
);
require.cache[gamSettingsModelPath] = {
  id: gamSettingsModelPath,
  filename: gamSettingsModelPath,
  loaded: true,
  exports: { GamificationSettings: mockGamificationSettings },
};

const express = require('express');
const http = require('http');
const { hashString } = require('../services/hashString');
const { router } = require('../routes/user');

const app = express();
app.use(express.json());
app.use('/users', router);

function request(server, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path: urlPath,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? tryParse(data) : null,
          raw: data,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

let server;

describe('User routes', () => {
  beforeEach(() => {
    mockUser.findAll.mock.resetCalls();
    mockUser.findByPk.mock.resetCalls();
    mockUser.findOne.mock.resetCalls();
    mockUser.create.mock.resetCalls();
    mockUser.update.mock.resetCalls();
    mockUser.destroy.mock.resetCalls();
    mockGamificationSettings.create.mock.resetCalls();

    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /users', () => {
    it('should return all users without password_hash', async () => {
      const users = [
        { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'student' },
      ];
      mockUser.findAll.mock.mockImplementation(async () => users);

      const res = await request(server, 'GET', '/users');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, users);
      const callArgs = mockUser.findAll.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs.attributes.exclude, ['password_hash']);
    });

    it('should return 400 when findAll throws', async () => {
      mockUser.findAll.mock.mockImplementation(async () => {
        throw new Error('DB error');
      });

      const res = await request(server, 'GET', '/users');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'DB error');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user', async () => {
      const user = { id: 'u1', name: 'Alice', email: 'a@b.com' };
      mockUser.findByPk.mock.mockImplementation(async () => user);

      const res = await request(server, 'GET', '/users/u1');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, user);
    });

    it('should return 404 when user not found', async () => {
      mockUser.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'GET', '/users/missing');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'User not found');
    });
  });

  describe('POST /users', () => {
    it('should create a user and return 201 with safe fields', async () => {
      const created = {
        id: 'new-id',
        name: 'Bob',
        email: 'bob@test.com',
        role: 'student',
        password_hash: '12345',
      };
      mockUser.create.mock.mockImplementation(async () => created);

      const res = await request(server, 'POST', '/users', {
        name: 'Bob',
        email: 'bob@test.com',
        password: 'secret',
        role: 'student',
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.id, 'new-id');
      assert.strictEqual(res.body.name, 'Bob');
      assert.strictEqual(res.body.email, 'bob@test.com');
      assert.strictEqual(res.body.password_hash, undefined);
    });

    it('should return 400 when creation fails', async () => {
      mockUser.create.mock.mockImplementation(async () => {
        throw new Error('Validation error');
      });

      const res = await request(server, 'POST', '/users', {
        name: 'Fail',
        email: 'fail@test.com',
        password: 'somepass',
        role: 'student',
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'Validation error');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update and return user without password_hash', async () => {
      const updated = { id: 'u1', name: 'Updated', email: 'a@b.com' };
      mockUser.update.mock.mockImplementation(async () => [1]);
      mockUser.findByPk.mock.mockImplementation(async () => updated);

      const res = await request(server, 'PATCH', '/users/u1', {
        name: 'Updated',
      });

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, updated);
    });

    it('should hash password when password field is provided', async () => {
      const updated = { id: 'u1', name: 'Alice' };
      mockUser.update.mock.mockImplementation(async () => [1]);
      mockUser.findByPk.mock.mockImplementation(async () => updated);

      await request(server, 'PATCH', '/users/u1', {
        password: 'newpass123',
      });

      const callArgs = mockUser.update.mock.calls[0].arguments[0];
      assert.strictEqual(
        callArgs.password_hash,
        hashString('newpass123').toString(),
      );
      assert.strictEqual(callArgs.password, undefined);
    });

    it('should return 404 when user not found after update', async () => {
      mockUser.update.mock.mockImplementation(async () => [0]);
      mockUser.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'PATCH', '/users/missing', {
        name: 'X',
      });

      assert.strictEqual(res.status, 404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete and return 204', async () => {
      mockUser.destroy.mock.mockImplementation(async () => 1);

      const res = await request(server, 'DELETE', '/users/u1');

      assert.strictEqual(res.status, 204);
    });

    it('should return 404 when user does not exist', async () => {
      mockUser.destroy.mock.mockImplementation(async () => 0);

      const res = await request(server, 'DELETE', '/users/missing');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'User not found');
    });
  });

  describe('POST /users/login', () => {
    it('should return access token on valid credentials', async () => {
      const passwordHash = hashString('correctpassword').toString();
      mockUser.findOne.mock.mockImplementation(async () => ({
        id: 'u1',
        email: 'test@test.com',
        password_hash: passwordHash,
        role: 'student',
      }));

      const res = await request(server, 'POST', '/users/login', {
        email: 'test@test.com',
        password: 'correctpassword',
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.accessToken);
    });

    it('should return 401 for wrong password', async () => {
      mockUser.findOne.mock.mockImplementation(async () => ({
        id: 'u1',
        email: 'test@test.com',
        password_hash: hashString('correctpassword').toString(),
        role: 'student',
      }));

      const res = await request(server, 'POST', '/users/login', {
        email: 'test@test.com',
        password: 'wrongpassword',
      });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.raw, 'Invalid email or password');
    });

    it('should return 401 when user not found', async () => {
      mockUser.findOne.mock.mockImplementation(async () => null);

      const res = await request(server, 'POST', '/users/login', {
        email: 'nobody@test.com',
        password: 'pass',
      });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.raw, 'Invalid email or password');
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user and return access token', async () => {
      mockUser.findOne.mock.mockImplementation(async () => null);
      mockUser.create.mock.mockImplementation(async (data) => ({
        id: 'new-id',
        ...data,
        role: 'student',
      }));
      mockGamificationSettings.create.mock.mockImplementation(async () => ({}));

      const res = await request(server, 'POST', '/users/register', {
        name: 'New User',
        email: 'new@test.com',
        password: 'secret123',
        phone: '+380123456789',
      });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.accessToken);
      assert.strictEqual(mockGamificationSettings.create.mock.callCount(), 1);
    });

    it('should return 409 when email already exists', async () => {
      mockUser.findOne.mock.mockImplementation(async () => ({
        id: 'existing',
        email: 'taken@test.com',
      }));

      const res = await request(server, 'POST', '/users/register', {
        name: 'Dup',
        email: 'taken@test.com',
        password: 'secret',
      });

      assert.strictEqual(res.status, 409);
    });

    it('should return 400 when creation throws', async () => {
      mockUser.findOne.mock.mockImplementation(async () => null);
      mockUser.create.mock.mockImplementation(async () => {
        throw new Error('Validation error');
      });

      const res = await request(server, 'POST', '/users/register', {
        name: 'Bad',
        email: 'bad@test.com',
        password: 'x',
      });

      assert.strictEqual(res.status, 400);
    });
  });
});
