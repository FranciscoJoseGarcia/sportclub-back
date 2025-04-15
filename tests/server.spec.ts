import request from 'supertest';
import { app, Shutdown } from '@/server';

describe('Server', () => {
  afterAll((done) => {
    Shutdown(done);
  });

  it('should start with the correct test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(app).toBeDefined();
  });

  it('should allow CORS only for GET method', async () => {
    const response = await request(app).options('/');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-methods']).toBe('GET');
    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-headers']).toBeDefined();
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
}); 