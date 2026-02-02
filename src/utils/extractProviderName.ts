/**
 * Extract provider name from a URL
 * Example: https://api.xreatlabs.space -> Xreatlabs
 */
export function extractProviderName(url: string): string {
  try {
    const domain = new URL(url).hostname;
    
    // Remove common prefixes like 'api.', 'www.', 'models.', etc.
    const cleaned = domain
      .replace(/^(api|www|models|inferencing|gateway|llm|chat)\./i, '')
      .replace(/^openai\-compatible\-/i, '');
    
    // Get the main domain name (before first dot)
    const name = cleaned.split('.')[0];
    
    // Capitalize first letter, rest lowercase
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    
    return 'Custom Provider';
  } catch {
    return 'Custom Provider';
  }
}
