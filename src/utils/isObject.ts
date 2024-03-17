// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

export default isObject;