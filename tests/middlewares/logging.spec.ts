import { Request, Response } from 'express';
import { loggingMiddleware } from '@/middlewares/loggingMiddleware';
import { logger } from '@/utils/logger';

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('LoggingMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let originalSend: any;

  beforeEach(() => {
    // request mock
    mockReq = {
      method: 'GET',
      url: '/api/beneficios',
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
      headers: {
        'user-agent': 'test-agent',
      },
      query: { page: '1' },
      body: { test: 'data' },
    };

    // response mock
    originalSend = jest.fn();
    mockRes = {
      statusCode: 200,
      send: originalSend,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should log incoming request with correct information', () => {
    loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(logger.info).toHaveBeenCalledWith('Incoming Request', {
      timestamp: expect.any(String),
      method: 'GET',
      url: '/api/beneficios',
      ip: '127.0.0.1',
      userAgent: 'test-agent',
      query: { page: '1' },
      body: { test: 'data' },
    });
  });

  it('should log response when request is completed', () => {
    const responseBody = { data: 'test' };
    
    loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    // simulate response send
    (mockRes.send as jest.Mock)(JSON.stringify(responseBody));

    expect(logger.info).toHaveBeenCalledWith('Request Completed', {
      timestamp: expect.any(String),
      method: 'GET',
      url: '/api/beneficios',
      status: 200,
      duration: expect.stringMatching(/\d+ms/),
      responseSize: expect.any(Number),
    });
  });

  it('should call next middleware', () => {
    loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle missing request properties gracefully', () => {
    const minimalReq = {
      method: 'GET',
      url: '/api/beneficios',
      socket: {} as any,
      headers: {},
    } as Request;

    loggingMiddleware(minimalReq, mockRes as Response, mockNext);

    expect(logger.info).toHaveBeenCalledWith('Incoming Request', {
      timestamp: expect.any(String),
      method: 'GET',
      url: '/api/beneficios',
      ip: undefined,
      userAgent: undefined,
      query: undefined,
      body: undefined,
    });
  });
}); 