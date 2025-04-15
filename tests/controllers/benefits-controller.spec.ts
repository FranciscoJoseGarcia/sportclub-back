import { Request, Response } from 'express';
import { BenefitsController } from '@/controllers/benefits-controller';
import { benefitsService } from '@/services/benefits-service';
import { logger } from '@/utils/logger';

jest.mock('@/services/benefits-service');
jest.mock('@/utils/logger');

describe('BenefitsController', () => {
  let controller: BenefitsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new BenefitsController();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return benefits when service returns data for specific page', async () => {
      const mockBenefits = {
        beneficios: [{ id: 1, name: 'Benefit 1' }],
        totalPages: 513,
        totalBeneficios: 2561,
        currentPage: 2,
        nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=3',
        prevPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=1',
      };
      mockReq.query = { page: '2' };
      (benefitsService.getAll as jest.Mock).mockResolvedValue(mockBenefits);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(benefitsService.getAll).toHaveBeenCalledWith(2);
      expect(mockRes.json).toHaveBeenCalledWith(mockBenefits);
    });

    it('should use default page 1 when no page is provided', async () => {
      const mockBenefits = {
        beneficios: [{ id: 1, name: 'Benefit 1' }],
        totalPages: 513,
        totalBeneficios: 2561,
        currentPage: 1,
        nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=2',
        prevPage: null,
      };
      mockReq.query = {};
      (benefitsService.getAll as jest.Mock).mockResolvedValue(mockBenefits);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(benefitsService.getAll).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockBenefits);
    });

    it('should return 400 when page is not a valid number', async () => {
      mockReq.query = { page: 'invalid' };

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid page number. Page must be a positive number',
      });
      expect(logger.warn).toHaveBeenCalledWith('Invalid page number provided:', { page: NaN });
    });

    it('should return 400 when page is less than 1', async () => {
      mockReq.query = { page: '0' };

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid page number. Page must be a positive number',
      });
      expect(logger.warn).toHaveBeenCalledWith('Invalid page number provided:', { page: 0 });
    });

    it('should return 404 when no benefits found for page', async () => {
      mockReq.query = { page: '2' };
      (benefitsService.getAll as jest.Mock).mockResolvedValue(null);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No benefits found for page 2',
      });
    });

    it('should propagate error when service throws', async () => {
      const error = new Error('Service error');
      mockReq.query = { page: '2' };
      (benefitsService.getAll as jest.Mock).mockRejectedValue(error);

      await expect(controller.getAll(mockReq as Request, mockRes as Response))
        .rejects.toThrow('Service error');
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
    });

    it('should return benefit when service returns data', async () => {
      const mockBenefit = { id: 1, name: 'Benefit 1' };
      (benefitsService.getById as jest.Mock).mockResolvedValue(mockBenefit);

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockBenefit);
    });

    it('should return 400 when id is not a number', async () => {
      mockReq.params = { id: 'abc' };

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid benefit ID. ID must be a number',
      });
    });

    it('should return 404 when service returns null', async () => {
      (benefitsService.getById as jest.Mock).mockResolvedValue(null);

      await controller.getById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Benefit with ID 1 not found',
      });
    });

    it('should propagate error when service throws', async () => {
      const error = new Error('Service error');
      (benefitsService.getById as jest.Mock).mockRejectedValue(error);

      await expect(controller.getById(mockReq as Request, mockRes as Response))
        .rejects.toThrow('Service error');
    });
  });
}); 