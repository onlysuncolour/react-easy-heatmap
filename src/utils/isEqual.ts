// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
function isEqual(object1, object2) {

  if (object1 === object2) {
    return true
  }
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if ((isObjects && !isEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
};

const isObject = (object) => {
  return object != null && typeof object === "object";
};

export function isEqualJson(v1, v2) {
  try {
    if (isEqual(JSON.parse(v1), JSON.parse(v2))) {
      return true
    }
  } catch (error) {
    return false
  }
  return false
}
export default isEqual