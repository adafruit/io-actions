import mutator from './month_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "one_month",
  name: "One Month",
  colour: 30,
  description: "Runs during a particular month.",

  connections: {
    mode: 'value',
    output: 'cron_month'
  },

  mutator,

  template: "%MONTH",

  fields: {
    MONTH: {
      options: [
        [ "January", '1' ],
        [ "February", '2' ],
        [ "March", '3' ],
        [ "April", '4' ],
        [ "May", '5' ],
        [ "June", '6' ],
        [ "July", '7' ],
        [ "August", '8' ],
        [ "September", '9' ],
        [ "October", '10' ],
        [ "November", '11' ],
        [ "December", '12' ],
      ]
    }
  },

  generators: {
    json: block => {
      const month = block.getFieldValue('MONTH')

      return [ month, 0 ]
    }
  }
}
