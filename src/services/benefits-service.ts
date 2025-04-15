import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '@/utils/logger';

const cache = new NodeCache({ stdTTL: 300 }); 

export const benefitsService = {
  async getAll() {
    try {
      const cachedData = cache.get('all-benefits');
      if (cachedData) {
        logger.info('Cache hit for all benefits');
        return cachedData;
      }

      logger.info('Cache miss for all benefits, fetching from API');
      const response = await axios.get(process.env.SPORT_CLUB_API!);
      cache.set('all-benefits', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error in benefitsService.getAll:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const cacheKey = `benefit-${id}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.info(`Cache hit for benefit ${id}`);
        return cachedData;
      }

      logger.info(`Cache miss for benefit ${id}, fetching from API`);
      const response = await axios.get(`${process.env.SPORT_CLUB_API}/${id}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error(`Error in benefitsService.getById for id ${id}:`, error);
      throw error;
    }
  },
}; 