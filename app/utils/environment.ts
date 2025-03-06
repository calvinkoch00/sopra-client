/*
 * This helper function returns a flag stating the current environment.
 * If an environment variable is found with NODE_ENV set to true,
 * then it is a prod environment. Otherwise, dev.
 * Returns true if the application is running in production.
 */
//import process from "node:process";
import process from "node:process";
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Check if API_BASE_URL is set in .env, fallback to production URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sopra-server-451813.oa.r.appspot.com";