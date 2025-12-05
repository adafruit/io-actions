/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "fmt_custom",
  name: "Custom Format (strftime)",
  colour: 20,
  description: "Custom strftime format string. Use codes like %Y (year), %m (month), %d (day), %H (hour), %M (minute), %S (second), %A (weekday name), %B (month name), etc.",

  connections: {
    mode: 'value',
    output: 'datetime_format'
  },

  template: "Custom: %FORMAT_STRING",

  fields: {
    FORMAT_STRING: {
      description: "strftime format string (e.g., %Y-%m-%d %H:%M:%S)",
      text: "%Y-%m-%d %H:%M:%S"
    }
  },

  generators: {
    json: block => ({ format: { type: 'strftime', pattern: block.getFieldValue('FORMAT_STRING') } })
  },

  regenerators: {
    json: ({ format }) => ['fmt_custom', { FORMAT_STRING: format?.pattern || '%Y-%m-%d %H:%M:%S' }]
  }
}
