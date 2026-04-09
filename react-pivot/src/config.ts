export function resolveApiBaseUrl() {
  return (import.meta.env.VITE_DESIRE_CACHE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
}

export function buildApiUrl(pathname: string, baseUrl = resolveApiBaseUrl()) {
  return baseUrl ? `${baseUrl}${pathname}` : pathname;
}
