// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import getTag from './getTag';
import isObjectLike from './isObjectLike';

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object, else `false`.
 * @example
 *
 * isArguments(function() { return arguments }())
 * // => true
 *
 * isArguments([1, 2, 3])
 * // => false
 */
function isArguments(value) {
    return isObjectLike(value) && getTag(value) === '[object Arguments]';
}

export default isArguments;