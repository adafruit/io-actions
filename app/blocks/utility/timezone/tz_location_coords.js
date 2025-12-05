/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'tz_location_coords',
  name: "Timezone by Coordinates",
  color: 360,
  description: "Determine timezone based on geographic coordinates (latitude and longitude). Useful for location-aware IoT devices that need to calculate local time based on their physical position.",

  connections: {
    mode: "value",
    output: "timezone",
  },

  template: "Location: Lat: %LAT Long: %LONG",

  fields: {
    LAT: {
      description: "Latitude coordinate (-90 to 90). Positive values are North, negative values are South. Example: 51.5074 for London, 40.7128 for New York.",
      text: '0'
    },
    LONG: {
      description: "Longitude coordinate (-180 to 180). Positive values are East, negative values are West. Example: -0.1278 for London, -74.0060 for New York.",
      text: '0'
    }
  },

  generators: {
    json: (block) => {
      const 
        lat = parseFloat(block.getFieldValue('LAT')) || 0,
        long = parseFloat(block.getFieldValue('LONG')) || 0
      
      return [JSON.stringify({
        timezone: {
          type: 'coordinates',
          lat,
          long
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { timezone } = blockObject
      if (!timezone || timezone.type !== 'coordinates') {
        throw new Error("No coordinates timezone data for tz_location_coords regenerator")
      }
      
      return {
        type: 'tz_location_coords',
        fields: {
          LAT: timezone.lat.toString(),
          LONG: timezone.long.toString()
        }
      }
    }
  }
}
