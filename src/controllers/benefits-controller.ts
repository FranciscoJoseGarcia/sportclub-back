import { Request, Response } from 'express';
import { benefitsService } from '@/services/benefits-service';
import { logger } from '@/utils/logger';
import { AxiosError } from 'axios';

export class BenefitsController {
  async getAll(req: Request, res: Response) {
    try {
      const benefits = await benefitsService.getAll();
      res.json(benefits);
    } catch (error) {
      logger.error('Error getting benefits:', error);
      
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Error fetching benefits from external API';
        return res.status(statusCode).json({ error: message });
      }
      
      res.status(500).json({ error: 'Internal server error while fetching benefits' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        logger.error('Invalid benefit ID:', id);
        return res.status(400).json({ error: 'Invalid benefit ID. ID must be a number' });
      }
      
      const benefit = await benefitsService.getById(id);
      
      if (!benefit) {
        return res.status(404).json({ error: `Benefit with ID ${id} not found` });
      }
      
      res.json(benefit);
    } catch (error) {
      logger.error('Error getting benefit by id:', error);
      
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Error fetching benefit from external API';
        return res.status(statusCode).json({ error: message });
      }
      
      res.status(500).json({ error: 'Internal server error while fetching benefit' });
    }
  }
}

export const benefitsController = new BenefitsController(); 