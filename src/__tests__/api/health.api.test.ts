import request from 'supertest';
import { createTestApp } from '@/__tests__/api/api-test-app.js';

const app = createTestApp();

describe('Health Routes', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});