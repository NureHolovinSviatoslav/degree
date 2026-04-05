'use strict';

const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');

process.env.MODE_TEST = 'true';

const mockEnrollment = {
  findAll: mock.fn(),
  findByPk: mock.fn(),
  create: mock.fn(),
  update: mock.fn(),
  destroy: mock.fn(),
  belongsTo: mock.fn(),
};

const mockUser = {
  findAll: mock.fn(),
  hasMany: mock.fn(),
  hasOne: mock.fn(),
};

const mockCourse = {
  hasMany: mock.fn(),
  belongsTo: mock.fn(),
};

const mockSequelize = {
  define: mock.fn(() => ({})),
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

const courseModelPath = require.resolve(
  path.join(__dirname, '..', 'models', 'Course.js'),
);
require.cache[courseModelPath] = {
  id: courseModelPath,
  filename: courseModelPath,
  loaded: true,
  exports: { Course: mockCourse },
};

const enrollmentModelPath = require.resolve(
  path.join(__dirname, '..', 'models', 'Enrollment.js'),
);
require.cache[enrollmentModelPath] = {
  id: enrollmentModelPath,
  filename: enrollmentModelPath,
  loaded: true,
  exports: { Enrollment: mockEnrollment },
};

const express = require('express');
const http = require('http');
const { router } = require('../routes/enrollment');

const app = express();
app.use(express.json());
app.use('/enrollments', router);

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

describe('Enrollment routes', () => {
  beforeEach(() => {
    mockEnrollment.findAll.mock.resetCalls();
    mockEnrollment.findByPk.mock.resetCalls();
    mockEnrollment.create.mock.resetCalls();
    mockEnrollment.update.mock.resetCalls();
    mockEnrollment.destroy.mock.resetCalls();

    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /enrollments', () => {
    it('should return all enrollments', async () => {
      const enrollments = [
        { id: 'e1', user_id: 'u1', course_id: 'c1', status: 'in_progress' },
        { id: 'e2', user_id: 'u2', course_id: 'c1', status: 'completed' },
      ];
      mockEnrollment.findAll.mock.mockImplementation(async () => enrollments);

      const res = await request(server, 'GET', '/enrollments');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, enrollments);
    });

    it('should return 400 when findAll throws', async () => {
      mockEnrollment.findAll.mock.mockImplementation(async () => {
        throw new Error('Query failed');
      });

      const res = await request(server, 'GET', '/enrollments');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'Query failed');
    });
  });

  describe('GET /enrollments/:id', () => {
    it('should return enrollment when found', async () => {
      const enrollment = {
        id: 'e1',
        user_id: 'u1',
        course_id: 'c1',
        status: 'in_progress',
      };
      mockEnrollment.findByPk.mock.mockImplementation(async () => enrollment);

      const res = await request(server, 'GET', '/enrollments/e1');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, enrollment);
    });

    it('should return 404 when enrollment not found', async () => {
      mockEnrollment.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'GET', '/enrollments/missing');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Enrollment not found');
    });

    it('should return 400 when findByPk throws', async () => {
      mockEnrollment.findByPk.mock.mockImplementation(async () => {
        throw new Error('Bad ID format');
      });

      const res = await request(server, 'GET', '/enrollments/bad');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'Bad ID format');
    });
  });

  describe('POST /enrollments', () => {
    it('should create enrollment and return 201', async () => {
      const input = {
        user_id: 'u1',
        course_id: 'c1',
        status: 'in_progress',
      };
      const created = { id: 'e-new', ...input };
      mockEnrollment.create.mock.mockImplementation(async () => created);

      const res = await request(server, 'POST', '/enrollments', input);

      assert.strictEqual(res.status, 201);
      assert.deepStrictEqual(res.body, created);
    });

    it('should return 400 on duplicate enrollment', async () => {
      mockEnrollment.create.mock.mockImplementation(async () => {
        throw new Error('Unique constraint violated: user_id, course_id');
      });

      const res = await request(server, 'POST', '/enrollments', {
        user_id: 'u1',
        course_id: 'c1',
        status: 'in_progress',
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.raw.includes('Unique constraint'));
    });
  });

  describe('PATCH /enrollments/:id', () => {
    it('should update and return enrollment', async () => {
      const updated = { id: 'e1', status: 'completed', completion_percent: 100 };
      mockEnrollment.update.mock.mockImplementation(async () => [1]);
      mockEnrollment.findByPk.mock.mockImplementation(async () => updated);

      const res = await request(server, 'PATCH', '/enrollments/e1', {
        status: 'completed',
        completion_percent: 100,
      });

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, updated);
    });

    it('should return 404 when enrollment not found after update', async () => {
      mockEnrollment.update.mock.mockImplementation(async () => [0]);
      mockEnrollment.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'PATCH', '/enrollments/missing', {
        status: 'completed',
      });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Enrollment not found');
    });
  });

  describe('DELETE /enrollments/:id', () => {
    it('should delete and return 204', async () => {
      mockEnrollment.destroy.mock.mockImplementation(async () => 1);

      const res = await request(server, 'DELETE', '/enrollments/e1');

      assert.strictEqual(res.status, 204);
    });

    it('should return 404 when enrollment does not exist', async () => {
      mockEnrollment.destroy.mock.mockImplementation(async () => 0);

      const res = await request(server, 'DELETE', '/enrollments/missing');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Enrollment not found');
    });

    it('should return 400 when destroy throws', async () => {
      mockEnrollment.destroy.mock.mockImplementation(async () => {
        throw new Error('FK constraint violation');
      });

      const res = await request(server, 'DELETE', '/enrollments/e1');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'FK constraint violation');
    });
  });
});
