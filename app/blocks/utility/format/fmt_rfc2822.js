/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "fmt_rfc2822",
  name: "RFC 2822 Format",
  colour: 20,
  description: "RFC 2822 email date format (e.g., Wed, 25 Dec 2024 14:30:00 +0000). Common in email headers and HTTP.",

  connections: {
    mode: 'value',
    output: 'datetime_format'
  },

  template: "RFC 2822 (Email)",

  generators: {
    json: () => ({ format: { type: 'rfc2822' } })
  },

  regenerators: {
    json: () => ['fmt_rfc2822', {}]
  }
}
