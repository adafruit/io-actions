/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_math_arithmetic',
  bytecodeKey: "arithmetic",
  name: "Arithmetic",
  colour: 120,
  inputsInline: true,
  description: "Perform mathematical calculations using sensor data, feed values, or any numbers in your Actions. Perfect for creating custom formulas like calculating averages, converting units (Celsius to Fahrenheit), computing percentages, or building complex calculations from multiple data sources.",
  connections: {
    mode: "value",
    output: "expression",
  },
  template: `%A %OP %B`,
  inputs: {
    A: {
      description: "The first number in your calculation (left side). Examples: temperature reading (72.5), feed value, sensor data, or results from other calculations. Non-numeric values will be automatically converted to numbers where possible.",
      check: "expression",
      shadow: 'io_math_number'
    },
    B: {
      description: "The second number in your calculation (right side). Examples: conversion factors (1.8 for temp conversion), target values (75 for comparison), other sensor readings, or mathematical constants. Also automatically converted to numbers.",
      check: "expression",
      shadow: 'io_math_number'
    },
  },
  fields: {
    OP: {
      description: "Choose the mathematical operation to perform:",
      options: [
        ['+', 'ADD', "Addition: Combine two numbers (e.g., 25 + 5 = 30). For totaling values, adding offsets, or combining multiple sensor readings into sums."],
        ['-', 'MINUS', "Subtraction: Remove B from A (e.g., 30 - 5 = 25). For calculating differences, finding deltas between readings, or subtracting baseline values."],
        ['x', 'MULTIPLY', "Multiplication: A times B (e.g., 6 x 4 = 24). For unit conversions, scaling values, calculating areas/volumes, or applying multiplication factors."],
        ['/', 'DIVIDE', "Division: A divided by B (e.g., 20 ÷ 4 = 5). For calculating averages, ratios, percentages, or converting between different unit scales."],
        ['^', 'POWER', "Exponentiation: A raised to the power of B (e.g., 2^3 = 8). For advanced calculations, exponential growth models, or complex mathematical formulas."],
      ]
    }
  },
  generators: {
    json: (block, generator) => {
      const
        operatorMap = {
          ADD: '+',
          MINUS: '-',
          MULTIPLY: '*',
          DIVIDE: '/',
          POWER: '^'
        },
        operator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || 'null',
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',
        blockPayload = JSON.stringify({
          arithmetic: {
            left: JSON.parse(leftExp),
            operator: operator
              ? operatorMap[operator]
              : null,
            right: JSON.parse(rightExp)
          }
        })
      return [ blockPayload, 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        payload = blockObject.arithmetic,
        operatorMap = {
          '+': 'ADD',
          '-': 'MINUS',
          '*': 'MULTIPLY',
          '/': 'DIVIDE',
          '^': 'POWER',
        },
        fields = {
          OP: operatorMap[payload.operator]
        },
        inputs = {
          A: helpers.expressionToBlock(payload.left, { shadow: 'io_math_number' }),
          B: helpers.expressionToBlock(payload.right, { shadow: 'io_math_number' }),
        }
      return { type: 'io_math_arithmetic', fields, inputs }
    }
  }
}
