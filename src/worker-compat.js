/**
 * Worker compatibility entry point for testing
 * This allows existing tests to continue working while the main deployment uses Pages Functions
 */

import { handleRequest } from '../functions/[[path]].js';

// Extract the main handler function for reuse
export async function handleRequestWorker(request, env, ctx) {
  // Create a Pages Functions context from Worker parameters
  const context = {
    request,
    env,
    waitUntil: ctx.waitUntil.bind(ctx),
    passThroughOnException: ctx.passThroughOnException?.bind(ctx) || (() => {})
  };

  // Call the Pages Functions handler
  return await handleRequest(request, env, ctx);
}

export default {
  /**
   * Worker format entry point for compatibility
   * @param {Request} request - The incoming request
   * @param {Object} env - Environment variables
   * @param {ExecutionContext} ctx - Cloudflare Workers execution context
   * @returns {Promise<Response>} The response object
   */
  fetch(request, env, ctx) {
    return handleRequestWorker(request, env, ctx);
  }
};
