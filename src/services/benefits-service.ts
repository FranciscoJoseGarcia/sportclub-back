import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '@/utils/logger';

const cache = new NodeCache({ stdTTL: 300 }); 

export const benefitsService = {
  async getAll(page: number = 1) {
    try {
      const cacheKey = `all-benefits-page-${page}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.info(`Cache hit for all benefits page ${page}`);
        return cachedData;
      }

      logger.info(`Cache miss for all benefits page ${page}, fetching from API`);
      const response = await axios.get(`${process.env.SPORT_CLUB_API}?page=${page}`);
      
      if (!response?.data?.body?.beneficios?.length) {
        logger.warn(`No data found in API response for page ${page}`);
        return null;
      }
      
      const responseData = response.data.body;
      cache.set(cacheKey, responseData);
      return responseData;
    } catch (error) {
      logger.error(`Error in benefitsService.getAll for page ${page}:`, error);
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
      
      if (!response?.data?.body) {
        logger.warn(`No data found for id ${id}`);
        return null;
      }
      
      const responseData = response.data.body;
      cache.set(cacheKey, responseData);
      return responseData;
    } catch (error) {
      logger.error(`Error in benefitsService.getById for id ${id}:`, error);
      throw error;
    }
  },

  async getByCommerce(value: string) {
    try {
      const cacheKey = `benefitsByName:${value}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.info(`Cache hit for benefits by commerce: ${value}`);
        return cachedData;
      }

      logger.info(`Cache miss for benefits by commerce: ${value}, fetching from API`);
      const response = await axios.get(`${process.env.SPORT_CLUB_API}?archivado=false&comercio=${encodeURIComponent(value)}`);
      
      if (!response?.data?.body?.beneficios?.length) {
        logger.warn(`No data found for commerce: ${value}`);
        return null;
      }
      
      const responseData = response.data.body;
      cache.set(cacheKey, responseData);
      return responseData;
    } catch (error) {
      logger.error(`Error in benefitsService.getByCommerce for value ${value}:`, error);
      throw error;
    }
  },
}; 