/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_text_join',
  bytecodeKey: "textJoin",
  name: "Join Text",
  colour: 180,
  inputsInline: true,
  description: `
    Join two pieces of text into one combined string. Perfect for building dynamic messages, creating formatted outputs, or combining data from different sources into readable text.
    
    ## What is Join Text?
    
    Think of Join Text like using a plus sign (+) to glue two pieces of text together. Just like "Hello" + "World" becomes "HelloWorld", this block combines any two text values into one.
    
    ## How It Works
    
    ::: info
    **Input A** + **Input B** → **Combined Output**
    
    Example: \`"Hello "\` + \`"World"\` → \`"Hello World"\`
    :::
    
    The Join Text block takes two inputs (A and B) and combines them into a single text output:
    - **Input A**: First piece of text
    - **Input B**: Second piece of text  
    - **Output**: A + B (combined text)
    
    ::: warning Important!
    The texts are joined directly with **no space** between them. If you want a space, you need to add it yourself!
    :::
    
    ## Basic Examples
    
    ### Simple Text Joining
    
    | Input A | Input B | Output |
    |---------|---------|--------|
    | \`"Hello"\` | \`"World"\` | \`"HelloWorld"\` |
    | \`"Hello "\` | \`"World"\` | \`"Hello World"\` |
    | \`"Temperature: "\` | \`"72°F"\` | \`"Temperature: 72°F"\` |
    
    ### Adding Spaces and Punctuation
    
    | Input A | Input B | Output |
    |---------|---------|--------|
    | \`"Good"\` | \`" morning!"\` | \`"Good morning!"\` |
    | \`"Status:"\` | \`" Active"\` | \`"Status: Active"\` |
    | \`"User"\` | \`"#1234"\` | \`"User#1234"\` |
    
    ## IoT Use Cases
    
    ### 🏷️ Creating Labels with Values
    
    **Temperature Label:**
    \`\`\`js
    A: "Kitchen Temp: "
    B: {{ feeds['sensors.kitchen_temp'].value }}
    // Output: "Kitchen Temp: 72.5"
    \`\`\`
    
    **Device Status:**
    \`\`\`js
    A: "Door is "
    B: {{ feeds['security.door'].value }}
    // Output: "Door is OPEN" or "Door is CLOSED"
    \`\`\`
    
    ### 📊 Building Status Messages
    
    **Battery Level:**
    \`\`\`js
    A: "Battery at "
    B: {{ vars.battery_percent }}%
    // Output: "Battery at 85%"
    \`\`\`
    
    **Sensor with Units:**
    \`\`\`js
    A: {{ feeds['sensors.humidity'].value }}
    B: "% humidity"
    // Output: "65% humidity"
    \`\`\`
    
    ### 👤 Personalizing Messages
    
    **Welcome Message:**
    \`\`\`js
    A: "Welcome back, "
    B: {{ user.name }}
    // Output: "Welcome back, John Smith"
    \`\`\`
    
    **Custom Greeting:**
    \`\`\`js
    A: {{ vars.greeting }}
    B: {{ user.username }}
    // Output: "Hello, jsmith123"
    \`\`\`
    
    ### 🔗 Creating URLs and Paths
    
    ::: code-group

    \`\`\`js [API Endpoint]
    A: "https://api.example.com/sensors/"
    B: {{ vars.sensor_id }}
    // Output: "https://api.example.com/sensors/temp_01"
    \`\`\`
    
    \`\`\`js [File Path]
    A: "/data/"
    B: {{ vars.filename }}
    // Output: "/data/readings_2024.csv"
    \`\`\`
    
    :::
    
    ### 🎨 Formatting with Symbols
    
    \`\`\`js
    // Arrow Indicators
    A: "Temperature "
    B: "↑ Rising"
    // Output: "Temperature ↑ Rising"
    
    // Status Icons
    A: "🔋 "
    B: {{ vars.battery_status }}
    // Output: "🔋 Charging" or "🔋 Full"
    \`\`\`
    
    ## Advanced Patterns
    
    ::: details Chaining Multiple Join Blocks
    Sometimes you need to combine more than two pieces of text. Use multiple Join Text blocks:
    
    **Three-Part Message:**
    \`\`\`js
    // First Join
    A: "Hello, "
    B: {{ user.name }}
    // Result: "Hello, John"
    
    // Second Join (using first result)
    A: [First Join Output]
    B: "! Welcome back."
    // Final Output: "Hello, John! Welcome back."
    \`\`\`
    :::
    
    ::: details Building Complex Messages
    **Multi-Line Status Report (using \\n for line breaks):**
    \`\`\`js
    // First Join
    A: "System Status\\n"
    B: "Temperature: OK\\n"
    
    // Second Join
    A: [First Join]
    B: "Humidity: OK\\n"
    
    // Third Join
    A: [Second Join]
    B: "Battery: Low"
    
    /* Output:
    System Status
    Temperature: OK
    Humidity: OK
    Battery: Low
    */
    \`\`\`
    :::
    
    ::: details Conditional Text Building
    Combine with logic blocks to build different messages:
    \`\`\`js
    A: "Sensor "
    B: [If temperature > 80 then "⚠️ HOT" else "✓ Normal"]
    // Output: "Sensor ⚠️ HOT" or "Sensor ✓ Normal"
    \`\`\`
    :::
    
    ## Common Patterns & Tips
    
    ::: details 1. Don't Forget Spaces!
    ::: danger Common Mistake
    Forgetting to add spaces is the #1 beginner error!
    
    **Wrong:** 
    \`\`\`js
    A: "Hello"
    B: "World"
    // Output: "HelloWorld" ❌
    \`\`\`
    
    **Right:**
    \`\`\`js
    A: "Hello "  // Space at the end
    B: "World"
    // Output: "Hello World" ✅
    \`\`\`
    
    **Also Right:**
    \`\`\`js
    A: "Hello"
    B: " World"  // Space at the beginning
    // Output: "Hello World" ✅
    \`\`\`
    :::
    
    ::: details 2. Adding Separators
    ::: v-pre

    | Separator | Input A | Input B | Output |
    |-----------|---------|---------|--------|
    | **Comma** | \`{{ vars.city }}\` | \`", USA"\` | \`"Boston, USA"\` |
    | **Dash** | \`{{ vars.date }}\` | \`" - Event"\` | \`"2024-01-15 - Event"\` |
    | **Colon** | \`"Error"\` | \`": Connection lost"\` | \`"Error: Connection lost"\` |
    :::
    
    ::: details 3. Building Lists
    \`\`\`js
    // Bullet Point
    A: "• "
    B: {{ vars.item_name }}
    // Output: "• Temperature Sensor"
    
    // Numbered
    A: "1. "
    B: {{ vars.first_step }}
    // Output: "1. Check connections"
    \`\`\`
    :::
    
    ::: details 4. Combining Numbers and Text
    When joining numbers with text, the number is automatically converted:
    \`\`\`js
    A: "Count: "
    B: {{ vars.sensor_count }}
    // Output: "Count: 5"
    
    A: {{ feeds['sensor'].value }}
    B: " degrees"
    // Output: "72.5 degrees"
    \`\`\`
    :::
    
    ::: details 5. Empty String Handling
    If one input is empty, you get just the other input:
    \`\`\`js
    A: "Hello"
    B: ""
    // Output: "Hello"
    
    A: ""
    B: "World"
    // Output: "World"
    \`\`\`
    :::
    
    ## Working with Other Blocks
    
    ::: details Join + Text Template
    Use Join Text to prepare strings for templates:
    \`\`\`js
    // Join to create feed key
    A: "sensor."
    B: {{ vars.location }}
    // Output: "sensor.kitchen"
    
    // Then use in template
    {{ feeds['[Join Output]'].value }}
    \`\`\`
    :::
    
    ::: details Join + Variables
    Store joined text in a variable for reuse:
    \`\`\`js
    // Join
    A: "Alert: "
    B: {{ vars.message }}
    
    // Store result in variable: "formatted_alert"
    // Use later in multiple places
    \`\`\`
    :::
    
    ::: details Join + Conditionals
    Build different messages based on conditions:
    \`\`\`js
    A: "Status: "
    B: [If block result]
    // Where If block returns "Online" or "Offline"
    // Output: "Status: Online" or "Status: Offline"
    \`\`\`
    :::
    
    ## Troubleshooting
    
    ::: details Problem: Text runs together without spaces
    **Solution:** Add a space at the end of the first text or beginning of the second text:
    - Change \`"Hello"\` to \`"Hello "\`
    - Or change \`"World"\` to \`" World"\`
    :::
    
    ::: details Problem: Getting [object Object] in output
    ::: v-pre
    **Solution:** Make sure you're passing text/string values, not complex objects. Use the .value or .name property of feeds:
    - Wrong: \`B: {{ feeds['sensor.temp'] }}\`
    - Right: \`B: {{ feeds['sensor.temp'].value }}\`
    :::
    
    ::: details Problem: Numbers not displaying correctly
    ::: v-pre
    **Solution:** Numbers are automatically converted to text. For formatting, use a Text Template block first:
    - Basic: \`A: "Price: $"  B: {{ vars.price }}\` → \`"Price: $9.99"\`
    - Formatted: Use template with \`{{ vars.price | round: 2 }}\` first
    :::
    
    ::: details Problem: Special characters not showing
    **Solution:** Use Unicode or HTML entities:
    - Degree symbol: Use \`"°"\` or \`"&deg;"\`
    - Line break: Use \`"\\n"\`
    - Tab: Use \`"\\t"\`
    :::
    
    ## Quick Reference
    
    ::: details Task Reference Table
    | Task | Input A | Input B | Output |
    |------|---------|---------|--------|
    | Add label | \`"Temp: "\` | \`"72°F"\` | \`"Temp: 72°F"\` |
    | Add units | \`"50"\` | \`"%"\` | \`"50%"\` |
    | Add prefix | \`"Error: "\` | \`message\` | \`"Error: [message]"\` |
    | Add suffix | \`filename\` | \`".txt"\` | \`"[filename].txt"\` |
    | Join names | \`first_name\` | \`last_name\` | \`"[first][last]"\` (no space!) |
    | With space | \`first_name + " "\` | \`last_name\` | \`"[first] [last]"\` |
    | Line break | \`"Line 1\\n"\` | \`"Line 2"\` | Two lines |
    | Build path | \`"/home/"\` | \`username\` | \`"/home/[username]"\` |
    :::
    
    ::: details When to Use Join Text vs Text Template
    **Use Join Text when:**
    - Combining exactly two pieces of text
    - Simple concatenation without complex formatting
    - Building URLs, paths, or IDs
    - Adding prefixes or suffixes
    
    **Use Text Template when:**
    - Combining more than two pieces of text
    - Need advanced formatting (dates, numbers)
    - Using conditional logic
    - Creating multi-line messages
    - Need more control over output format
    :::
  `,
  connections: {
    mode: "value",
    output: "expression",
  },
  template: "%A + %B",
  inputs: {
    A: {
      description: "The first string of text - this will appear first in the combined output. Can be static text like 'Hello' or dynamic data from feeds/variables. Don't forget to add a space at the end if you want separation from the second text!",
      check: "expression",
      shadow: "io_text"
    },
    B: {
      description: "The second string of text - this will appear immediately after the first text with no automatic spacing. Can be static text or dynamic values. Add a space at the beginning if you need separation from the first text.",
      check: "expression",
      shadow: "io_text"
    },
  },
  generators: {
    json: (block, generator) => {
      const
        leftExp = generator.valueToCode(block, 'A', 0) || null,
        rightExp = generator.valueToCode(block, 'B', 0) || null,
        blockPayload = JSON.stringify({
          textJoin: {
            left: JSON.parse(leftExp),
            right: JSON.parse(rightExp),
          },
        })
      return [ blockPayload, 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { left, right } = blockObject.textJoin,
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: "io_text" }),
          B: helpers.expressionToBlock(right, { shadow: "io_text" }),
        }
      return { type: 'io_text_join', inputs }
    }
  }
}
