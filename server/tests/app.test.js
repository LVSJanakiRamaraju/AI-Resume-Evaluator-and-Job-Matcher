import request from 'supertest';
import app from '../src/app.js';
import { describe, expect, test } from '@jest/globals';

describe('app root', () => {
  test('GET / returns status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
  });
});
