export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  isBack?: boolean;
}

/**
 * Validate a URL string
 */
export function validateUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  if (trimmed.toLowerCase() === 'back') {
    return { valid: true, isBack: true };
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use http:// or https:// protocol' };
    }

    // Must have a hostname
    if (!parsed.hostname) {
      return { valid: false, error: 'URL must have a valid hostname' };
    }

    return { valid: true, normalizedUrl: trimmed };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate URL for OpenAI-compatible providers (must end with /v1)
 */
export function validateOpenAICompatibleUrl(url: string): UrlValidationResult {
  const baseResult = validateUrl(url);
  if (!baseResult.valid) return baseResult;
  if (baseResult.isBack) return baseResult;
  
  const normalizedUrl = baseResult.normalizedUrl!;
  // Remove trailing slash for consistent check
  const urlWithoutTrailingSlash = normalizedUrl.replace(/\/+$/, '');
  
  if (!urlWithoutTrailingSlash.endsWith('/v1')) {
    return { 
      valid: false, 
      error: 'OpenAI-compatible URLs must end with /v1 (e.g., https://api.example.com/v1)' 
    };
  }
  
  return baseResult;
}
