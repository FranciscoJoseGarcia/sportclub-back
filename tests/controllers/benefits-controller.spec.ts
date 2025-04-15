import { Request, Response } from 'express';
import { BenefitsController } from '@/controllers/benefits-controller';
import { benefitsService } from '@/services/benefits-service';

jest.mock('@/services/benefits-service');

describe('BenefitsController', () => {
  let controller: BenefitsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new BenefitsController();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return benefits when service returns data', async () => {
      const mockBenefits = [{ id: 1, name: 'Benefit 1' }];
      (benefitsService.getAll as jest.Mock).mockResolvedValue(mockBenefits);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockBenefits);
    });

    it('should return 404 when service returns null', async () => {
      (benefitsService.getAll as jest.Mock).mockResolvedValue(null);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No benefits found',
      });
    });

    it('should propagate error when service throws', async () => {
      const error = new Error('Service error');
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