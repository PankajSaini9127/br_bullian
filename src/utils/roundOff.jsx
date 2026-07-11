/**
 * Rounds off fine value
 * Logic:
 * - If decimal part 0.00 to 0.44, round down (0)
 * - If decimal part 0.45 to 0.89, round to 0.5
 * - If decimal part 0.90 to 0.99, round up (1)
 *
 * @param {number} fine - The fine value to round
 * @returns {number} - The rounded fine value
 */
export const roundOffFine = (fine) => {
  if (typeof fine !== 'number' || isNaN(fine)) {
    return 0;
  }

  const decimalPart = fine % 1;
  let roundedDecimal;
  if (decimalPart < 0.45) {
    roundedDecimal = 0;
  } else if (decimalPart < 0.9) {
    roundedDecimal = 0.5;
  } else {
    roundedDecimal = 1;
  }
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
