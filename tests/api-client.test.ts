import { VictouryAPIClient } from '../src/api-client';
import axios from 'axios';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VictouryAPIClient', () => {
  let client: VictouryAPIClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      defaults: { headers: { common: {} } },
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    } as any);

    client = new VictouryAPIClient({
      baseURL: 'https://api.victoury.com/v2',
      apiKey: 'test-key',
    });
  });

  describe('authenticate', () => {
    it('should authenticate and store token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { token: 'test-token' },
        },
      };

      const mockClient = mockedAxios.create();
      (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.authenticate({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.defaults.headers.common['Authorization']).toBe('Bearer test-token');
      expect(mockClient.post).toHaveBeenCalledWith('/auth/token', {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });
    });
  });

  describe('listProducts', () => {
    it('should list products with parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Test Tour',
              description: 'A test tour',
              category: 'tours',
              destination: 'Paris',
              price: { amount: 100, currency: 'EUR' },
              duration: '3 hours',
              availability: true,
              images: [],
              highlights: [],
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      const mockClient = mockedAxios.create();
      (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.listProducts({
        page: 1,
        limit: 20,
        category: 'tours',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          limit: 20,
          category: 'tours',
        },
      });
    });
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'booking-123',
            productId: 'product-1',
            customerId: 'customer-1',
            status: 'confirmed',
            startDate: '2024-01-01T00:00:00Z',
            participants: 2,
            totalPrice: { amount: 200, currency: 'EUR' },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      };

      const mockClient = mockedAxios.create();
      (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.createBooking({
        productId: 'product-1',
        customerId: 'customer-1',
        startDate: '2024-01-01T00:00:00Z',
        participants: 2,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.post).toHaveBeenCalledWith('/bookings', {
        productId: 'product-1',
        customerId: 'customer-1',
        startDate: '2024-01-01T00:00:00Z',
        participants: 2,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
      };

      const mockClient = mockedAxios.create();
      (mockClient.get as jest.Mock).mockRejectedValue(mockError);

      // Mock the interceptor to throw our custom error
      (mockClient.interceptors.response.use as jest.Mock).mockImplementation(
        (onSuccess, onError) => {
          // Simulate error interceptor
          return onError(mockError);
        }
      );

      await expect(client.getProductDetails('invalid-id')).rejects.toThrow();
    });
  });
});