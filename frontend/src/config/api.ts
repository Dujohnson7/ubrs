export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL ?? "http://localhost:7700",
  TIMEOUT: 30000,
} as const;

export const getApiUrl = (path: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, "");
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};
 