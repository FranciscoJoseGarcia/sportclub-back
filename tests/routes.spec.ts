import request from 'supertest';
import { app, Shutdown } from '@/server';

describe('Routes', () => {
  afterAll((done) => {
    Shutdown(done);
  });

  describe('Health Check', () => {
    it('should return 200 and status ok for health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Benefits Routes', () => {
    it('should route GET /api/beneficios to benefits controller', async () => {
      const response = await request(app)
        .get('/api/beneficios')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should route GET /api/beneficios/:id to benefits controller', async () => {
      const response = await request(app)
        .get('/api/beneficios/1')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Non-existent Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Route not found',
      });
    });
  });
}); 