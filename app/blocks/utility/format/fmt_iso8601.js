/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "fmt_iso8601",
  name: "ISO 8601 Format",
  colour: 20,
  description: "ISO 8601 standard format (e.g., 2024-12-25T14:30:00Z). The most widely used format for data interchange.",

  connections: {
    mode: 'value',
    output: 'datetime_format'
  },

  template: "ISO 8601",

  generators: {
    json: () => ({ format: { type: 'iso8601' } })
  },

  regenerators: {
    json: () => ['fmt_iso8601', {}]
  }
}
