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

// Service Monitoring interfaces
export interface ApiInfo {
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
}

export interface ApiHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    cache: boolean;
    queue: boolean;
  };
  timestamp: string;
}

// Deal interfaces
export interface Deal {
  id: string;
  productId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price: {
    amount: number;
    currency: string;
  };
  availability: {
    total: number;
    available: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: string;
  dealId: string;
  customerId: string;
  expiresAt: string;
  participants: number;
  status: 'active' | 'expired' | 'converted';
  notes?: string;
  createdAt: string;
}

// Document interfaces
export interface Document {
  id: string;
  type: 'invoice' | 'ticket' | 'voucher' | 'contract';
  bookingId: string;
  url: string;
  format: string;
  size: number;
  createdAt: string;
}

// Advanced Product interfaces
export interface ProductStartingDate {
  date: string;
  available: boolean;
  basePrice: {
    amount: number;
    currency: string;
  };
  spotsAvailable: number;
}

export interface ProductPricing {
  startingDate: string;
  participants: number;
  basePrice: number;
  discounts: Array<{
    type: string;
    amount: number;
  }>;
  totalPrice: {
    amount: number;
    currency: string;
  };
}

export interface PackageAvailability {
  packageId: string;
  available: boolean;
  price: {
    amount: number;
    currency: string;
  };
  inclusions: string[];
  restrictions: string[];
}

// Person interface
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Address interface
export interface Address {
  id: string;
  personId: string;
  type: 'billing' | 'shipping' | 'primary';
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quote interface
export interface Quote {
  id: string;
  productId: string;
  startDate: string;
  participants: number;
  priceBreakdown: Array<{
    type: string;
    description: string;
    amount: number;
  }>;
  totalPrice: {
    amount: number;
    currency: string;
  };
  validUntil: string;
  createdAt: string;
}

// Payment interface
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
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

// Service Monitoring parameters
export const GetApiInfoParams = z.object({});
export const GetApiHealthParams = z.object({});

// Deal-related parameters
export const GetDealDetailsParams = z.object({
  dealId: z.string(),
});

export const UpdateDealParams = z.object({
  dealId: z.string(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export const SearchPublishDealsParams = z.object({
  productId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  destination: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export const CreateOptionBookingParams = z.object({
  dealId: z.string(),
  customerId: z.string(),
  participants: z.number().min(1),
  notes: z.string().optional(),
});

export const OptionToBookingParams = z.object({
  optionId: z.string(),
  paymentMethod: z.string().optional(),
});

// Document-related parameters
export const ViewDocumentParams = z.object({
  documentId: z.string(),
});

export const DownloadDocumentParams = z.object({
  documentId: z.string(),
  format: z.enum(['pdf', 'html']).optional().default('pdf'),
});

// Advanced Product parameters
export const GetProductStartingDatesParams = z.object({
  productId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const GetProductStartingDatePricesParams = z.object({
  productId: z.string(),
  startingDate: z.string(),
  participants: z.number().min(1).optional(),
});

export const GetPackagePriceAvailabilityParams = z.object({
  productId: z.string(),
  packageId: z.string(),
  startDate: z.string(),
  participants: z.number().min(1),
});

// Person-related parameters
export const UpdatePersonParams = z.object({
  personId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

// Address-related parameters
export const UpdateAddressParams = z.object({
  addressId: z.string(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

// Quote-related parameters
export const InitializeQuoteParams = z.object({
  productId: z.string(),
  startDate: z.string(),
  participants: z.number().min(1),
  priceComponents: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })).optional(),
});

// Customer Payment parameters
export const RegisterCustomerPaymentParams = z.object({
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
});

// New type exports
export type GetApiInfoParamsType = z.infer<typeof GetApiInfoParams>;
export type GetApiHealthParamsType = z.infer<typeof GetApiHealthParams>;
export type GetDealDetailsParamsType = z.infer<typeof GetDealDetailsParams>;
export type UpdateDealParamsType = z.infer<typeof UpdateDealParams>;
export type SearchPublishDealsParamsType = z.infer<typeof SearchPublishDealsParams>;
export type CreateOptionBookingParamsType = z.infer<typeof CreateOptionBookingParams>;
export type OptionToBookingParamsType = z.infer<typeof OptionToBookingParams>;
export type ViewDocumentParamsType = z.infer<typeof ViewDocumentParams>;
export type DownloadDocumentParamsType = z.infer<typeof DownloadDocumentParams>;
export type GetProductStartingDatesParamsType = z.infer<typeof GetProductStartingDatesParams>;
export type GetProductStartingDatePricesParamsType = z.infer<typeof GetProductStartingDatePricesParams>;
export type GetPackagePriceAvailabilityParamsType = z.infer<typeof GetPackagePriceAvailabilityParams>;
export type UpdatePersonParamsType = z.infer<typeof UpdatePersonParams>;
export type UpdateAddressParamsType = z.infer<typeof UpdateAddressParams>;
export type InitializeQuoteParamsType = z.infer<typeof InitializeQuoteParams>;
export type RegisterCustomerPaymentParamsType = z.infer<typeof RegisterCustomerPaymentParams>;