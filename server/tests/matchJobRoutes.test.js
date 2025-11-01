import { jest } from '@jest/globals';

beforeAll(async () => {
  await jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
    default: (req, res, next) => { req.user = { id: 1 }; next(); }
  }));

  const mockQuery = jest.fn();
  await jest.unstable_mockModule('../src/db.js', () => ({
    default: { query: mockQuery }
  }));
  global.fetch = jest.fn();
});

test('returns existing matches when present', async () => {
  const { default: app } = await import('../src/app.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [{ job_id: 1, match_score: 90, reasoning: { r: 'ok' }, title: 'Job 1' }] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 1 });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test('returns 404 if resume not found', async () => {
  const { default: app } = await import('../src/app.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 999 });
  expect(res.status).toBe(404);
});

test('returns 400 when resume has no skills', async () => {
  const { default: app } = await import('../src/app.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: {} }] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 2 });
  expect(res.status).toBe(400);
});

test('happy path matches jobs and returns data', async () => {
  const { default: app } = await import('../src/app.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: { skills: ['node', 'react'] } }] });
  pool.query.mockResolvedValueOnce({ rows: [ { id: 1, title: 'J1', skills_required: 'node,react' } ] });
  pool.query.mockResolvedValue({ rows: [] });

  const aiJson = JSON.stringify({ 1: { reasoning: 'ok', fit_skills: ['node'], missing_skills: ['react'] } });
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: aiJson }] } }] }) });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 3 });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0]).toHaveProperty('job_id', 1);
});

  afterAll(() => {
    try { delete global.fetch; } catch (e) {}
    jest.resetModules();
    jest.restoreAllMocks();
  });