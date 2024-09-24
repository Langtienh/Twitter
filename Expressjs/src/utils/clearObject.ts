/**
 *
 * @param object :object with some field null
 * @returns object every field not null
 */
const cleanObject = (object: Object) =>
  Object.fromEntries(
    Object.entries(object).filter(([_, value]) => value !== null)
  )

export default cleanObject
