/**
 * Utility to detect network-related errors from error messages.
 *
 * Checks if the error message indicates a network connectivity issue
 * (e.g. fetch failure, no internet, timeout) so the UI can show
 * a specific "Không có kết nối mạng" message.
 *
 * Validates: Requirements 11.1
 */

const NETWORK_KEYWORDS = [
  'network',
  'fetch',
  'kết nối',
  'internet',
  'timeout',
  'timed out',
  'net::',
  'econnrefused',
  'enotfound',
  'unable to resolve',
  'no internet',
];

export function isNetworkError(error: string | null | undefined): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return NETWORK_KEYWORDS.some((kw) => lower.includes(kw));
}

export const NETWORK_ERROR_MESSAGE = 'Không có kết nối mạng';
