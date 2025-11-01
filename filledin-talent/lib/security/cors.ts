// import { NextRequest, NextResponse } from 'next/server';

// export interface CorsOptions {
//   origin?: string | string[] | boolean;
//   methods?: string[];
//   allowedHeaders?: string[];
//   exposedHeaders?: string[];
//   credentials?: boolean;
//   maxAge?: number;
//   preflightContinue?: boolean;
//   optionsSuccessStatus?: number;
// }

// const defaultOptions: CorsOptions = {
//   origin: process.env.NODE_ENV === 'production' 
//     ? [process.env.NEXTAUTH_URL || 'https://your-domain.com']
//     : ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin',
//     'X-CSRF-Token'
//   ],
//   exposedHeaders: [
//     'X-Session-Remaining',
//     'X-Session-Warning',
//     'X-Rate-Limit-Remaining',
//     'X-Rate-Limit-Reset'
//   ],
//   credentials: true,
//   maxAge: 86400, // 24 hours
//   optionsSuccessStatus: 200
// };

// /**
//  * CORS middleware for API routes
//  */
// export function corsMiddleware(options: CorsOptions = {}) {
//   const config = { ...defaultOptions, ...options };

//   return (request: NextRequest): NextResponse | null => {
//     const origin = request.headers.get('origin');
//     const method = request.method;

//     // Handle preflight requests
//     if (method === 'OPTIONS') {
//       const response = new NextResponse(null, { status: config.optionsSuccessStatus });
      
//       // Set CORS headers for preflight
//       setCorsHeaders(response, origin, config);
      
//       return response;
//     }

//     // For non-preflight requests, return null to continue processing
//     // CORS headers will be set in the response
//     return null;
//   };
// }

// /**
//  * Set CORS headers on response
//  */
// export function setCorsHeaders(
//   response: NextResponse, 
//   origin: string | null, 
//   config: CorsOptions
// ): void {
//   // Handle origin
//   if (config.origin === true) {
//     response.headers.set('Access-Control-Allow-Origin', origin || '*');
//   } else if (config.origin === false) {
//     // No CORS
//     return;
//   } else if (typeof config.origin === 'string') {
//     response.headers.set('Access-Control-Allow-Origin', config.origin);
//   } else if (Array.isArray(config.origin)) {
//     if (origin && config.origin.includes(origin)) {
//       response.headers.set('Access-Control-Allow-Origin', origin);
//     }
//   }

//   // Set other CORS headers
//   if (config.credentials) {
//     response.headers.set('Access-Control-Allow-Credentials', 'true');
//   }

//   if (config.methods) {
//     response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
//   }

//   if (config.allowedHeaders) {
//     response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
//   }

//   if (config.exposedHeaders) {
//     response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
//   }

//   if (config.maxAge) {
//     response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
//   }
// }

// /**
//  * Higher-order function to wrap API handlers with CORS
//  */
// export function withCors(
//   handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>,
//   options: CorsOptions = {}
// ) {
//   return async (request: NextRequest, context?: Record<string, unknown>): Promise<NextResponse> => {
//     const config = { ...defaultOptions, ...options };
//     const origin = request.headers.get('origin');

//     // Handle preflight requests
//     if (request.method === 'OPTIONS') {
//       const response = new NextResponse(null, { status: config.optionsSuccessStatus });
//       setCorsHeaders(response, origin, config);
//       return response;
//     }

//     // Process the actual request
//     const response = await handler(request, context);
    
//     // Add CORS headers to the response
//     setCorsHeaders(response, origin, config);
    
//     return response;
//   };
// }

// /**
//  * Validate origin against allowed origins
//  */
// export function isOriginAllowed(origin: string | null, allowedOrigins: string | string[] | boolean): boolean {
//   if (!origin) return false;
  
//   if (allowedOrigins === true) return true;
//   if (allowedOrigins === false) return false;
  
//   if (typeof allowedOrigins === 'string') {
//     return origin === allowedOrigins;
//   }
  
//   if (Array.isArray(allowedOrigins)) {
//     return allowedOrigins.includes(origin);
//   }
  
//   return false;
// }

// /**
//  * Security-focused CORS configuration for production
//  */
// export const productionCorsConfig: CorsOptions = {
//   origin: [
//     process.env.NEXTAUTH_URL || 'https://your-domain.com',
//     // Add your production domains here
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'X-CSRF-Token'
//   ],
//   credentials: true,
//   maxAge: 3600, // 1 hour for production
// };

// /**
//  * Development CORS configuration
//  */
// export const developmentCorsConfig: CorsOptions = {
//   origin: [
//     'http://localhost:3000',
//     'http://127.0.0.1:3000',
//     'http://localhost:3001', // For testing
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin',
//     'X-CSRF-Token'
//   ],
//   credentials: true,
//   maxAge: 86400, // 24 hours for development
// };