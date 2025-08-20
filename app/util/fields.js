import { filter, identity, map, range, reverse } from 'lodash-es'


const makeFactorsOf = target => {
  return filter(range(target), idx => (target % idx) == 0)
}

const makeUpTo = (from, target, step) => {
  return range(from, target, step)
}

/**
*
* @param {Object} options
* @param {number} [options.factorsOf]
* @param {number} [options.upTo]
* @param {number} [options.from]
* @param {number} [options.step]
* @param {boolean} [options.reverse]
* @param {Function} [options.valueFunc]
* @returns {[string,string][]}
*/
export const makeOptions = (options = {}) => {
  let optionValues

  if(options.factorsOf) {
    optionValues = makeFactorsOf(options.factorsOf)

  } else if(options.upTo) {
    const
      from = options.from || 0,
      step = options.step || 1

    optionValues = makeUpTo(from, options.upTo, step)
  }

  if(!optionValues) {
    throw new Error(`No valid options sent to makeOptions: ${options}`)
  }

  if(options.reverse) {
    optionValues = reverse(optionValues)
  }

  const
    valueFunc = options.valueFunc || identity,
    mappedValues = map(optionValues, labelValue =>
      map([ labelValue, valueFunc(labelValue) ], String)
    )

  return mappedValues
}
