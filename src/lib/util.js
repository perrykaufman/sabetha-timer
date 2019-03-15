export function isStringArray(value) {
  return value instanceof Array && value.every(el => typeof el == 'string')
}