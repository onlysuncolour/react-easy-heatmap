// @ts-nocheck

const isEmpty = obj =>
  !Object.entries(obj || {}).length && !obj?.length && !obj?.size

export default isEmpty