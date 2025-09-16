Compare two text values using different comparison operations. Perfect for conditional logic, filtering data, validating user input, or creating smart automation rules based on text content matching, differences, or substring detection.

## What is Text Compare?

The Text Compare block evaluates two text inputs using a specified comparison operator and returns true or false. This enables you to build conditional logic based on text content, whether checking for exact matches, detecting differences, or finding substrings within larger text.

## How It Works

The block performs three types of text comparison operations:
- **Equals (=)** - Exact match comparison (case-sensitive)
- **Not Equals (≠)** - Different text detection
- **Includes** - Substring detection within text

## Comparison Operators

### Equals (=) - Exact Match
Returns true when both text values are exactly the same, including case sensitivity.

::: warning Case Sensitivity Alert
Text comparison is case-sensitive! "Hello" is NOT equal to "hello"
:::

**Examples:**
- "hello" = "hello" → **true**
- "Hello" = "hello" → **false** (case-sensitive)
- "test123" = "test123" → **true**
- "  test  " = "test" → **false** (whitespace matters)

**Common Uses:**
- ✅ Check device status: `device_status = "online"`
- ✅ Validate user role: `user_role = "admin"`
- ✅ Confirm completion: `task_status = "completed"`

### Not Equals (≠) - Different Values
Returns true when text values are different in any way.

**Examples:**
- "hello" ≠ "world" → **true**
- "same" ≠ "same" → **false**
- "Test" ≠ "test" → **true** (case-sensitive)

**Common Uses:**
- ⚠️ Detect changes: `current_status ≠ previous_status`
- 🚫 Block guest users: `username ≠ "guest"`
- 📝 Validate required fields: `input_field ≠ ""`

### Includes - Substring Detection
Returns true when the left text contains the right text as a substring.

::: tip Perfect for Keyword Searching
Use includes to search for keywords within longer text like error messages, logs, or user input
:::

**Examples:**
- "hello world" includes "world" → **true**
- "temperature alert" includes "temp" → **true**
- "test" includes "testing" → **false** (left must contain right)

**Common Uses:**
- 🔍 Find errors: `error_log includes "timeout"`
- 📧 Email filtering: `email_address includes "@company.com"`
- 🎯 Command parsing: `voice_command includes "lights"`

## Practical Examples

::: details 🏠 Smart Home Examples

### Door & Security
~~~javascript
// Check if door is locked
door_status = "locked" → Turn off porch light

// Alert if door left open
door_status ≠ "closed" → Send notification

// Security monitoring
security_log includes "breach" → Trigger alarm
~~~

### Temperature & Climate
~~~javascript
// AC control
room_temp = "hot" → Turn on air conditioning

// Sensor errors
temp_reading includes "error" → Send maintenance alert

// Room occupancy
bedroom_status ≠ "occupied" → Reduce heating
~~~

:::

::: details 🔧 System Monitoring Examples

### Error Detection
~~~javascript
// System health
system_status ≠ "healthy" → Send alert
error_message includes "critical" → Immediate notification

// Performance monitoring
response_time includes "slow" → Log performance issue
~~~

### Device Management
~~~javascript
// Connectivity checks
device_ping ≠ "success" → Mark device offline
connection_type = "ethernet" → Use high-speed settings

// Battery monitoring
battery_level includes "low" → Send low battery warning
~~~

:::

## Common Issues & Solutions

::: details 🔤 Case Sensitivity Problems

::: danger Most Common Issue
"Online" ≠ "online" - Case matters in all comparisons!
:::

::: details ⚠️ Whitespace Issues

**Hidden spaces cause comparison failures:**

| What You See | Actual Value | Result |
|--------------|--------------|--------|
| "active" | "active " | Won't match "active" |
| "online" | " online" | Won't match "online" |

**Solutions:**
- Be aware extra spaces break matches
- Check for leading/trailing spaces in your data
- Clean data at the source when possible

:::

::: details 🔢 Text vs Numbers

::: warning Important
This block compares TEXT, not numbers! "10" vs "9" gives unexpected results
:::

## Quick Reference

### When to Use Each Operator
| Operator | Use When | Example |
|----------|----------|---------|
| **Equals (=)** | Need exact match | `status = "online"` |
| **Not Equals (≠)** | Need to detect difference | `role ≠ "guest"` |
| **Includes** | Search within text | `message includes "error"` |

### Related Blocks
- **Number Compare** - For numeric comparisons (>, <, >=, <=)
- **Logic AND/OR** - Combine multiple text comparisons
- **IF/Then** - Use comparison results to control flow
