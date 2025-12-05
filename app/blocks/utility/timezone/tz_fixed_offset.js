import { makeOptions } from "#app/util/fields.js"

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'tz_fixed_offset',
  name: "Fixed UTC Offset",
  color: 360,
  description: "Specify a fixed offset from UTC time. Use this when you need a consistent time offset that doesn't change with daylight saving time. Format: ±HH:MM from UTC.",

  connections: {
    mode: "value",
    output: "timezone",
  },

  template: "Fixed UTC Offset %SIGN %HOURS : %MINUTES",

  fields: {
    SIGN: {
      description: "Direction of offset from UTC. '+' means ahead of UTC (east), '-' means behind UTC (west).",
      options: [
        ['+', '+'],
        ['-', '-'],
      ]
    },
    HOURS: {
      description: "Hours offset from UTC (0-14). Examples: 0 for UTC, 1 for Central European Time, 5 for Eastern Standard Time offset.",
      options: makeOptions({
        upTo: 15,
        valueFunc: h => h.toString().padStart(2, '0')
      })
    },
    MINUTES: {
      description: "Minutes offset from UTC (0-59). Most timezones use 00, but some use 30 or 45 minute offsets.",
      options: [
        ['00', '00'],
        ['15', '15'],
        ['30', '30'],
        ['45', '45'],
      ]
    }
  },

  generators: {
    json: (block) => {
      const 
        sign = block.getFieldValue('SIGN'),
        hours = parseInt(block.getFieldValue('HOURS'), 10) || 0,
        minutes = parseInt(block.getFieldValue('MINUTES'), 10) || 0,
        // Convert to total minutes offset, negative if behind UTC
        totalMinutes = (sign === '-' ? -1 : 1) * (hours * 60 + minutes)
      
      return [JSON.stringify({
        timezone: {
          type: 'offset',
          offsetMinutes: totalMinutes,
          display: `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { timezone } = blockObject
      if (!timezone || timezone.type !== 'offset') {
        throw new Error("No offset timezone data for tz_fixed_offset regenerator")
      }
      
      const 
        totalMinutes = timezone.offsetMinutes,
        sign = totalMinutes >= 0 ? '+' : '-',
        absMinutes = Math.abs(totalMinutes),
        hours = Math.floor(absMinutes / 60).toString().padStart(2, '0'),
        minutes = (absMinutes % 60).toString().padStart(2, '0')
      
      return {
        type: 'tz_fixed_offset',
        fields: {
          SIGN: sign,
          HOURS: hours,
          MINUTES: minutes
        }
      }
    }
  }
}
