# Plan: Add Time Extraction & Conversion Blocks with Timezone Support

Create three new blocks: **Extract Time Segment**, **Extract Date Segment**, and **Convert Seconds to DateTime**. Each has a settings cog mutator for timezone configuration. Timezone option blocks are shared, but mutators differ based on whether they need one or two timezone slots.

Similar pattern to the `json_path_query.js` block for extraction logic, and `action_settings/mutator.js` for the settings cog pattern.

## Context

- The existing `time.js` block outputs timezone-less seconds (effectively just date and timezoneless in seconds)
- Docs are auto-generated, no need to create documentation manually
- Use Playwright to test after building with `npm run start`

## Steps

### 1. Create shared timezone option blocks in `app/blocks/utility/timezone/`

- `tz_io_account.js` - "IO Account Timezone" (default for user-derived values, e.g., user's account is Europe/London so it auto adjusts)
- `tz_io_server.js` - "IO Server Time (EST)" (default for feeds `updated_at` property and other template-related properties)
- `tz_preset.js` - Dropdown with preset timezones: UTC, Europe/London, America/New_York, America/Los_Angeles (PDT)
- `tz_location_coords.js` - "Location: Lat:<input value for latitude>, Long:<input for longitude>"
- `tz_fixed_offset.js` - "Fixed UTC Offset <+/-><hours>:<minutes>"
- All output type `timezone` for connection compatibility

### 2. Create Extract Time Segment block

Location: `app/blocks/utility/extract_time_segment.js`

- Clock/watch + scissors symbol/glyph/image icon
- Similar to the `json_path_query.js` block but for extracting time segments
- `SEGMENT` dropdown (Hour/Minute/Second)
- `TIME` input (accepts time in seconds)
- Create `extract_time_segment/mutator.js` with **single timezone slot** (input timezone only)
- Settings cog (mutator) allows optional timezone setting for the passed-in value

### 3. Create Extract Date Segment block

Location: `app/blocks/utility/extract_date_segment.js`

- Calendar + scissors icon
- `SEGMENT` dropdown (Year/Month/Day/Day of Week)
- `DATE` input (accepts seconds)
- Create `extract_date_segment/mutator.js` with **single timezone slot** (input timezone only)

### 4. Create Convert Seconds to DateTime block

Location: `app/blocks/utility/convert_seconds_datetime.js`

- Clock + arrows icon
- `SECONDS` input (int) with input timezone setting block
- Create `convert_seconds_datetime/mutator.js` with **dual timezone slots** (input timezone + output timezone)
- Outputs the same int passed through datetime conversion based on input and output timezones in the mutator

### 5. Create DateTime block

Location: `app/blocks/utility/datetime.js`

- Calendar + clock icon
- `DAY` field (1-31 dropdown)
- `MONTH` field (1-12 dropdown or month names)
- `YEAR` field (number input or dropdown of reasonable years)
- `TIME` input (prepopulated with `io_utility_time` block as shadow)
- Creates a datetime value by adding the time to the date at midnight in the correct timezone
- Create `datetime/mutator.js` with **single timezone slot** (timezone for the date/time calculation)
- Outputs seconds representing the full datetime

### 6. Update Current Time block

Location: `app/blocks/utility/current_time.js`

- Add optional settings cog mutator with **single timezone slot** (output timezone)
- Default: IO Account Timezone
- Allows picking another option from default of user timezone

### 7. Register all blocks in toolbox

Update `app/toolbox/time.js` contents array:
- `io_utility_extract_time_segment`
- `io_utility_extract_date_segment`
- `io_utility_convert_seconds_datetime`
- `io_utility_datetime`

## Considerations

1. **Mutator flyout blocks** - Each mutator needs a container block (`timezone_settings.js` for single, `timezone_conversion_settings.js` for dual). These can be shared since the timezone option blocks inside the mutators are shared, but some mutators have two (input + output) timezones needed, and others just one.

2. **Icon SVGs** - Generate base64-encoded clock+scissors, calendar+scissors, and clock+arrows SVGs during implementation.

3. **Auto Timezone Option** - Blocks with time-related inputs should have an "Auto" timezone option that inherits the timezone from the connected child input block. If the child block doesn't specify a timezone, fall back to user's IO Account timezone. This allows seamless chaining of time blocks without manual timezone configuration at each step.

4. **Simple Time Comparisons (Current Time + Time blocks)** - The `time.js` and `current_time.js` blocks are designed for simple time-of-day comparisons like "is it after 5:30?" or "is current time between 9:00 and 17:00?". These blocks work in the user's local timezone context by default. See Justin's POC docs for confirmed use cases. The time block outputs seconds-since-midnight for easy numeric comparison.

## Implementation Status

### Completed ✅

- [x] Timezone option blocks (`tz_io_account`, `tz_utc`, `tz_device`, `tz_preset`, `tz_fixed_offset`)
- [x] Extract Time Segment block with timezone mutator
- [x] Extract Date Segment block with timezone mutator  
- [x] DateTime block with timezone mutator
- [x] Current Time block with timezone mutator
- [x] DateTime to Text block with timezone + format mutator
- [x] Text to DateTime block with timezone + format mutator
- [x] Format option blocks (`fmt_iso8601`, `fmt_rfc2822`, `fmt_unix`, `fmt_preset`, `fmt_custom`)
- [x] Duration block with timezone mutator (seconds/minutes/hours/days/weeks/months/years)
- [x] All blocks registered in Time toolbox
- [x] Block images generated
- [x] Comprehensive tests including historical dates (Battle of Hastings, Millennium, Y2038, 2050, 2070)

### Remaining 🔲

- [ ] Add "Convert Seconds to DateTime block" with **dual timezone slots** (input + output), or just use parse block with unit time.
- [ ] `tz_io_server.js` - "IO Server Time (EST)" option
- [ ] `tz_location_coords.js` - Location-based timezone from coordinates
- [ ] Auto timezone inheritance from child blocks
- [ ] Icon SVGs for blocks (currently using default icons)
- [ ] Consider merging the two extract blocks into one with combined time+date segment dropdown (Hour, Minute, Second, Year, Month, Day, Day of Week, Week Number)
- [ ] Confirm Duration block works with weather block timestamps e.g. `Sunset - Duration(2 hours)`
- [ ] Extend "DateTime block" to also allow Day = -1 for last day of month (end of list, called "Last Day of Month (-1)")
- [x] Feed property block added (`feed_get_property`) - extracts current_value, previous_value, key, name, description, updated_at, created_at, unit_type, unit_symbol, status, visibility, license
- [ ] Future work - Try to ensure all timestamps are UTC/usertime.
