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
    it('should return cached data when available', async () => {
      const mockBenefits = [{ id: 1, name: 'Benefit 1' }];
      memoryCache.set('all-benefits', mockBenefits);

      const result = await benefitsService.getAll();

      expect(result).toEqual(mockBenefits);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache hit for all benefits');
    });

    it('should fetch from API and cache when no cached data', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [{ id: 1, name: 'Benefit 1' }],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll();

      expect(result).toEqual(mockResponse.data.body.beneficios);
      expect(mockedAxios.get).toHaveBeenCalledWith(process.env.SPORT_CLUB_API);
      expect(memoryCache.get('all-benefits')).toEqual(mockResponse.data.body.beneficios);
      expect(logger.info).toHaveBeenCalledWith('Cache miss for all benefits, fetching from API');
    });

    it('should return null when API response has no benefits', async () => {
      const mockResponse = {
        data: {
          body: {
            beneficios: [],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll();

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No benefits found in API response');
    });

    it('should return null when API response has invalid structure', async () => {
      const mockResponse = {
        data: {
          invalid: 'structure',
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getAll();

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No benefits found in API response');
    });

    it('should propagate error when API call fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(benefitsService.getAll()).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith('Error in benefitsService.getAll:', error);
    });
  });

  describe('getById', () => {
    it('should return cached data when available', async () => {
      const mockBenefit = { id: 1, name: 'Benefit 1' };
      memoryCache.set('benefit-1', mockBenefit);

      const result = await benefitsService.getById('1');

      expect(result).toEqual(mockBenefit);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache hit for benefit 1');
    });

    it('should fetch from API and cache when no cached data', async () => {
      const mockResponse = {
        data: {
          body: { id: 1, name: 'Benefit 1' },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toEqual(mockResponse.data.body);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.SPORT_CLUB_API}/1`);
      expect(memoryCache.get('benefit-1')).toEqual(mockResponse.data.body);
      expect(logger.info).toHaveBeenCalledWith('Cache miss for benefit 1, fetching from API');
    });

    it('should return null when API response has no body', async () => {
      const mockResponse = {
        data: {
          body: null,
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await benefitsService.getById('1');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('No benefit found for id 1');
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
      expect(logger.warn).toHaveBeenCalledWith('No benefit found for id 1');
    });

    it('should propagate error when API call fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(benefitsService.getById('1')).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith('Error in benefitsService.getById for id 1:', error);
    });
  });
}); 