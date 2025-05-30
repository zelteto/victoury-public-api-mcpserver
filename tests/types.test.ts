import { describe, it, expect } from '@jest/globals';
import {
  AuthenticateParams,
  ListProductsParams,
  CreateBookingParams,
  UpdateBookingParams,
  ListAvailabilityParams,
} from '../src/types';

describe('Type Validation', () => {
  describe('AuthenticateParams', () => {
    it('should validate correct authentication params', () => {
      const params = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };
      
      expect(() => AuthenticateParams.parse(params)).not.toThrow();
    });

    it('should reject missing apiKey', () => {
      const params = {
        apiSecret: 'test-secret',
      };
      
      expect(() => AuthenticateParams.parse(params)).toThrow();
    });
  });

  describe('ListProductsParams', () => {
    it('should validate with all optional params', () => {
      const params = {
        page: 1,
        limit: 20,
        category: 'tours',
        destination: 'Paris',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      
      expect(() => ListProductsParams.parse(params)).not.toThrow();
    });

    it('should provide defaults for optional params', () => {
      const result = ListProductsParams.parse({});
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('CreateBookingParams', () => {
    it('should validate correct booking params', () => {
      const params = {
        productId: 'product-123',
        customerId: 'customer-456',
        startDate: '2024-01-01T00:00:00Z',
        participants: 2,
        notes: 'Special requirements',
      };
      
      expect(() => CreateBookingParams.parse(params)).not.toThrow();
    });

    it('should reject invalid participants count', () => {
      const params = {
        productId: 'product-123',
        customerId: 'customer-456',
        startDate: '2024-01-01T00:00:00Z',
        participants: 0,
      };
      
      expect(() => CreateBookingParams.parse(params)).toThrow();
    });
  });

  describe('UpdateBookingParams', () => {
    it('should validate with valid status', () => {
      const params = {
        bookingId: 'booking-123',
        status: 'confirmed' as const,
      };
      
      expect(() => UpdateBookingParams.parse(params)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const params = {
        bookingId: 'booking-123',
        status: 'invalid-status',
      };
      
      expect(() => UpdateBookingParams.parse(params)).toThrow();
    });
  });

  describe('ListAvailabilityParams', () => {
    it('should validate availability params', () => {
      const params = {
        productId: 'product-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        participants: 2,
      };
      
      expect(() => ListAvailabilityParams.parse(params)).not.toThrow();
    });

    it('should work without participants', () => {
      const params = {
        productId: 'product-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      
      expect(() => ListAvailabilityParams.parse(params)).not.toThrow();
    });
  });
});