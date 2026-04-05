'use strict';

const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');

process.env.MODE_TEST = 'true';

const mockCourse = {
  findAll: mock.fn(),
  findByPk: mock.fn(),
  create: mock.fn(),
  update: mock.fn(),
  destroy: mock.fn(),
  belongsTo: mock.fn(),
  hasMany: mock.fn(),
};

const mockUser = {
  findAll: mock.fn(),
  findByPk: mock.fn(),
  hasMany: mock.fn(),
  hasOne: mock.fn(),
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

const courseModelPath = require.resolve(
  path.join(__dirname, '..', 'models', 'Course.js'),
);
require.cache[courseModelPath] = {
  id: courseModelPath,
  filename: courseModelPath,
  loaded: true,
  exports: { Course: mockCourse },
};

const express = require('express');
const http = require('http');
const { router } = require('../routes/course');

const app = express();
app.use(express.json());
app.use('/courses', router);

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

describe('Course routes', () => {
  beforeEach(() => {
    mockCourse.findAll.mock.resetCalls();
    mockCourse.findByPk.mock.resetCalls();
    mockCourse.create.mock.resetCalls();
    mockCourse.update.mock.resetCalls();
    mockCourse.destroy.mock.resetCalls();

    server = http.createServer(app);
    server.listen(0);
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /courses', () => {
    it('should return all courses on success', async () => {
      const courses = [
        { id: '1', title: 'Course A' },
        { id: '2', title: 'Course B' },
      ];
      mockCourse.findAll.mock.mockImplementation(async () => courses);

      const res = await request(server, 'GET', '/courses');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, courses);
      assert.strictEqual(mockCourse.findAll.mock.callCount(), 1);
    });

    it('should return 400 when findAll throws', async () => {
      mockCourse.findAll.mock.mockImplementation(async () => {
        throw new Error('DB connection failed');
      });

      const res = await request(server, 'GET', '/courses');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'DB connection failed');
    });
  });

  describe('GET /courses/:id', () => {
    it('should return a course when found', async () => {
      const course = { id: 'abc', title: 'Found Course' };
      mockCourse.findByPk.mock.mockImplementation(async () => course);

      const res = await request(server, 'GET', '/courses/abc');

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, course);
    });

    it('should return 404 when course is not found', async () => {
      mockCourse.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'GET', '/courses/nonexistent');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Course not found');
    });

    it('should return 400 when findByPk throws', async () => {
      mockCourse.findByPk.mock.mockImplementation(async () => {
        throw new Error('Invalid UUID');
      });

      const res = await request(server, 'GET', '/courses/bad-id');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'Invalid UUID');
    });
  });

  describe('POST /courses', () => {
    it('should create a course and return 201', async () => {
      const input = { title: 'New Course', teacher_id: 't1' };
      const created = { id: 'new-id', ...input };
      mockCourse.create.mock.mockImplementation(async () => created);

      const res = await request(server, 'POST', '/courses', input);

      assert.strictEqual(res.status, 201);
      assert.deepStrictEqual(res.body, created);
      assert.strictEqual(mockCourse.create.mock.callCount(), 1);
    });

    it('should return 400 when create throws validation error', async () => {
      mockCourse.create.mock.mockImplementation(async () => {
        throw new Error('notNull Violation: title cannot be null');
      });

      const res = await request(server, 'POST', '/courses', {});

      assert.strictEqual(res.status, 400);
      assert.strictEqual(
        res.raw,
        'notNull Violation: title cannot be null',
      );
    });
  });

  describe('PATCH /courses/:id', () => {
    it('should update and return the course', async () => {
      const updated = { id: 'c1', title: 'Updated Title' };
      mockCourse.update.mock.mockImplementation(async () => [1]);
      mockCourse.findByPk.mock.mockImplementation(async () => updated);

      const res = await request(server, 'PATCH', '/courses/c1', {
        title: 'Updated Title',
      });

      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, updated);
    });

    it('should return 404 when course does not exist after update', async () => {
      mockCourse.update.mock.mockImplementation(async () => [0]);
      mockCourse.findByPk.mock.mockImplementation(async () => null);

      const res = await request(server, 'PATCH', '/courses/nonexistent', {
        title: 'X',
      });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Course not found');
    });

    it('should return 400 when update throws', async () => {
      mockCourse.update.mock.mockImplementation(async () => {
        throw new Error('Validation error');
      });

      const res = await request(server, 'PATCH', '/courses/c1', {
        title: '',
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'Validation error');
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete and return 204', async () => {
      mockCourse.destroy.mock.mockImplementation(async () => 1);

      const res = await request(server, 'DELETE', '/courses/c1');

      assert.strictEqual(res.status, 204);
    });

    it('should return 404 when course does not exist', async () => {
      mockCourse.destroy.mock.mockImplementation(async () => 0);

      const res = await request(server, 'DELETE', '/courses/nonexistent');

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.raw, 'Course not found');
    });

    it('should return 400 when destroy throws', async () => {
      mockCourse.destroy.mock.mockImplementation(async () => {
        throw new Error('FK constraint');
      });

      const res = await request(server, 'DELETE', '/courses/c1');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.raw, 'FK constraint');
    });
  });
});
