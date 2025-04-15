import { errorMiddleware } from '@/middlewares/errorMiddleware';
import { logger } from '@/utils/logger';

jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ErrorMiddleware', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      path: '/api/beneficios',
      method: 'GET',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should log error details', () => {
    const error = new Error('Test error');
    error.stack = 'Error stack';

    errorMiddleware(error, mockReq, mockRes);

    expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
      error: 'Test error',
      stack: 'Error stack',
      path: '/api/beneficios',
      method: 'GET',
    });
  });

  it('should handle Axios timeout error with 504 status', () => {
    const error = new Error('Timeout error');
    (error as any).isAxiosError = true;
    (error as any).code = 'ECONNABORTED';

    errorMiddleware(error, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(504);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Benefits API did not respond in time',
    });
  });

  it('should handle Axios authentication error with 502 status', () => {
    const error = new Error('Authentication error');
    (error as any).isAxiosError = true;
    (error as any).response = { status: 401 };

    errorMiddleware(error, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Authentication error with benefits API',
    });
  });

  it('should handle other Axios errors with 502 status', () => {
    const error = new Error('API error');
    (error as any).isAxiosError = true;
    (error as any).response = { status: 500 };

    errorMiddleware(error, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Error communicating with benefits API',
    });
  });

  it('should handle generic errors with 500 status', () => {
    const error = new Error('Generic error');

    errorMiddleware(error, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
    });
  });

  it('should include stack trace in development environment', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test error');
    error.stack = 'Error stack';

    errorMiddleware(error, mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
      stack: 'Error stack',
    });
  });
}); 