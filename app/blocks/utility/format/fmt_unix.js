/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "fmt_unix",
  name: "Unix Timestamp Format",
  colour: 20,
  description: "Unix timestamp - seconds since January 1, 1970 (e.g., 1735138200). Ideal for calculations and storage.",

  connections: {
    mode: 'value',
    output: 'datetime_format'
  },

  template: "Unix Timestamp",

  generators: {
    json: () => ({ format: { type: 'unix' } })
  },

  regenerators: {
    json: () => ['fmt_unix', {}]
  }
}
