/**
 * Formats a price number to Philippine Peso format
 * @param price - The price as a number
 * @returns Formatted price string with ₱ symbol
 */
export function formatPrice(price: number | string): string {
  const parsed = Number(price);
  return `₱${parsed.toLocaleString('en-PH', {
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 2
  })}`;
}

/**
 * Formats a price number to Philippine Peso format with decimal places
 * @param price - The price as a number
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string with ₱ symbol and decimal places
 */
export function formatPriceWithDecimals(price: number, decimals: number = 2): string {
  return `₱${price.toLocaleString('en-PH', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`;
}
