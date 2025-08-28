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
      'aqi': 'AQI',
      'category_key': 'Category Key',
      'category_label': 'Category',
      'category_color': 'Category Color',
      'category_min': 'Category Min',
      'category_max': 'Category Max',
      'health_description': 'Health Description',
      'health_recommendation': 'Health Recommendation',
      'health_sensitive_groups': 'Sensitive Groups',
      'primary_pollutant': 'Primary Pollutant',
      'pm2_5': 'PM2.5',
      'pm10': 'PM10',
      'o3': 'Ozone (O3)',
      'no2': 'Nitrogen Dioxide (NO2)',
      'so2': 'Sulfur Dioxide (SO2)',
      'co': 'Carbon Monoxide (CO)',
      'reporting_area': 'Reporting Area'
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

  // a placeholder for the incoming preview data from live air quality requests
  currentAirQualityByLocation: {},

  CURRENT_PROPS: [
    'aqi',
    'category_key',
    'category_label',
    'category_color',
    'category_min',
    'category_max',
    'health_description',
    'health_recommendation',
    'health_sensitive_groups',
    'pm2_5',
    'pm10',
    'o3',
    'no2',
    'so2',
    'co',
    'primary_pollutant',
    'reporting_area',
    'state',
    'latitude',
    'longitude'
  ],

  DAILY_PROPS: [
    'aqi',
    'category_key',
    'category_label',
    'category_color',
    'category_min',
    'category_max',
    'health_description',
    'health_recommendation',
    'health_sensitive_groups',
    'primary_pollutant'
  ],

  HELP_TEXT_BY_PROP: {
    aqi: {
      example: "75",
      description: "Air Quality Index value. Ranges from 0-50 (good), 51-100 (moderate), 101-150 (unhealthy for sensitive groups), 151-200 (unhealthy), 201-300 (very unhealthy) and 301-500 (hazardous)."
    },
    category_key: {
      example: "moderate",
      description: "Category key for the air quality level (e.g., good, moderate, unhealthy_sensitive, unhealthy, very_unhealthy, hazardous)."
    },
    category_label: {
      example: "Moderate",
      description: "Human-readable category label for the air quality level."
    },
    category_color: {
      example: "#ffff00",
      description: "Hex color code representing the air quality category for visual display."
    },
    category_min: {
      example: "51",
      description: "Minimum AQI value for this air quality category."
    },
    category_max: {
      example: "100",
      description: "Maximum AQI value for this air quality category."
    },
    health_description: {
      example: "Air quality is acceptable...",
      description: "General health description for the current air quality conditions."
    },
    health_recommendation: {
      example: "Unusually sensitive people should consider...",
      description: "Health recommendations for the current air quality conditions."
    },
    health_sensitive_groups: {
      example: "Children, Older adults",
      description: "Groups of people who are more sensitive to the current air quality conditions."
    },
    primary_pollutant: {
      example: "pm2_5",
      description: "The primary pollutant contributing to the air quality index (e.g., pm2_5, pm10, o3, no2, so2, co)."
    },
    pm2_5: {
      example: "15.2",
      description: "Fine particulate matter with diameter smaller than 2.5 micrometers, measured in μg/m³. Major health concern for respiratory and cardiovascular systems."
    },
    pm10: {
      example: "23.1",
      description: "Particulate matter with diameter smaller than 10 micrometers, measured in μg/m³. Can cause respiratory irritation and reduced lung function."
    },
    o3: {
      example: "45.0",
      description: "Ground-level ozone concentration, measured in μg/m³. Can cause breathing problems, especially during physical activity outdoors."
    },
    no2: {
      example: "12.4",
      description: "Nitrogen dioxide concentration, measured in μg/m³. Can aggravate respiratory diseases and reduce lung function."
    },
    so2: {
      example: "3.1",
      description: "Sulfur dioxide concentration, measured in μg/m³. Can cause respiratory symptoms and worsen asthma and heart disease."
    },
    co: {
      example: "0.8",
      description: "Carbon monoxide concentration, measured in ppm. Reduces oxygen delivery to organs and tissues."
    },
    reporting_area: {
      example: "Boston",
      description: "The geographic area or city where this air quality data was measured."
    },
    state: {
      example: "MA",
      description: "The state or region abbreviation where this air quality measurement was taken."
    },
    latitude: {
      example: "42.3601",
      description: "Latitude coordinate of the monitoring station location."
    },
    longitude: {
      example: "-71.0589",
      description: "Longitude coordinate of the monitoring station location."
    }
  }
}