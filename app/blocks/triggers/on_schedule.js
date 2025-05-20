export default {
  type: "on_schedule",

  toolbox: {
  },

  visualization: {
    colour: 30,
    tooltip: "A schedule to run the action, from every minute to once a year."
  },

  connections: {
    mode: "statement",
    output: "trigger",
    next: "trigger"
  },

  lines: [
    [ "Schedule", "CENTER" ],

    [ "Months:", {
      inputValue: "MONTH",
      check: "cron_month",
      block: "all_months",
    }],

    [ "Days:", {
      inputValue: "DAY",
      check: "cron_day",
      block: "all_days"
    }],

    [ "Hours:", {
      inputValue: "HOUR",
      check: "cron_hour",
      block: "all_hours"
    }],

    [ "Minutes:", {
      inputValue: "MINUTE",
      check: "cron_minute",
      block: {
        type: "one_minute",
        fields: {
          MINUTE: '15'
        }
      }
    }],
  ],

  generators: {
    json: (block, generator) => {
      // each schedule block generates a crontab for its unit
      const
        minute = generator.valueToCode(block, 'MINUTE', 0)  || "*/1",
        hour = generator.valueToCode(block, 'HOUR', 0)  || "*/1",
        days = generator.valueToCode(block, 'DAY', 0)  || "*/1",
        // w means days of week. if it's present then days of month is *
        daysOfMonth = days.startsWith("w") ? '*' : days,
        month = generator.valueToCode(block, 'MONTH', 0)  || "*",
        // w means days of week. if it's present, strip it, otherwise days of week is *
        daysOfWeek = days.startsWith("w") ? days.slice(1) : '*'

      return JSON.stringify({
        onSchedule: {
          schedule: `${minute} ${hour} ${daysOfMonth} ${month} ${daysOfWeek}`
        }
      })
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        EVERY_REGEX = /^(\d{1,2})(-(\d{1,2}))?\/(\d{1,2})$/m,
        isEveryBetween = cron => EVERY_REGEX.test(cron),

        everyBetweenToBlock = (everyBetweenCron, blockType) => {
          const [ skip1, START, skip2, END, FREQUENCY ] = everyBetweenCron.match(EVERY_REGEX)

          return { block: {
            type: blockType,
            fields: { START, END, FREQUENCY }
          }}
        }

      const
        monthCronToBlock = monthCron => {
          if(monthCron === '*') {
            return { block: { type: 'all_months' } }

          } else if(/^\d*$/gm.test(monthCron)) {
            return { block: { type: 'one_month', fields: { MONTH: monthCron } } }

          } else if(/^\w{3}(,\w{3})*$/gm.test(monthCron)) {
            const
              fieldNames = monthCron.toUpperCase().split(','),
              fields = fieldNames.reduce((acc, month) => {
                acc[month] = true
                return acc
              }, {})

            return { block: { type: 'some_months', fields }}

          } else if(isEveryBetween(monthCron)) {
            return everyBetweenToBlock(monthCron, 'every_months_between')

          } else {
            throw new Error(`Bad crontab for months: ${monthCron}`)
          }
        },

        dayCronsToBlock = (monthDayCron, weekDayCron) => {
          // if both are "all" just use all_days block
          if(monthDayCron === '*' && weekDayCron === '*') {
            return { block: { type: 'all_days' } }
          }

          // if both are specified, soemthing is wrong
          if(monthDayCron !== '*' && weekDayCron !== '*') {
            throw new Error(`Both days of month (${monthDayCron}) and days of week (${weekDayCron}) are set.`)
          }

          // look up a month-days block
          if(monthDayCron !== '*') {
            if(/^\d*$/gm.test(monthDayCron)) {
              return { block: { type: 'one_day', fields: { DAY: monthDayCron } } }

            } else if(isEveryBetween(monthDayCron)) {
              return everyBetweenToBlock(monthDayCron, 'every_days_between')

            } else {
              throw new Error(`Bad cron string for month days: ${monthDayCron}`)
            }

          // look up a week-days block
          } else {
            // one or more single-digit numbers separated by commas
            if(/^\d(,\d)*$/gm.test(weekDayCron)) {
              return { block: { type: 'days_of_week', fields: {
                SUN: weekDayCron.includes("0"),
                MON: weekDayCron.includes("1"),
                TUE: weekDayCron.includes("2"),
                WED: weekDayCron.includes("3"),
                THU: weekDayCron.includes("4"),
                FRI: weekDayCron.includes("5"),
                SAT: weekDayCron.includes("6"),
              } } }

            } else {
              throw new Error(`Bad cron string for week days: ${weekDayCron}`)
            }
          }
        },

        hourCronToBlock = hourCron => {
          if(hourCron === '*') {
            return { block: { type: 'all_hours' } }

          } else if(/^\d*$/gm.test(hourCron)) {
            return { block: { type: 'one_hour', fields: { HOUR: hourCron } } }

          } else if(isEveryBetween(hourCron)) {
            return everyBetweenToBlock(hourCron, 'every_hours_between')

          } else {
            throw new Error(`Bad cron string for hours: ${hourCron}`)
          }
        },

        minuteCronToBlock = minuteCron => {
          if(minuteCron === '*') {
            return { block: { type: 'all_minutes' } }

          } else if(/^\d*$/gm.test(minuteCron)) {
            return { block: { type: 'one_minute', fields: { MINUTE: minuteCron } } }

          } else if(isEveryBetween(minuteCron)) {
            return everyBetweenToBlock(minuteCron, 'every_minutes_between')

          } else {
            throw new Error(`Bad cron string for minutes: ${minuteCron}`)
          }
        }

      const
        // { schedule } = blockObject.onSchedule,
        { schedule } = Object.values(blockObject)[0],
        [ minute, hour, daysOfMonth, month, daysOfWeek ] = schedule.split(' ')

      return {
        type: "on_schedule",
        inputs: {
          MONTH: {
            ...monthCronToBlock(month),
            shadow: { type: "all_months" }
          },
          DAY: {
            ...dayCronsToBlock(daysOfMonth, daysOfWeek),
            shadow: { type: "all_days" }
          },
          HOUR: {
            ...hourCronToBlock(hour),
            shadow: { type: "all_hours" }
          },
          MINUTE: {
            ...minuteCronToBlock(minute),
            shadow: { type: "one_minute", fields: { 'MINUTE': '15' }}
          },
        }
      }
    }
  }
}
