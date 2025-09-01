/**
 * Test compatibility layer for Pages Functions
 * This module provides a bridge between Worker tests and Pages Functions
 */

import { onRequest } from '../functions/[[path]].js';

/**
 * Creates a mock execution context for Pages Functions
 * @param {Object} env - Environment variables
 * @returns {Object} Mock context object
 */
function createMockContext(env = {}) {
  const cache = new Map();

  return {
    env,
    request: null, // Will be set when processing
    waitUntil: promise => promise,
    passThroughOnException: () => {},
    // Mock cache implementation
    caches: {
      default: {
        match: async key => cache.get(key.url) || null,
        put: async (key, response) => {
          cache.set(key.url, response.clone());
        },
        delete: async key => cache.delete(key.url)
      }
    }
  };
}

/**
 * Mock SELF object that mimics Cloudflare Worker behavior
 */
export const SELF = {
  /**
   * Mock fetch function that calls Pages Functions
   * @param {string | Request} input - URL or Request object
   * @param {RequestInit} init - Request init options
   * @returns {Promise<Response>} Response object
   */
  async fetch(input, init = {}) {
    let request;

    if (typeof input === 'string') {
      request = new Request(input, init);
    } else {
      request = input;
    }

    const context = createMockContext();
    context.request = request;

    // Mock global fetch for the function
    if (!globalThis.fetch) {
      globalThis.fetch = async (url, options) => {
        // Mock implementation - just return a basic response for testing
        return new Response('Mock response', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      };
    }

    // Mock global caches
    if (!globalThis.caches) {
      const cache = new Map();
      globalThis.caches = {
        default: {
          match: async key => cache.get(key.url) || null,
          put: async (key, response) => {
            cache.set(key.url, response.clone());
          },
          delete: async key => cache.delete(key.url)
        }
      };
    }

    try {
      return await onRequest(context);
    } catch (error) {
      console.error('Test error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

// Export for CommonJS compatibility
export default { SELF };
