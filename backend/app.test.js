const app = require('./src/app');
const request = require('supertest');

test('returns a health response without requiring a database connection', async () => {
  const response = await request(app).get('/health');

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: 'ok' });
});
