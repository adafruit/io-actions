// helpers for the air quality block
// simplifies juggling the air quality api properties by location and period
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

      } else if (name === "AIR_QUALITY_TIME") {
        // update available metrics when forecast changes
        this.refreshPropertyOptions({ timeKey: newValue })

      } else if (name === "AIR_QUALITY_PROPERTY") {
        // update help text when the metric changes
        this.updateHelpTextForAirQualityProperty({ propertyKey: newValue })
      }
    }
  },

  setEnabledByLocation: function() {
    // must have a location and a parent (copacetic with disableOrphans)
    if(this.getFieldValue("POWER_UP_ID") === "" || !this.getParent()) {
      this.disabled || this.setEnabled(false)
    } else {
      this.disabled && this.setEnabled(true)
    }
  },

  // helper to humanize camelCase and snake_case strings
  keyToLabel: function(key) {
    // Handle special cases first
    const specialCases = {
      'european_aqi': 'European AQI',
      'us_aqi': 'US AQI',
      'pm10': 'PM10',
      'pm2_5': 'PM2.5'
    }

    if (specialCases[key]) {
      return specialCases[key]
    }

    const label = key
      // replace underscores with spaces
      .replaceAll('_', '\u00A0')
      // capitalize the first letter of each word (handles both spaces and non-breaking spaces)
      .replace(/(^|[\s\u00A0])[a-z]/g, (match) => match.toUpperCase())

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
      forecast = timeKey || this.getFieldValue("AIR_QUALITY_TIME"),
      currentValue = this.currentAirQualityByLocation[locationId]?.[forecast]?.[key]

    // return a current value with "Now" label, if found
    if(currentValue !== undefined && currentValue !== null) {
      return `Now:\u00A0${currentValue}`
    }

    // use example value with "e.g." label otherwise
    const { example="unknown" } = this.keyToHelpObject(key)

    return `e.g.\u00A0${example}`
  },

  refreshPropertyOptions: function({ timeKey=null, locationKey=null }) {
    timeKey = timeKey || this.getFieldValue("AIR_QUALITY_TIME")

    if(!timeKey) {
      // If no timeKey is available, default to 'current'
      timeKey = 'current'
    }

    let optionKeys
    if(timeKey === 'current') {
      optionKeys = this.CURRENT_PROPS

    } else if(timeKey.match(/forecast_/)) {
      optionKeys = this.DAILY_PROPS

    } else {
      throw new Error(`[mixins.airQuality] timeKey not recognized: ${timeKey}`)
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
    this.replaceDropdownOptions("AIR_QUALITY_PROPERTY", propertyOptions)
    this.updateHelpTextForAirQualityProperty({ timeKey, locationKey })
  },

  updateHelpTextForAirQualityProperty: function({ propertyKey=null, timeKey=null, locationKey=null }) {
    const
      propertyField = this.getField("AIR_QUALITY_PROPERTY"),
      helpField = this.getField("AIR_QUALITY_PROPERTY_HELP")

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

  // a placeholder for the incoming preview data from live open-meteo requests
  currentAirQualityByLocation: {},

  CURRENT_PROPS: [
    'european_aqi',
    'us_aqi',
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
    'aerosol_optical_depth',
    'dust',
    'uv_index',
    'uv_index_clear_sky',
    'ammonia',
    'alder_pollen',
    'birch_pollen',
    'grass_pollen',
    'mugwort_pollen',
    'olive_pollen',
    'ragweed_pollen'
  ],

  DAILY_PROPS: [
    'european_aqi',
    'us_aqi',
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
    'aerosol_optical_depth',
    'dust',
    'uv_index',
    'uv_index_clear_sky',
    'ammonia',
    'alder_pollen',
    'birch_pollen',
    'grass_pollen',
    'mugwort_pollen',
    'olive_pollen',
    'ragweed_pollen'
  ],

  HELP_TEXT_BY_PROP: {
    european_aqi: {
      example: "25",
      description: "European Air Quality Index. Ranges from 0-20 (good), 20-40 (fair), 40-60 (moderate), 60-80 (poor), 80-100 (very poor) and exceeds 100 for extremely poor conditions."
    },
    us_aqi: {
      example: "45",
      description: "United States Air Quality Index. Ranges from 0-50 (good), 51-100 (moderate), 101-150 (unhealthy for sensitive groups), 151-200 (unhealthy), 201-300 (very unhealthy) and 301-500 (hazardous)."
    },
    pm10: {
      example: "15.2",
      description: "Particulate matter with diameter smaller than 10 µm (PM10) close to surface (10 meter above ground), measured in μg/m³."
    },
    pm2_5: {
      example: "8.7",
      description: "Particulate matter with diameter smaller than 2.5 µm (PM2.5) close to surface (10 meter above ground), measured in μg/m³."
    },
    carbon_monoxide: {
      example: "245.8",
      description: "Carbon monoxide (CO) concentration close to surface (10 meter above ground), measured in μg/m³."
    },
    nitrogen_dioxide: {
      example: "12.4",
      description: "Nitrogen dioxide (NO2) concentration close to surface (10 meter above ground), measured in μg/m³."
    },
    sulphur_dioxide: {
      example: "3.1",
      description: "Sulphur dioxide (SO2) concentration close to surface (10 meter above ground), measured in μg/m³."
    },
    ozone: {
      example: "98.5",
      description: "Ozone (O3) concentration close to surface (10 meter above ground), measured in μg/m³."
    },
    aerosol_optical_depth: {
      example: "0.15",
      description: "Aerosol optical depth at 550 nm of the entire atmosphere to indicate haze. Dimensionless value."
    },
    dust: {
      example: "2.3",
      description: "Saharan dust particles close to surface level (10 meter above ground), measured in μg/m³."
    },
    uv_index: {
      example: "6",
      description: "UV index considering clouds. See ECMWF UV Index recommendation for more information."
    },
    uv_index_clear_sky: {
      example: "8",
      description: "UV index for clear sky conditions (no clouds). See ECMWF UV Index recommendation for more information."
    },
    ammonia: {
      example: "1.8",
      description: "Ammonia (NH3) concentration close to surface (10 meter above ground), measured in μg/m³. Only available for Europe."
    },
    alder_pollen: {
      example: "12",
      description: "Alder pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    },
    birch_pollen: {
      example: "45",
      description: "Birch pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    },
    grass_pollen: {
      example: "78",
      description: "Grass pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    },
    mugwort_pollen: {
      example: "5",
      description: "Mugwort pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    },
    olive_pollen: {
      example: "23",
      description: "Olive pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    },
    ragweed_pollen: {
      example: "8",
      description: "Ragweed pollen concentration, measured in grains/m³. Only available in Europe during pollen season with 4 days forecast."
    }
  }
}
