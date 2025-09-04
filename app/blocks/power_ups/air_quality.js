import airQualityMixin from "./air_quality_mixin.js"


export default {
  type: "air_quality",
  bytecodeKey: "airQuality",
  name: "Air Quality",
  colour: 360,
  ioPlus: true,
  description: "Fetch current or forecast air quality conditions at the specified location using Open-Meteo Air Quality API.",

  connections: {
    mode: "value",
    output: "expression",
  },

  mixins: [
    'replaceDropdownOptions',
    { airQualityMixin }
  ],

  extensions: {
    prepareAirQuality: ({ block, observeData, data: { airQualityLocationOptions } }) => {
      // populate air quality locations
      if(!airQualityLocationOptions?.length) {
        airQualityLocationOptions = [[ "No locations! Visit Power-Ups -> Air Quality", "" ]]
        block.setEnabled(false)

      } else if(airQualityLocationOptions[0][1] != "") {
        airQualityLocationOptions.unshift([ "Select Location", "" ])
      }

      block.replaceDropdownOptions("POWER_UP_ID", airQualityLocationOptions)

      // skip the rest if we're in the toolbox
      if(block.isInFlyout) { return }

      // yield so fields can populate, flags can be set
      setTimeout(() => {
        // nope out for insertion markers
        if(block.isInsertionMarker()) { return }

        // auto-disable block, if necessary
        block.setEnabledByLocation()

        // react to incoming forecast data
        const unobserve = observeData('currentAirQualityByLocation', (newData = {}) => {
          // if this block is disposed, clean up this listener
          if (block.isDisposed()) { unobserve(); return }
          // update the reference to the injected/updated extension data
          block.currentAirQualityByLocation = newData
          // re-run the things that use the data
          block.refreshPropertyOptions({})
        })
      }, 1)
    }
  },

  template: `
    Air Quality |CENTER
    At: %POWER_UP_ID
    When: %AIR_QUALITY_TIME
    Metric: %AIR_QUALITY_PROPERTY
    %AIR_QUALITY_PROPERTY_HELP
  `,

  fields: {
    POWER_UP_ID: {
      description: "Select a location from those defined by the Air Quality Power-Up",
      options: [
        [ "Loading locations...", "" ],
      ]
    },

    AIR_QUALITY_TIME: {
      description: "Select which kind of forecast to query",
      options: [
        [ "Now", "current" ],
        [ "Today", "forecast_today" ],
        [ "Tomorrow", "forecast_tomorrow" ],
        [ "In 2 days", "forecast_day_2" ],
        [ "In 3 days", "forecast_day_3" ],
        [ "In 4 days", "forecast_day_4" ],
        [ "In 5 days", "forecast_day_5" ]
      ]
    },

    AIR_QUALITY_PROPERTY: {
      description: "Select which metric of the air quality to use.",
      label: ""
    },

    AIR_QUALITY_PROPERTY_HELP: {
      label: ""
    },
  },

  generators: {
    json: block => {
      const
        powerUpId = parseInt(block.getFieldValue('POWER_UP_ID'), 10),
        airQualityTime = block.getFieldValue('AIR_QUALITY_TIME'),
        airQualityProperty = block.getFieldValue('AIR_QUALITY_PROPERTY'),
        payload = { airQuality: {
            powerUpId, airQualityTime, airQualityProperty
        }}

      return [ JSON.stringify(payload), 0 ]
    }
  },

  regenerators: {
    json: blockObject => {
      const payload = blockObject.airQuality

      return {
        type: "air_quality",
        fields: {
          POWER_UP_ID: String(payload.powerUpId),
          AIR_QUALITY_TIME: payload.airQualityTime,
          AIR_QUALITY_PROPERTY: payload.airQualityProperty,
        }
      }
    }
  }
}
