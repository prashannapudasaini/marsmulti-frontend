/**
 * Validates Nepali mobile numbers strictly matching schema regex: ^(?:\+?977)?(?:98|97)\d{8}$
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.strip ? phone.strip().replace(/[\s\-\+\(\)]/g, '') : phone.replace(/[\s\-]/g, '');
  const nepaliRegex = /^(?:\+?977)?(?:98|97)\d{8}$/;
  return nepaliRegex.test(cleaned);
}

/**
 * Validates delivery address completeness for Cash-on-Delivery dispatches.
 */
export function validateAddress(address) {
  return typeof address === 'string' && address.trim().length >= 5;
}
