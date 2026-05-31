/**
 * Rounds off fine value to nearest 0.5
 * Logic: 
 * - If decimal part <= 0.49, round down (0)
 * - If decimal part <= 0.99, round to 0.5
 * - Otherwise, round up (1)
 * 
 * @param {number} fine - The fine value to round
 * @returns {number} - The rounded fine value
 */
export const roundOffFine = (fine) => {
  if (typeof fine !== 'number' || isNaN(fine)) {
    return 0;
  }
  
  const decimalPart = fine % 1;
  const roundedDecimal = decimalPart <= 0.49 ? 0 : (decimalPart <= 0.99 ? 0.5 : 1);
  return Math.floor(fine) + roundedDecimal;
};

/**
 * Rounds off fine value to nearest 0.5 and returns as string with 2 decimals
 * 
 * @param {number} fine - The fine value to round
 * @returns {string} - The rounded fine value as string with 2 decimals
 */
export const roundOffFineFormatted = (fine) => {
  return roundOffFine(fine).toFixed(2);
};
