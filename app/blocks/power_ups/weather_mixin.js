// helpers for the weather block
// simplifies juggling the weather api properties by location and period
export default {
  onchange: function({ blockId, type, name, element, newValue }) {
    // only change events, for this block, unless it is a marker
    if(this.id !== blockId || type !== "change" || this.isInsertionMarker()) { return }

    // double-check anytime this block gets enabled (disableOrphans)
    if(element === "disabled" && newValue === false) {
      this.setEnabledByLocation()

    } else if(element === "field") {
      if (name === "POWER_UP_ID") {
        // enable/disabled based on location change
        this.setEnabledByLocation()
        this.refreshPropertyOptions({ locationKey: newValue })

      } else if (name === "WEATHER_TIME") {
        // update available metrics when forecast changes
        this.refreshPropertyOptions({ timeKey: newValue })

      } else if (name === "WEATHER_PROPERTY") {
        // update help text when the metric changes
        this.updateHelpTextForWeatherProperty({ propertyKey: newValue })
      }
    }
  },

  autoDisable: true,

  setEnabledByLocation: function() {
    // bail if this behavior has been disabled
    if(!this.autoDisable) { return }

    // must have a location and a parent (copacetic with disableOrphans)
    if(this.getFieldValue("POWER_UP_ID") === "" || !this.getParent()) {
      this.disabled || this.setEnabled(false)
    } else {
      this.disabled && this.setEnabled(true)
    }
  },

  // helper to humanize camelCase strings
  keyToLabel: function(key) {
    const label = key
      // insert spaces before each capital letter
      .replaceAll(/[A-Z]/g, (match) => `\u00A0${match}`)
      // insert a space after a : and upcase the next letter
      .replaceAll(/:[a-z]/g, (match) => `:\u00A0${match.slice(1).toUpperCase()}`)
      // upcase the first letter
      .replace(/^[a-z]/, (match) => match.toUpperCase())

    return label
  },

  keyToHelpObject: function(key) {
    const keyWithoutDayPart = key.split(":").pop()

    return this.HELP_TEXT_BY_PROP[keyWithoutDayPart] || {}
  },

  keyToTooltip: function(key) {
    const { description="" } = this.keyToHelpObject(key)

    return `${this.keyToLabel(key)}:\n  ${description}`
  },

  keyToCurrent: function(key, { timeKey=null, locationKey=null }) {
    const
      locationId = locationKey || this.getFieldValue("POWER_UP_ID"),
      forecast = timeKey || this.getFieldValue("WEATHER_TIME"),
      currentValue = this.currentWeatherByLocation[locationId]?.[forecast]?.[key]

    // return a current value with "Now" label, if found
    if(currentValue !== undefined && currentValue !== null) {
      return `Now:\u00A0${currentValue}`
    }

    // use example value with "e.g." label otherwise
    const { example="unknown" } = this.keyToHelpObject(key)

    return `e.g.\u00A0${example}`
  },

  refreshPropertyOptions: function({ timeKey=null, locationKey=null }) {
    timeKey = timeKey || this.getFieldValue("WEATHER_TIME")

    if(!timeKey) {
      throw new Error(`[mixins.weather] No timeKey available for ${this.toDevString()}`)
    }

    let optionKeys
    if(timeKey === 'current') {
      optionKeys = this.CURRENT_PROPS

    } else if(timeKey.match(/minutes/)) {
      optionKeys = this.MINUTE_PROPS

    } else if(timeKey.match(/hours/)) {
      optionKeys = this.HOUR_PROPS

    } else if(timeKey.match(/days/)) {
      optionKeys = this.DAY_PROPS.concat(
        this.DAYTIME_OVERNIGHT_PROPS.flatMap(prop =>
          [`daytime:${prop}`, `overnight:${prop}` ]
        )
      )

    } else {
      throw new Error(`[mixins.weather] timeKey not recognized: ${timeKey}`)
    }

    // TODO: is there a way to add tooltips for each option as well?
    const propertyOptions = optionKeys.reduce((acc, key) => {
      const
        name = this.keyToLabel(key),
        current = this.keyToCurrent(key, { timeKey, locationKey }),
        label = `${name}\u00A0(${current})`

      acc.push([ label, key ])

      return acc
    }, [])

    // update the property options and the property help
    this.replaceDropdownOptions("WEATHER_PROPERTY", propertyOptions)
    this.updateHelpTextForWeatherProperty({ timeKey, locationKey })
  },

  updateHelpTextForWeatherProperty: function({ propertyKey=null, timeKey=null, locationKey=null }) {
    const
      propertyField = this.getField("WEATHER_PROPERTY"),
      helpField = this.getField("WEATHER_PROPERTY_HELP")

    if(!propertyKey) {
      propertyKey = propertyField.getValue()
    }

    const
      helpText = this.keyToTooltip(propertyKey),
      current = this.keyToCurrent(propertyKey, { timeKey, locationKey })

    // set a metric tooltip on dropdown and help text
    propertyField.setTooltip(helpText)
    helpField.setTooltip(helpText)

    // update the help text with examples for this metric
    helpField.setValue(current)
  },

  // a placeholder for the incoming preview data from live weatherkit requests
  currentWeatherByLocation: {},

  CURRENT_PROPS: [
    // 'asOf',
    'cloudCover',
    'cloudCoverLowAltPct',
    'cloudCoverMidAltPct',
    'cloudCoverHighAltPct',
    'conditionCode',
    'daylight',
    'humidity',
    'precipitationIntensity',
    'pressure',
    'pressureTrend',
    'temperature',
    'temperatureApparent',
    'temperatureDewPoint',
    'uvIndex',
    'visibility',
    'windDirection',
    'windGust',
    'windSpeed'
  ],

  MINUTE_PROPS: [
    // 'startTime',
    'precipitationChance',
    'precipitationIntensity'
  ],

  HOUR_PROPS: [
    // 'forecastStart',
    'cloudCover',
    'conditionCode',
    'daylight',
    'humidity',
    'precipitationAmount',
    'precipitationIntensity',
    'precipitationChance',
    'precipitationType',
    'pressure',
    'pressureTrend',
    'snowfallIntensity',
    'snowfallAmount',
    'temperature',
    'temperatureApparent',
    'temperatureDewPoint',
    'uvIndex',
    'visibility',
    'windDirection',
    'windGust',
    'windSpeed'
  ],

  DAY_PROPS: [
    // 'forecastStart',
    // 'forecastEnd',
    'conditionCode',
    'maxUvIndex',
    'moonPhase',
    'moonrise',
    'moonset',
    'precipitationAmount',
    'precipitationChance',
    'precipitationType',
    'snowfallAmount',
    'solarMidnight',
    'solarNoon',
    'sunrise',
    'sunriseCivil',
    'sunriseNautical',
    'sunriseAstronomical',
    'sunset',
    'sunsetCivil',
    'sunsetNautical',
    'sunsetAstronomical',
    'temperatureMax',
    'temperatureMin',
    'windGustSpeedMax',
    'windSpeedAvg',
    'windSpeedMax',
  ],

  DAYTIME_OVERNIGHT_PROPS: [
    // 'forecastStart',
    // 'forecastEnd',
    'cloudCover',
    'conditionCode',
    'humidity',
    'precipitationAmount',
    'precipitationChance',
    'precipitationType',
    'snowfallAmount',
    'temperatureMax',
    'temperatureMin',
    'windDirection',
    'windGustSpeedMax',
    'windSpeed',
    'windSpeedMax'
  ],

  HELP_TEXT_BY_PROP: {
    cloudCover: {
      example: "0.0",
      description: "The percentage of the sky covered with clouds during the period."
    },
    cloudCoverLowAltPct: {
      example: "0.0",
      description: "The percentage of the sky covered with low-altitude clouds (1800m and below) during the period."
    },
    cloudCoverMidAltPct: {
      example: "0.0",
      description: "The percentage of the sky covered with mid-altitude clouds (1800m to 6300m) during the period."
    },
    cloudCoverHighAltPct: {
      example: "0.0",
      description: "The percentage of the sky covered with high-altitude clouds (6300m and above) during the period."
    },
    conditionCode: {
      example: '"Clear"',
      description: "Weather conditions at the given time, one of: BlowingDust, Clear, MostlyClear, PartlyCloudy, MostlyCloudy, Cloudy, Foggy, Haze, Smoky, Breezy, Windy, Drizzle, Rain, HeavyRain, IsolatedThunderstorms, ScatteredThunderstorms, Thunderstorms, StrongStorms, SunShowers, Frigid, Hail, Hot, Flurries, Sleet, Snow, SunFlurries, WintryMix, Blizzard, BlowingSnow, FreezingDrizzle, FreezingRain, HeavySnow, Hurricane, TroicalStorm"
    },
    daylight: {
      example: "true",
      description: "Is there daylight at this time?"
    },
    humidity: {
      example: "0.0",
      description: "Relative humidity as a percentage of the total water vapor the air can hold at this temperature."
    },
    precipitationIntensity: {
      example: "0.0",
      description: "Precipitation intensity measured in millimeters per hour"
    },
    pressure: {
      example: "1,013.25",
      description: "The sea level air pressure, in millibars."
    },
    pressureTrend: {
      example: '"rising"',
      description: "A string indicating the sea level air pressure trend during this period."
    },
    temperature: {
      example: "22.7",
      description: "Temperature in degrees Celsius during this period."
    },
    temperatureApparent: {
      example: "38.5...",
      description: "The feels-like temperature when factoring wind and humidity, in degrees Celsius during this period."
    },
    temperatureDewPoint: {
      example: "26.3",
      description: "The temperature at which relative humidity is 100%, in degrees Celsius during this period."
    },
    uvIndex: {
      example: "5",
      description: "The level of ultraviolet radiation during this period."
    },
    visibility: {
      example: "28520.77",
      description: "The distance at which terrain is visible, in meters. Under 1,000 is considered \"low visibilty\""
    },
    windDirection: {
      example: "0",
      description: "The direction of the wind, in degrees. 0: north, 90: east, 180: south, 270: west"
    },
    windGust: {
      example: "0.0",
      description: "The maximum wind gust speed, in kilometers per hour."
    },
    windSpeed: {
      example: "0.0",
      description: "The wind speed, in kilometers per hour."
    },
    precipitationChance: {
      example: "0.0",
      description: "The probability of precipitation during this minute."
    },
    precipitationAmount: {
      example: "0.0",
      description: "The amount of precipitation forecasted to occur during period, in millimeters."
    },
    precipitationType: {
      example: '"rain"',
      description: "The type of precipitation forecasted to occur during the period, one of: clear, precipitation, rain, snow, sleet, hail, mixed"
    },
    snowfallIntensity: {
      example: "0.0",
      description: "The rate at which snow crystals are falling, in millimeters per hour."
    },
    snowfallAmount: {
      example: "0.0",
      description: "The depth of snow as ice crystals forecasted to occur during the period, in millimeters."
    },
    maxUvIndex: {
      example: "0",
      description: "The maximum ultraviolet index value during the day."
    },
    moonPhase: {
      example: '"firstQuarter"',
      description: "The phase of the moon on the specified day, one of: new, waxingCrescent, firstQuarter, waxingGibbous, full, waningGibbous, thirdQuarter, or waningCrescent."
    },
    moonrise: {
      example: "2000-01-01T00:00:00Z",
      description: "The time of moonrise on the specified day."
    },
    moonset: {
      example: "2000-01-01T00:00:00Z",
      description: "The time of moonset on the specified day."
    },
    solarMidnight: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is lowest in the sky."
    },
    solarNoon: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is highest in the sky."
    },
    sunrise: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the top edge of the sun reaches the horizon in the morning."
    },
    sunriseCivil: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 6 degrees below the horizon in the morning."
    },
    sunriseNautical: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 12 degrees below the horizon in the morning."
    },
    sunriseAstronomical: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 18 degrees below the horizon in the morning."
    },
    sunset: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the top edge of the sun reaches the horizon in the evening."
    },
    sunsetCivil: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 6 degrees below the horizon in the evening."
    },
    sunsetNautical: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 12 degrees below the horizon in the evening."
    },
    sunsetAstronomical: {
      example: "2000-01-01T00:00:00Z",
      description: "The time when the sun is 18 degrees below the horizon in the evening."
    },
    temperatureMax: {
      example: "33.2",
      description: "The maximum temperature forecasted to occur during the day, in degrees Celsius."
    },
    temperatureMin: {
      example: "24.8",
      description: "The minimum temperature forecasted to occur during the day, in degrees Celsius."
    },
    windGustSpeedMax: {
      example: "0.0",
      description: "The maximum speed wind is expected to gust to over the period, in kilometers per hour."
    },
    windSpeedAvg: {
      example: "0.0",
      description: "The average expected wind speed over the period, in kilometers per hour."
    },
    windSpeedMax: {
      example: "0.0",
      description: "The maximum expected wind speed over the period, in kilometers per hour."
    },
  }
}
