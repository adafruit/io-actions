import mutator from "./day_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "days_of_week",
  name: "Days of the Week",
  colour: 30,
  description: "Runs during certain days of the week.",

  connections: {
    mode: 'value',
    output: 'cron_day'
  },

  mutator,

  template: `
    Sun: %SUN Mon: %MON Tue: %TUE Wed: %WED
    Thu: %THU Fri: %FRI Sat: %SAT |CENTER
  `,

  fields: {
    SUN: { checked: true },
    MON: { checked: true },
    TUE: { checked: true },
    WED: { checked: true },
    THU: { checked: true },
    FRI: { checked: true },
    SAT: { checked: true }
  },

  generators: {
    json: block => {
      const
        selectedDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
          .reduce((days, day, index) => (
            block.getFieldValue(day) === "TRUE"
              ? days.concat(index)
              : days
          ), []),
        // use * if it's everyday, or no days
        // TODO: use a validator to ensure at least 1 day is set
        days = (selectedDays.length === 7 || selectedDays.length === 0)
          ? '*'
          : `w${selectedDays.join(',')}`

      return [ days , 0 ]
    }
  }
}
