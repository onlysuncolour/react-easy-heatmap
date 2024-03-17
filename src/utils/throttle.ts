// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import debounce from './debounce';
import isObject from './isObject';

function throttle(func, wait, options?) {
    let leading = true;

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
    }
    if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
    }
    return debounce(func, wait, {
        leading,
        maxWait: wait,
    });
}

export default throttle;