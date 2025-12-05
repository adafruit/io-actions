/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "fmt_preset",
  name: "Preset Format",
  colour: 20,
  description: "Common date/time format presets for easy selection.",

  connections: {
    mode: 'value',
    output: 'datetime_format'
  },

  template: "%FORMAT",

  fields: {
    FORMAT: {
      description: "Choose a preset date/time format",
      options: [
        ["Date Only (2024-12-25)", "date_iso"],
        ["Time Only (14:30:00)", "time_iso"],
        ["Date & Time (2024-12-25 14:30)", "datetime_short"],
        ["Full Date (December 25, 2024)", "date_long"],
        ["Full DateTime (December 25, 2024 2:30 PM)", "datetime_long"],
        ["Short Date (12/25/24)", "date_short_us"],
        ["European Date (25/12/2024)", "date_short_eu"],
        ["Year-Month (2024-12)", "year_month"],
        ["Month-Day (Dec 25)", "month_day"],
        ["Day of Week (Wednesday)", "day_name"],
        ["12-Hour Time (2:30 PM)", "time_12h"],
        ["24-Hour Time (14:30)", "time_24h"]
      ]
    }
  },

  generators: {
    json: block => ({ format: { type: 'preset', preset: block.getFieldValue('FORMAT') } })
  },

  regenerators: {
    json: ({ format }) => ['fmt_preset', { FORMAT: format?.preset || 'datetime_short' }]
  }
}
