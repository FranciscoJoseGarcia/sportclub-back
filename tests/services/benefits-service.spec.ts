import { benefitsService } from '@/services/benefits-service';
import { logger } from '@/utils/logger';
import NodeCache from 'node-cache';
import { Shutdown } from '@/server';

jest.mock('axios');
jest.mock('node-cache', () => {
  let cache: Record<string, any> = {};

  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => cache[key] || null),
    set: jest.fn((key, value) => {
      cache[key] = value;
    }),
    flushAll: jest.fn(() => {
      cache = {};
    }),
  }));
});
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedAxios = jest.requireMock('axios');
const memoryCache = new NodeCache();

describe('BenefitsService', () => {
  afterAll((done) => {
    Shutdown(done);
  });

  beforeEach(() => {
    memoryCache.flushAll();
    mockedAxios.get.mockReset();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return cached data when available for specific page', async () => {
      const mockResponse = {
        beneficios: [{ id: 1, name: 'Benefit 1' }],
        totalPages: 513,
        totalBeneficios: 2561,
        currentPage: 2,
        nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=3',
        prevPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=1',
      };
      memoryCache.set('all-benefits-page-2', mockResponse);

      const result = await benefitsService.getAll(2);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache hit for all benefits page 2');
    });

    it('should fetch from API and cache when no cached data for specific page', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [{ id: 1, name: 'Benefit 1' }],
            totalPages: 513,
            totalBeneficios: 2561,
            currentPage: 2,
            nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=3',
            prevPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=1',
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll(2);

      expect(result).toEqual(mockResponse.data.body);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.SPORT_CLUB_API}?page=2`);
      expect(memoryCache.get('all-benefits-page-2')).toEqual(mockResponse.data.body);
      expect(logger.info).toHaveBeenCalledWith('Cache miss for all benefits page 2, fetching from API');
    });

    it('should use default page 1 when no page is provided', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [{ id: 1, name: 'Benefit 1' }],
            totalPages: 513,
            totalBeneficios: 2561,
            currentPage: 1,
            nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=2',
            prevPage: null,
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll();

      expect(result).toEqual(mockResponse.data.body);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.SPORT_CLUB_API}?page=1`);
      expect(memoryCache.get('all-benefits-page-1')).toEqual(mockResponse.data.body);
    });

    it('handles benefits not found for specific page', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll(2);

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found in API response for page 2');
    });

    it('should return null when API response has invalid structure', async () => {
      const mockResponse = {
        data: {
          invalid: 'structure',
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll(2);

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found in API response for page 2');
    });

    it('should propagate error when API call fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(benefitsService.getAll(2)).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith('Error in benefitsService.getAll for page 2:', error);
    });
  });

  describe('getById', () => {
    it('should return cached data when available', async () => {
      const mockResponse = {
        id: 1,
        name: 'Benefit 1',
        description: 'Test description',
        active: true,
      };
      memoryCache.set('benefit-1', mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache hit for benefit 1');
    });

    it('should fetch from API and cache when no cached data', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [{
              id: 1,
              name: 'Benefit 1',
              description: 'Test description',
              active: true,
            }],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toEqual(mockResponse.data.body);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.SPORT_CLUB_API}/1`);
      expect(memoryCache.get('benefit-1')).toEqual(mockResponse.data.body);
      expect(logger.info).toHaveBeenCalledWith('Cache miss for benefit 1, fetching from API');
    });

    it('handles benefits not found', async () => {
      const mockResponse = {
        data: {
          body: null, 
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found for id 1');
    });

    it('should return null when API response has invalid structure', async () => {
      const mockResponse = {
        data: {
          invalid: 'structure',
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found for id 1');
    });

    it('should propagate error when API call fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(benefitsService.getById('1')).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith('Error in benefitsService.getById for id 1:', error);
    });
  });

  describe('getByCommerce', () => {
    it('should return cached data when available', async () => {
      const mockResponse = {
        beneficios: [{ id: 1, name: 'Benefit 1' }],
        totalPages: 513,
        totalBeneficios: 2561,
        currentPage: 1,
        nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=2',
        prevPage: null,
      };
      memoryCache.set('benefitsByName:restaurant', mockResponse);

      const result = await benefitsService.getByCommerce('restaurant');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache hit for benefits by commerce: restaurant');
    });

    it('should fetch from API and cache when no cached data', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [{ id: 1, name: 'Benefit 1' }],
            totalPages: 513,
            totalBeneficios: 2561,
            currentPage: 1,
            nextPage: 'https://api-beneficios.dev.sportclub.com.ar/api/beneficios?pageSize=5&page=2',
            prevPage: null,
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getByCommerce('restaurant');

      expect(result).toEqual(mockResponse.data.body);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.SPORT_CLUB_API}?archivado=false&comercio=${encodeURIComponent('restaurant')}`
      );
      expect(memoryCache.get('benefitsByName:restaurant')).toEqual(mockResponse.data.body);
      expect(logger.info).toHaveBeenCalledWith('Cache miss for benefits by commerce: restaurant, fetching from API');
    });

    it('should handle empty benefits array', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getByCommerce('restaurant');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found for commerce: restaurant');
    });

    it('should handle invalid response structure', async () => {
      const mockResponse = {
        data: {
          invalid: 'structure',
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getByCommerce('restaurant');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No data found for commerce: restaurant');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(benefitsService.getByCommerce('restaurant')).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith('Error in benefitsService.getByCommerce for value restaurant:', error);
    });
  });
}); 