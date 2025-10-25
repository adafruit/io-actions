import AirQuality from './air_quality.js'
import Feeds from './feeds.js'
import Logic from './logic.js'
import Math from './math.js'
import Notifications from './notifications.js'
import Weather from './weather.js'
import Text from './text.js'
import Triggers from './triggers.js'
import Utility from './utility.js'
import Advanced from './advanced.js'
import Variables from './variables.js'

// specify toolbox categories in the order we wish them to appear
export default [
  Triggers,
  { kind: 'sep' },
  Logic,
  Math,
  Text,
  Variables,
  Feeds,
  Notifications,
  Weather,
  AirQuality,
  Utility,
  Advanced
]
