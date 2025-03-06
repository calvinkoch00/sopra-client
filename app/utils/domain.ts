import { isProduction } from "@/utils/environment";

export function getApiDomain(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL || 
    "https://sopra-server-451813.oa.r.appspot.com";
  const devUrl = "http://localhost:8080";

  if (!apiUrl && typeof window !== "undefined") {
    console.warn(
      "⚠️ Warning: `NEXT_PUBLIC_API_URL` is not set. Falling back to:", 
      isProduction() ? prodUrl : devUrl
    );
  }

  return apiUrl || (isProduction() ? prodUrl : devUrl);
}