import { isProduction } from "@/utils/environment";
import process from "node:process";

/**
 * Returns the API base URL based on the current environment.
 * It prioritizes `NEXT_PUBLIC_API_URL`, then falls back to production or localhost.
 */
export function getApiDomain(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim(); // ✅ Ensure it's not empty
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-server-451813.oa.r.appspot.com";
  const devUrl = "http://localhost:8080"; // Used only if no env variable is set

  if (!apiUrl) {
    console.warn("⚠️ Warning: `NEXT_PUBLIC_API_URL` is not set. Falling back to:", isProduction() ? prodUrl : devUrl);
  }

  return apiUrl || (isProduction() ? prodUrl : devUrl);
}