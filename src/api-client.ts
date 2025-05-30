import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Product,
  Customer,
  Booking,
  Availability,
  ApiResponse,
  ListProductsParamsType,
  SearchCustomersParamsType,
  CreateBookingParamsType,
  UpdateBookingParamsType,
  ListAvailabilityParamsType,
  AuthenticateParamsType,
} from './types.js';

export interface VictouryAPIConfig {
  baseURL: string;
  apiKey?: string;
  apiSecret?: string;
  timeout?: number;
}

export class VictouryAPIClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(config: VictouryAPIConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add auth interceptor if API key is provided
    if (config.apiKey) {
      this.client.defaults.headers.common['X-API-Key'] = config.apiKey;
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorMessage = error.response.data 
            ? JSON.stringify(error.response.data) 
            : error.message;
          throw new Error(`API Error (${error.response.status}): ${errorMessage}`);
        } else if (error.request) {
          throw new Error('No response received from API');
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  // Authentication
  async authenticate(params: AuthenticateParamsType): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await this.client.post('/auth/token', {
        apiKey: params.apiKey,
        apiSecret: params.apiSecret,
      });

      if (response.data.data?.token) {
        this.authToken = response.data.data.token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Products
  async listProducts(params?: ListProductsParamsType): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.client.get('/products', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProductDetails(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await this.client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Customers
  async searchCustomers(params?: SearchCustomersParamsType): Promise<ApiResponse<Customer[]>> {
    try {
      const response = await this.client.get('/customers', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCustomerDetails(customerId: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bookings
  async createBooking(params: CreateBookingParamsType): Promise<ApiResponse<Booking>> {
    try {
      const response = await this.client.post('/bookings', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookingDetails(bookingId: string): Promise<ApiResponse<Booking>> {
    try {
      const response = await this.client.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBooking(
    bookingId: string,
    params: Omit<UpdateBookingParamsType, 'bookingId'>
  ): Promise<ApiResponse<Booking>> {
    try {
      const response = await this.client.patch(`/bookings/${bookingId}`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listBookings(params?: {
    customerId?: string;
    productId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Booking[]>> {
    try {
      const response = await this.client.get('/bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Availability
  async listAvailability(params: ListAvailabilityParamsType): Promise<ApiResponse<Availability[]>> {
    try {
      const response = await this.client.get('/availability', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown error occurred');
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
    delete this.client.defaults.headers.common['Authorization'];
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}