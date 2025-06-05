import axios, { AxiosInstance, AxiosError, AxiosStatic } from 'axios';
import fs from 'fs';
import path from 'path';
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
  ApiInfo,
  ApiHealth,
  Deal,
  Option,
  Document,
  ProductStartingDate,
  ProductPricing,
  PackageAvailability,
  Person,
  Address,
  Quote,
  Payment,
  GetDealDetailsParamsType,
  UpdateDealParamsType,
  SearchPublishDealsParamsType,
  CreateOptionBookingParamsType,
  OptionToBookingParamsType,
  ViewDocumentParamsType,
  DownloadDocumentParamsType,
  GetProductStartingDatesParamsType,
  GetProductStartingDatePricesParamsType,
  GetPackagePriceAvailabilityParamsType,
  UpdatePersonParamsType,
  UpdateAddressParamsType,
  InitializeQuoteParamsType,
  RegisterCustomerPaymentParamsType,
} from './types.js';

export interface VictouryAPIConfig {
  baseURL: string;
  apiKey?: string;
  apiSecret?: string;
  timeout?: number;
}

// Logger function
const logFile = path.join(process.cwd(), 'victoury-mcp-debug.log');
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.error(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore file write errors
  }
};

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

    // Add Tenant and Session-Id headers if provided
    if (config.apiKey) {
      this.client.defaults.headers.common['Tenant'] = config.apiKey;
    }
    if (config.apiSecret) {
      this.client.defaults.headers.common['Session-Id'] = config.apiSecret;
    }

    // Add request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        const timestamp = new Date().toISOString();
        
        // Store request details for error context
        const requestDetails = {
          timestamp,
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: fullUrl,
          headers: config.headers,
          params: config.params,
          data: config.data,
          timeout: config.timeout
        };
        
        // Attach to config for later access in error handler
        (config as any)._requestDetails = requestDetails;
        
        log(`\n=== API REQUEST [${timestamp}] ===`);
        log(`Method: ${requestDetails.method}`);
        log(`URL: ${requestDetails.url}`);
        log(`Base URL: ${requestDetails.baseURL}`);
        log(`Full URL: ${requestDetails.fullURL}`);
        log(`Headers: ${JSON.stringify(requestDetails.headers, null, 2)}`);
        log(`Params: ${JSON.stringify(requestDetails.params, null, 2)}`);
        log(`Data: ${requestDetails.data ? JSON.stringify(requestDetails.data, null, 2) : 'None'}`);
        log(`Timeout: ${requestDetails.timeout}ms`);
        log(`=== END REQUEST DETAILS ===\n`);
        return config;
      },
      (error) => {
        log(`\n=== REQUEST INTERCEPTOR ERROR ===`);
        log(`Error: ${error}`);
        log(`Error Stack: ${error.stack}`);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        const timestamp = new Date().toISOString();
        log(`\n=== API RESPONSE [${timestamp}] ===`);
        log(`Status: ${response.status} ${response.statusText}`);
        log(`URL: ${response.config.baseURL}${response.config.url}`);
        log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
        log(`Data preview: ${JSON.stringify(response.data).substring(0, 500)}...`);
        log(`=== END RESPONSE ===\n`);
        return response;
      },
      (error: AxiosError) => {
        const timestamp = new Date().toISOString();
        log(`\n=== API ERROR OCCURRED [${timestamp}] ===`);
        log(`Error Type: ${error.constructor.name}`);
        log(`Error Code: ${error.code}`);
        log(`Error Message: ${error.message}`);
        
        // Get request details from config
        const requestDetails = (error.config as any)?._requestDetails;
        if (requestDetails) {
          log(`\n--- ORIGINAL REQUEST THAT FAILED ---`);
          log(`Timestamp: ${requestDetails.timestamp}`);
          log(`Method: ${requestDetails.method}`);
          log(`Full URL: ${requestDetails.fullURL}`);
          log(`Headers: ${JSON.stringify(requestDetails.headers, null, 2)}`);
          log(`Query Params: ${JSON.stringify(requestDetails.params, null, 2)}`);
          log(`Request Body: ${JSON.stringify(requestDetails.data, null, 2)}`);
        }
        
        if (error.response) {
          log(`\n--- ERROR RESPONSE DETAILS ---`);
          log(`Status: ${error.response.status} ${error.response.statusText}`);
          log(`Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
          log(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
          
          // Log the exact URL that returned the error
          const fullErrorUrl = `${error.config?.baseURL}${error.config?.url}`;
          log(`\n--- FAILED URL ---`);
          log(`Exact URL that returned ${error.response.status}: ${fullErrorUrl}`);
          
          // If query params exist, show full URL with params
          if (error.config?.params) {
            const urlWithParams = new URL(fullErrorUrl);
            Object.entries(error.config.params).forEach(([key, value]) => {
              urlWithParams.searchParams.append(key, String(value));
            });
            log(`Full URL with params: ${urlWithParams.toString()}`);
          }
          
        } else if (error.request) {
          log(`\n--- NO RESPONSE RECEIVED ---`);
          log(`Request was made but no response received`);
          log(`Request details:`);
          log(JSON.stringify({
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
            timeout: error.config?.timeout,
            headers: error.config?.headers
          }, null, 2));
          
          // Log raw request object
          if (error.request._header) {
            log(`\nRaw Request Headers:\n${error.request._header}`);
          }
        } else {
          log(`\n--- REQUEST SETUP ERROR ---`);
          log(`Error occurred while setting up the request`);
          log(`Error details: ${error.message}`);
          log(`Stack trace: ${error.stack}`);
        }
        
        // Log complete error object (excluding circular references)
        log(`\n--- COMPLETE ERROR OBJECT ---`);
        const errorObj: any = {};
        for (const key in error) {
          if (error.hasOwnProperty(key)) {
            errorObj[key] = (error as any)[key];
          }
        }
        log(JSON.stringify(errorObj, (key, value) => {
          // Handle circular references
          if (key === 'request' || key === 'response' || key === 'config') {
            return '[See details above]';
          }
          return value;
        }, 2));
        
        log(`=== END ERROR DETAILS ===\n`);
        
        const errorMessage = error.response?.data 
          ? JSON.stringify(error.response.data) 
          : error.message;
        const enhancedError = new Error(`API Error (${error.response?.status || 'Unknown'}): ${errorMessage}`);
        (enhancedError as any).originalError = error;
        (enhancedError as any).requestDetails = requestDetails;
        throw enhancedError;
      }
    );
  }

  // Authentication - not needed for this API as headers are set in constructor
  async authenticate(params: AuthenticateParamsType): Promise<ApiResponse<{ token: string }>> {
    // This API uses Tenant and Session-Id headers which are already set
    return {
      success: true,
      data: { token: 'session-based-auth' }
    };
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
      // Based on the API, this should be a POST request to /products/details.json
      const response = await this.client.post('/products/details.json', {
        productId: parseInt(productId),
        returnAllPrices: true
      });
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
    log(`\n--- handleError called ---`);
    log(`Error type: ${error?.constructor?.name}`);
    log(`Error value: ${error}`);
    
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
      return error;
    }
    
    log(`Non-Error object encountered: ${JSON.stringify(error)}`);
    return new Error(`Unknown error occurred: ${JSON.stringify(error)}`);
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Session-Id'] = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
    delete this.client.defaults.headers.common['Session-Id'];
    delete this.client.defaults.headers.common['Tenant'];
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Service Monitoring
  async getApiInfo(): Promise<ApiResponse<ApiInfo>> {
    try {
      // Create a separate client without auth headers for the info endpoint
      // Remove /v2 from baseURL as /info is at root level
      const rootBaseURL = this.client.defaults.baseURL?.replace('/v2', '');
      const infoClient = axios.create({
        baseURL: rootBaseURL,
        timeout: this.client.defaults.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      const url = infoClient.defaults.baseURL + '/info';
      console.error('\n--- API Request Details ---');
      console.error('Method: GET');
      console.error('URL:', url);
      console.error('Headers:', infoClient.defaults.headers);
      
      const response = await infoClient.get('/info');
      
      console.error('\n--- API Response Details ---');
      console.error('Status:', response.status);
      console.error('Headers:', response.headers);
      console.error('Data:', JSON.stringify(response.data, null, 2));
      
      // The API returns the data directly, not wrapped in an ApiResponse
      return {
        success: true,
        data: {
          version: response.data.build?.version || 'unknown',
          environment: response.data.build?.name || 'unknown',
          uptime: 0, // Not provided by this API
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('\n--- API Request Failed ---');
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Request Config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        });
      }
      throw this.handleError(error);
    }
  }

  async getApiHealth(): Promise<ApiResponse<ApiHealth>> {
    try {
      // Create a separate client without auth headers for the health endpoint
      const healthClient = axios.create({
        baseURL: this.client.defaults.baseURL?.replace('/v2', ''), // Remove /v2 for health endpoint
        timeout: this.client.defaults.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.error('Health check from:', healthClient.defaults.baseURL + '/health');
      const response = await healthClient.get('/health');
      
      // Parse the actual health response
      const healthData = response.data;
      const isHealthy = healthData.status === 'UP';
      
      return {
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          services: {
            database: healthData.components?.db?.status === 'UP',
            cache: healthData.components?.rabbit?.status === 'UP',
            queue: healthData.components?.rabbit?.status === 'UP'
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Include error details in the response
      console.error('Health check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: 'health_check_failed',
          message: errorMessage
        },
        data: {
          status: 'unhealthy',
          services: {
            database: false,
            cache: false,
            queue: false
          },
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Deals
  async getDealDetails(dealId: string): Promise<ApiResponse<Deal>> {
    try {
      const response = await this.client.get(`/deals/${dealId}.json?do_not_publish_docs=false`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDeal(
    dealId: string,
    params: Omit<UpdateDealParamsType, 'dealId'>
  ): Promise<ApiResponse<Deal>> {
    try {
      const response = await this.client.patch(`/deals/${dealId}.json`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchPublishDeals(params?: SearchPublishDealsParamsType): Promise<ApiResponse<Deal[]>> {
    try {
      const response = await this.client.post('/deals/search.json', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createOptionBooking(params: CreateOptionBookingParamsType): Promise<ApiResponse<Option>> {
    try {
      const response = await this.client.post('/deals/booking.json', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async optionToBooking(
    optionId: string,
    params?: Omit<OptionToBookingParamsType, 'optionId'>
  ): Promise<ApiResponse<Booking>> {
    try {
      const response = await this.client.get(`/deals/${optionId}/optiontobooking.json?do_not_publish_docs=false`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Documents
  async viewDocument(documentId: string): Promise<ApiResponse<Document>> {
    try {
      log(`\n--- viewDocument called ---`);
      log(`Document ID: ${documentId}`);
      log(`Document ID type: ${typeof documentId}`);
      log(`Document ID format analysis:`);
      log(`  - Contains 'offer': ${documentId.includes('offer')}`);
      log(`  - Contains underscore: ${documentId.includes('_')}`);
      log(`  - Numeric part: ${documentId.match(/\d+/)?.[0]}`);
      log(`Base URL: ${this.client.defaults.baseURL}`);
      log(`Headers: ${JSON.stringify(this.client.defaults.headers.common)}`);
      
      // Based on the error "Document null not found", let's try different ID formats
      const numericId = documentId.match(/\d+/)?.[0];
      const possibleIds = [
        documentId,                    // offer_116
        numericId || documentId,       // 116
        documentId.replace('_', '-'),  // offer-116
        documentId.toUpperCase(),      // OFFER_116
      ];
      
      const possibleEndpoints: string[] = [];
      for (const id of possibleIds) {
        possibleEndpoints.push(
          `/documents/${id}`,
          `/documents/${id}.json`,
          `/document/${id}`,
          `/document/${id}.json`
        );
      }
      
      // Also try traveler document endpoints
      possibleEndpoints.push(
        `/travelers/documents/${documentId}`,
        `/travelers/documents/${numericId}`,
        `/deals/${numericId}/documents`,
        `/deals/${documentId}/documents`
      );
      
      log(`Trying endpoints: ${JSON.stringify(possibleEndpoints)}`);
      
      let lastError: any = null;
      for (const endpoint of possibleEndpoints) {
        try {
          log(`Attempting endpoint: ${endpoint}`);
          const response = await this.client.get(endpoint);
          
          log(`\n--- viewDocument response ---`);
          log(`Successful endpoint: ${endpoint}`);
          log(`Status: ${response.status}`);
          log(`Data: ${JSON.stringify(response.data)}`);
          
          return response.data;
        } catch (endpointError) {
          log(`Endpoint ${endpoint} failed: ${endpointError}`);
          lastError = endpointError;
        }
      }
      
      // If all endpoints failed, throw the last error
      throw lastError;
    } catch (error) {
      log(`\n--- viewDocument error ---`);
      log(`Error type: ${error?.constructor?.name}`);
      log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      if (axios.isAxiosError(error)) {
        log(`Response status: ${error.response?.status}`);
        log(`Response data: ${JSON.stringify(error.response?.data)}`);
        log(`Request URL: ${error.config?.url}`);
        log(`Request headers: ${JSON.stringify(error.config?.headers)}`);
      }
      throw this.handleError(error);
    }
  }

  async downloadDocument(
    documentId: string,
    format?: string
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      log(`\n--- downloadDocument called ---`);
      log(`Document ID: ${documentId}`);
      log(`Format: ${format || 'default'}`);
      log(`Base URL: ${this.client.defaults.baseURL}`);
      
      // Since offer_116 suggests this might be an offer, let's try offer-specific endpoints
      const possibleEndpoints = format 
        ? [
            `/documents/${documentId}/download?format=${format}`,
            `/documents/${documentId}/download.${format}`,
            `/document/${documentId}/download?format=${format}`,
            `/offers/${documentId}/download?format=${format}`,
            `/offers/${documentId}/download.${format}`,
            `/deals/documents/${documentId}/download?format=${format}`,
            // Direct document access patterns
            `/documents/${documentId}.${format}`,
            `/offers/${documentId}.${format}`
          ]
        : [
            `/documents/${documentId}/download`,
            `/document/${documentId}/download`,
            `/offers/${documentId}/download`,
            `/deals/documents/${documentId}/download`,
            `/documents/${documentId}.pdf`,
            `/offers/${documentId}.pdf`
          ];
      
      log(`Trying download endpoints: ${JSON.stringify(possibleEndpoints)}`);
      
      let lastError: any = null;
      for (const endpoint of possibleEndpoints) {
        try {
          log(`Attempting download endpoint: ${endpoint}`);
          const response = await this.client.get(endpoint);
          
          log(`\n--- downloadDocument response ---`);
          log(`Successful endpoint: ${endpoint}`);
          log(`Status: ${response.status}`);
          log(`Headers: ${JSON.stringify(response.headers)}`);
          log(`Data: ${JSON.stringify(response.data)}`);
          
          // If we get a direct file response, return the URL
          if (response.headers['content-type']?.includes('pdf') || 
              response.headers['content-type']?.includes('html')) {
            return {
              success: true,
              data: {
                url: `${this.client.defaults.baseURL}${endpoint}`
              }
            };
          }
          
          return response.data;
        } catch (endpointError) {
          log(`Download endpoint ${endpoint} failed: ${endpointError}`);
          lastError = endpointError;
        }
      }
      
      throw lastError;
    } catch (error) {
      log(`\n--- downloadDocument error ---`);
      log(`Error type: ${error?.constructor?.name}`);
      log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      if (axios.isAxiosError(error)) {
        log(`Response status: ${error.response?.status}`);
        log(`Response data: ${JSON.stringify(error.response?.data)}`);
      }
      throw this.handleError(error);
    }
  }

  // Advanced Product Methods
  async getProductStartingDates(
    productId: string,
    params?: Omit<GetProductStartingDatesParamsType, 'productId'>
  ): Promise<ApiResponse<ProductStartingDate[]>> {
    try {
      const response = await this.client.get(`/products/${productId}/startingdates`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProductStartingDatePrices(
    productId: string,
    params: Omit<GetProductStartingDatePricesParamsType, 'productId'>
  ): Promise<ApiResponse<ProductPricing>> {
    try {
      const { startingDate, participants } = params;
      const response = await this.client.get(
        `/products/${productId}/startingdates/${startingDate}/prices`,
        { params: { participants } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPackagePriceAvailability(
    productId: string,
    packageId: string,
    params: Omit<GetPackagePriceAvailabilityParamsType, 'productId' | 'packageId'>
  ): Promise<ApiResponse<PackageAvailability>> {
    try {
      const response = await this.client.get(
        `/products/${productId}/packages/${packageId}/price`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Person Management
  async updatePerson(
    personId: string,
    params: Omit<UpdatePersonParamsType, 'personId'>
  ): Promise<ApiResponse<Person>> {
    try {
      const response = await this.client.put(`/persons/${personId}`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Address Management
  async updateAddress(
    addressId: string,
    params: Omit<UpdateAddressParamsType, 'addressId'>
  ): Promise<ApiResponse<Address>> {
    try {
      const response = await this.client.put(`/addresses/${addressId}`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Quote Management
  async initializeQuote(params: InitializeQuoteParamsType): Promise<ApiResponse<Quote>> {
    try {
      const response = await this.client.post('/quotes/initialize', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Customer Payments
  async registerCustomerPayment(params: RegisterCustomerPaymentParamsType): Promise<ApiResponse<Payment>> {
    try {
      const { bookingId, ...paymentData } = params;
      const response = await this.client.post(`/bookings/${bookingId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}