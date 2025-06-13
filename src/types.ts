import { z } from 'zod';

// Core credential schema - REQUIRED for all API calls
export const VictouryCredentials = z.object({
  url: z.string().url(),
  tenant: z.string().min(1),
  sessionId: z.string().min(1)
});

export type VictouryCredentials = z.infer<typeof VictouryCredentials>;

// Request options for API calls
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  useVersioning?: boolean;
  timeout?: number;
}

// API Response schemas
export const ApiInfoResponse = z.object({
  build: z.object({
    description: z.string(),
    version: z.string(),
    artifact: z.string(),
    name: z.string(),
    'victoury-common': z.string(),
    time: z.number(),
    group: z.string()
  })
});

export const ApiHealthResponse = z.object({
  status: z.string(),
  checks: z.array(z.object({
    name: z.string(),
    status: z.string()
  })).optional()
});

export type ApiInfoResponse = z.infer<typeof ApiInfoResponse>;
export type ApiHealthResponse = z.infer<typeof ApiHealthResponse>;