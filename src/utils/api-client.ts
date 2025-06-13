import axios from 'axios';
import { VictouryCredentials, RequestOptions, ApiInfoResponse, ApiHealthResponse } from '../types.js';

/**
 * Makes an authenticated request to the Victoury API
 * 
 * Automatically handles API versioning:
 * - Service monitoring endpoints (/info, /health): strips version from URL
 * - All other endpoints: preserves version in URL (defaults to /v2 if missing)
 * 
 * Supports any version pattern (v1, v2, v3, etc.)
 */
export async function makeVictouryRequest(
  credentials: VictouryCredentials,
  options: RequestOptions
): Promise<any> {
  const { method, endpoint, data, useVersioning = true, timeout = 30000 } = options;
  
  // Remove version (e.g., /v1, /v2, /v3, etc.) from base URL if versioning is disabled
  let baseUrl = credentials.url;
  if (!useVersioning) {
    // Strip any version pattern (/v followed by numbers) from the end of the URL
    baseUrl = baseUrl.replace(/\/v\d+$/, '');
  } else if (useVersioning && !/\/v\d+$/.test(baseUrl)) {
    // If versioning is needed but URL doesn't have version, assume v2 for backward compatibility
    baseUrl = `${baseUrl}/v2`;
  }
  
  const fullUrl = `${baseUrl}${endpoint}`;
  
  const config = {
    method,
    url: fullUrl,
    headers: {
      'Content-Type': 'application/json',
      'Tenant': credentials.tenant,
      'Session-Id': credentials.sessionId
    },
    ...(data && { data }),
    timeout
  };
  
  // Debug logging
  console.log('=== API CALL DEBUG ===');
  console.log('URL:', config.url);
  console.log('Method:', config.method);
  console.log('Headers:', JSON.stringify(config.headers, null, 2));
  console.log('Request Body:', config.data ? JSON.stringify(config.data, null, 2) : 'No body');
  console.log('Timeout:', config.timeout);
  console.log('====================');

  try {
    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`API Error ${status}: ${message}`);
    } else if (error.request) {
      throw new Error('Network error: No response received from Victoury API');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
}