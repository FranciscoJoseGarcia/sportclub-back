import { Request, Response } from 'express';
import { benefitsService } from '@/services/benefits-service';
import { logger } from '@/utils/logger';

export class BenefitsController {
  async getAll(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    
    if (isNaN(page) || page < 1) {
      logger.warn('Invalid page number provided:', { page });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid page number. Page must be a positive number',
      });
    }

    const benefits = await benefitsService.getAll(page);
    
    if (benefits === null) {
      return res.status(404).json({
        status: 'error',
        message: `No benefits found for page ${page}`,
      });
    }
    
    res.json(benefits);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      logger.warn('Invalid benefit ID provided:', { id });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid benefit ID. ID must be a number',
      });
    }
    
    const benefit = await benefitsService.getById(id);
    
    if (benefit === null) {
      return res.status(404).json({
        status: 'error',
        message: `Benefit with ID ${id} not found`,
      });
    }
    
    res.json(benefit);
  }

  async getByCommerce(req: Request, res: Response) {
    const { value } = req.params;
    
    if (!value) {
      logger.warn('No commerce value provided');
      return res.status(400).json({
        status: 'error',
        message: 'Commerce value is required',
      });
    }
    
    const benefits = await benefitsService.getByCommerce(value);
    
    if (benefits === null) {
      return res.status(404).json({
        status: 'error',
        message: `No benefits found for commerce: ${value}`,
      });
    }
    
    res.json(benefits);
  }
}

export const benefitsController = new BenefitsController(); 