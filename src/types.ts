import { z } from 'zod';

// Authentication parameters
export const AuthenticateParams = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
});

// Product-related parameters
export const ListProductsParams = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  category: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const GetProductDetailsParams = z.object({
  productId: z.string(),
});

// Customer-related parameters
export const SearchCustomersParams = z.object({
  query: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

// Booking-related parameters
export const CreateBookingParams = z.object({
  productId: z.string(),
  customerId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  participants: z.number().min(1),
  notes: z.string().optional(),
});

export const GetBookingDetailsParams = z.object({
  bookingId: z.string(),
});

export const UpdateBookingParams = z.object({
  bookingId: z.string(),
  status: z.enum(['confirmed', 'pending', 'cancelled']).optional(),
  participants: z.number().min(1).optional(),
  notes: z.string().optional(),
});

// Availability parameters
export const ListAvailabilityParams = z.object({
  productId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  participants: z.number().min(1).optional(),
});

// API Response types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  destination: string;
  price: {
    amount: number;
    currency: string;
  };
  duration: string;
  availability: boolean;
  images: string[];
  highlights: string[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  productId: string;
  customerId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  startDate: string;
  endDate?: string;
  participants: number;
  totalPrice: {
    amount: number;
    currency: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  date: string;
  available: boolean;
  spotsAvailable: number;
  price: {
    amount: number;
    currency: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type exports for parameters
export type ListProductsParamsType = z.infer<typeof ListProductsParams>;
export type GetProductDetailsParamsType = z.infer<typeof GetProductDetailsParams>;
export type SearchCustomersParamsType = z.infer<typeof SearchCustomersParams>;
export type CreateBookingParamsType = z.infer<typeof CreateBookingParams>;
export type GetBookingDetailsParamsType = z.infer<typeof GetBookingDetailsParams>;
export type UpdateBookingParamsType = z.infer<typeof UpdateBookingParams>;
export type ListAvailabilityParamsType = z.infer<typeof ListAvailabilityParams>;
export type AuthenticateParamsType = z.infer<typeof AuthenticateParams>;