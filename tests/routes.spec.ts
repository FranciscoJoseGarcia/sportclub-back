import request from 'supertest';
import { app, Shutdown } from '@/server';
import { benefitsService } from '@/services/benefits-service';

jest.mock('@/services/benefits-service');

describe('Routes', () => {
  afterAll((done) => {
    Shutdown(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
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
      const mockResponse = {
        beneficios: [{ id: 1, name: 'Benefit 1' }],
        totalPages: 513,
        totalBeneficios: 2561,
        currentPage: 1,
        nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=2',
        prevPage: null,
      };

      (benefitsService.getAll as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/beneficios')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(benefitsService.getAll).toHaveBeenCalled();
    });

    it('should route GET /api/beneficios/:id to benefits controller', async () => {
      const mockResponse = {
        beneficios: [{
          id: 1,
          name: 'Benefit 1',
          description: 'Test description',
          active: true,
        }],
      };

      (benefitsService.getById as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/beneficios/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(benefitsService.getById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when benefit is not found', async () => {
      (benefitsService.getById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/beneficios/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Benefit with ID 999 not found',
      });
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