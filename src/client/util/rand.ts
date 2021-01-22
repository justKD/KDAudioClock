/**
 * @file rand.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `Math.random()` alternative. Return a random number using `window.crypto.getRandomValues()`.
 */

/**
 * `Math.random()` alternative. Return a random number using `window.crypto.getRandomValues()`.
 * @param {number} [scale] - Multiply the random value by `scale` before returning. Returns `0-1` if this param is empty.
 * @param {number} [places] - Set the number of decimal places to use. `0` returns a whole number.
 * @returns {number} The random `number`.
 * @example
 *  const num = rand(); // random number 0-1
 *  const num2 = rand(1, 2); // random number 0-1 with 2 decimal places
 *  const wholeNum = rand(100, 0); // random whole number 0-100
 */
export const rand = (scale?: number, places?: number): number => {
  const MAX_UINT32 = 4294967295;
  const arr = window.crypto.getRandomValues(new Uint32Array(1));
  const num = arr[0] / MAX_UINT32;
  const result = scale ? scale * num : num;
  return Number.isSafeInteger(places)
    ? parseFloat(result.toFixed(places))
    : result;
};
