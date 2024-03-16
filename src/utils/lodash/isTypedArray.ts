// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import getTag from './getTag.js';
import isObjectLike from './isObjectLike.js';

/** Used to match `toStringTag` values of typed arrays. */
const reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * isTypedArray(new Uint8Array)
 * // => true
 *
 * isTypedArray([])
 * // => false
 */
const isTypedArray = (value) => isObjectLike(value) && reTypedTag.test(getTag(value));

export default isTypedArray;