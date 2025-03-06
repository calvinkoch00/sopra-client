/*
 * This helper function returns a flag stating the current environment.
 * If an environment variable is found with NODE_ENV set to "production",
 * then it is a prod environment. Otherwise, dev.
 * Returns true if the application is running in production.
 */

export function isProduction(): boolean {
  return typeof window !== "undefined" ? process.env.NODE_ENV === "production" : false;
}

// Ensure API_BASE_URL is defined, fallback to production URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sopra-server-451813.oa.r.appspot.com";