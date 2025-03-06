
export function isProduction(): boolean {
  return typeof window !== "undefined" ? process.env.NODE_ENV === "production" : false;
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sopra-server-451813.oa.r.appspot.com";