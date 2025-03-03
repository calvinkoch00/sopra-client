import { isProduction } from "@/utils/environment";

/**
 * Returns the API base URL based on the current environment.
 * It retrieves the URL from `NEXT_PUBLIC_API_URL`, falling back to production or localhost.
 */
export function getApiDomain(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ✅ Always prefer this
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-server-451813.oa.r.appspot.com";
  const devUrl = "http://localhost:8080"; // Used only if no env variable is set

  console.log("ENV API URL:", apiUrl); // ✅ Debugging log
  console.log("isProduction():", isProduction()); // ✅ Debugging log

  return apiUrl || (isProduction() ? prodUrl : devUrl);
}