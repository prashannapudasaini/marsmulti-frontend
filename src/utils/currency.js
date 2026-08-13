/**
 * Formats a numeric price value into traditional Nepali Rupee (NPR) formatting.
 * Example: 385000 -> NPR 3,85,000
 */
export function formatNPR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rs 0";
  
  const num = Math.round(amount);
  const str = num.toString();
  
  // Nepali currency grouping pattern (2 digits after initial 3 digits from right)
  let lastThree = str.substring(str.length - 3);
  const otherDigits = str.substring(0, str.length - 3);
  if (otherDigits !== "") {
    lastThree = "," + lastThree;
  }
  
  const res = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `Rs ${res}`;
}
