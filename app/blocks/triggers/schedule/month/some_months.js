import mutator from './month_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'some_months',
  name: "Some Months",
  colour: 30,
  description: "Run during particular months.",

  connections: {
    mode: 'value',
    output: 'cron_month'
  },

  mutator,

  template: `
    Jan: %JAN Feb: %FEB Mar: %MAR Apr: %APR |CENTER
    May: %MAY Jun: %JUN Jul: %JUL Aug: %AUG |CENTER
    Sep: %SEP Oct: %OCT Nov: %NOV Dec: %DEC |CENTER
  `,

  fields: {
    JAN: { checked: false },
    FEB: { checked: false },
    MAR: { checked: false },
    APR: { checked: false },
    MAY: { checked: false },
    JUN: { checked: false },
    JUL: { checked: false },
    AUG: { checked: false },
    SEP: { checked: false },
    OCT: { checked: false },
    NOV: { checked: false },
    DEC: { checked: false },
  },

  generators: {
    json: block => {
      const
        MONTHS = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ],
        selectedMonths = MONTHS.reduce((months, month) => (
            block.getFieldValue(month) === "TRUE"
              ? months.concat(month)
              : months
          ), []),
        months = selectedMonths.join(',').toLowerCase()
        // TODO: use a validator to ensure at least 1 month is set

      return [ months, 0 ]
    }
  }
}
