/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'text_template',
  bytecodeKey: "textTemplate",
  name: "Text Template",
  colour: 180,
  inputsInline: true,
  description: `
    Create dynamic, personalized messages by combining static text with live data from your IoT system. <span v-pre>Perfect for intelligent notifications like "Hello {{ user.name }}, your temperature sensor read {{ feeds['sensors.temperature'].value }}°F" or automated reports that include current sensor values, user information, and real-time data. Uses the powerful Liquid templating language for advanced formatting and logic.</span>
    
    ::: v-pre
    ## What is a Text Template?
    
    Think of a text template like a form letter where you leave blanks to fill in with specific information. Instead of writing "Dear _____", you write "Dear {{ user.name }}" and the system automatically fills in the actual name when the message is sent.
    
    ## How It Works
    
    This block renders (processes) a text template, replacing special placeholders with actual values.
    Anything surrounded by {{ double curly braces }} gets replaced with real data when your action runs.
    
    For example:
    - Template: "Hello {{ user.name }}!"
    - Becomes: "Hello John!"
    
    These templates use the Liquid templating language from Shopify, which includes many helpful built-in functions.
    Learn more: [Liquid Documentation](https://shopify.github.io/liquid/basics/introduction/)
    
    ## Template Variables Reference
    
    ### User Information
    - \`{{ user.name }}\` - Your full name (e.g., "John Smith")
    - \`{{ user.username }}\` - Your username (e.g., "jsmith123")
    
    ### Custom Variables
    - \`{{ variables.var_name }}\` - Get value of variable named 'var_name'
    - \`{{ vars.var_name }}\` - Shorthand version (same as above)
    - \`{{ variables['var name'] }}\` - Use brackets for names with spaces
    - \`{{ vars['my special var'] }}\` - Shorthand with spaces
    
    ### Feed Data (Sensors & Devices)
    - \`{{ feeds['group_key.feed_key'].value }}\` - Current value from a feed
    - \`{{ feeds['group_key.feed_key'].name }}\` - Feed's display name
    - \`{{ feeds['group_key.feed_key'].key }}\` - Feed's unique key
    - \`{{ feeds['group_key.feed_key'].updated_at }}\` - Last update timestamp
    
    ## Real-World IoT Examples
    
    ### 🌡️ Temperature Alerts
    **Basic Alert:**
    \`"Temperature Alert: {{ feeds['sensors.temp'].value }}°F detected!"\`
    Output: "Temperature Alert: 85°F detected!"
    
    **Detailed Alert with Location:**
    \`"⚠️ HIGH TEMP WARNING
    Location: {{ feeds['sensors.temp'].name }}
    Current: {{ feeds['sensors.temp'].value }}°F
    Time: {{ feeds['sensors.temp'].updated_at }}
    Please check your {{ vars.device_location }} immediately!"\`
    
    ### 📊 Daily Status Reports
    **Simple Report:**
    \`"Daily Report for {{ user.name }}:
    • Temperature: {{ feeds['home.temp'].value }}°F
    • Humidity: {{ feeds['home.humidity'].value }}%
    • Battery: {{ vars.battery_level }}%"\`
    
    **Comprehensive Home Report:**
    \`"Good morning {{ user.name }}! Here's your home status:
    
    🌡️ Climate Control:
    - Living Room: {{ feeds['climate.living_temp'].value }}°F
    - Bedroom: {{ feeds['climate.bedroom_temp'].value }}°F
    - Humidity: {{ feeds['climate.humidity'].value }}%
    
    🔋 Device Status:
    - Door Sensor Battery: {{ feeds['security.door_battery'].value }}%
    - Motion Detector: {{ vars.motion_status }}
    - Last Activity: {{ feeds['security.last_motion'].updated_at }}
    
    Have a great day!"\`
    
    ### 🚪 Security Notifications
    **Door Alert:**
    \`"🚪 {{ feeds['security.front_door'].name }} is {{ feeds['security.front_door'].value }} 
    Time: {{ feeds['security.front_door'].updated_at }}
    User: {{ user.name }}"\`
    
    ### 🌱 Garden Monitoring
    **Watering Reminder:**
    \`"Hey {{ user.name }}, your {{ vars.plant_name }} needs attention!
    Soil Moisture: {{ feeds['garden.moisture'].value }}%
    Last Watered: {{ vars.last_water_date }}
    Recommendation: Water {{ vars.water_amount }}ml"\`
    
    ### 🔔 Smart Doorbell Messages
    **Visitor Notification:**
    \`"{{ user.name }}, someone is at your door!
    Camera: {{ feeds['doorbell.camera'].name }}
    Motion Level: {{ feeds['doorbell.motion'].value }}
    Time: {{ feeds['doorbell.motion'].updated_at }}"\`
    
    ## Advanced Liquid Features
    
    ### Conditional Logic
    Use if/else statements for smart messages:
    \`"{% if feeds['sensors.temp'].value > 80 %}
      🔥 It's hot! {{ feeds['sensors.temp'].value }}°F
    {% else %}
      ❄️ Nice and cool: {{ feeds['sensors.temp'].value }}°F
    {% endif %}"\`
    
    ### Formatting Numbers
    Round numbers or add decimal places:
    \`"Temperature: {{ feeds['sensors.temp'].value | round: 1 }}°F"
    "Battery: {{ vars.battery | round }}%"\`
    
    ### Date Formatting
    Format timestamps for readability:
    \`"Last updated: {{ feeds['sensor.temp'].updated_at | date: '%B %d at %I:%M %p' }}"\`
    Output: "Last updated: January 15 at 03:45 PM"
    
    ### Math Operations
    Perform calculations in templates:
    \`"Temperature in Celsius: {{ feeds['sensors.temp'].value | minus: 32 | times: 5 | divided_by: 9 | round: 1 }}°C"\`
    
    ## Common Patterns & Tips
    
    ### 1. Fallback Values
    Provide defaults when data might be missing:
    \`"Temperature: {{ feeds['sensors.temp'].value | default: 'No reading' }}"\`
    
    ### 2. Multiple Feed Access
    Combine data from multiple sources:
    \`"Indoor: {{ feeds['home.inside_temp'].value }}°F
    Outdoor: {{ feeds['home.outside_temp'].value }}°F
    Difference: {{ feeds['home.inside_temp'].value | minus: feeds['home.outside_temp'].value }}°F"\`
    
    ### 3. Status Indicators
    Use emoji based on values (keep in mind emoji will not work with displays):
    \`"Battery: {{ vars.battery_level }}% 
    {% if vars.battery_level < 20 %}🔴{% elsif vars.battery_level < 50 %}🟡{% else %}🟢{% endif %}"\`
    
    ### 4. Time-Based Greetings
    \`"{% assign hour = 'now' | date: '%H' | plus: 0 %}
    {% if hour < 12 %}Good morning{% elsif hour < 17 %}Good afternoon{% else %}Good evening{% endif %}, {{ user.name }}!"\`
    
    ## Troubleshooting Common Issues
    
    ### Problem: Variable shows as blank
    **Solution:** Check that:
    - Variable name is spelled correctly (case-sensitive!)
    - Feed key matches exactly (including group.feed format)
    - Variable has been set before this template runs
    
    ### Problem: Template shows raw {{ }} text
    **Solution:** Make sure:
    - You're using double curly braces {{ }}
    - No extra spaces inside braces
    - Feed keys use square brackets and quotes: feeds['key']
    
    ### Problem: Timestamp looks weird
    **Solution:** Format dates using Liquid filters:
    \`{{ feeds['sensor'].updated_at | date: '%Y-%m-%d %H:%M' }}\`
    
    ## Best Practices
    
    1. **Keep it readable**: Use line breaks and spacing for multi-line messages
    2. **Test with sample data**: Try your template with different values
    3. **Use meaningful variable names**: 'kitchen_temp' is better than 'temp1'
    4. **Add context**: Include units (°F, %, etc.) and location names
    :::
  `,
  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },
  template: "{{ %TEMPLATE",
  inputs: {
    TEMPLATE: {
      description: `
        ::: v-pre
        Create your template text with static content and dynamic {{ variable }} placeholders.

        Examples:
        - 'Alert: {{ feeds['temp.kitchen'].value }}°F detected'
        - 'Daily Report for {{ user.name }}: Battery at {{ vars.battery_level }}%'

        Use {{ }} to insert live data into your message.
        :::
      `,
      check: "expression",
      shadow: 'io_text_multiline'
    }
  },
  generators: {
    json: (block, generator) => {
      const
        template = generator.valueToCode(block, 'TEMPLATE', 0) || null,
        blockPayload = JSON.stringify({
          textTemplate: {
            template: JSON.parse(template)
          },
        })
      return [ blockPayload, 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { template } = blockObject.textTemplate,
        inputs = {
          TEMPLATE: helpers.expressionToBlock(template, { shadow: "io_text" })
        }
      return { type: 'text_template', inputs }
    }
  }
}
