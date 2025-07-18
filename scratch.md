# todo:
- purge legacy converters:
  - ...
- block generator
- type hints for definitions
- key warnings
- bailouts for:
  - blockly json
  - docs markdown


### Action Specification

```js
const actionSpecification = {
  // version of this JSON spec
  version: "1.0.0-beta.1",

  // job-level settings
  settings: {},

  // list of top-level expressions ("commands")
  expressions: [
    { conditional: {
      if: {
        compare: {
          left: { variable: "temperature" },
          comparator: ">=",
          right: 90
        }
      },
      then: { publish: {
        feed: { feed: "Feed:Thermostat" },
        value: 85
      }},
      else: {
        conditional: {
          if: {
            compare: {
              left: { variable: "temperature" },
              comparator: "<=",
              right: 70
            }
          },
          then: { publish: {
            feed: { feed: "Feed:Thermostat" },
            value: 75
          }}
        }
      }
    }}
  ]
}}
```


Validate/Parse/Save Routine
=============
- validate against json schema
  - catch broad issues of data well-formedness
- validate permissions on all referenced resources
  - catch hacking and data leaks
- validate IO account standing
  - no SMS without IO+!
- find all "triggerables":
  - feed references
  - temporal references (dates, times, durations, schedules)
  - power-up features
- hoist ids to a db column
  - model_references or something, ["Feed:12345", "PowerUp:54321"]
  - so those resources can query what actions reference them
- clear/register observers
  - cron schedules
  - feed hooks
  - power-up apis


Execution
=========
- initialize:
  - set up observers:
    - watchdog timer
    - expression constrainer
    - system monitor
    - stats reporter
    - run logger (to support live-view of running job, or later replay)
  - set up a variable context
    - hash/openstruct/w/e with controlled access (namespacing, security)
    - pre-fill with global data, feed values, power-up info, etc
- execute `expressions[]`
  - synchronously
    - later could be async via Threads, Fibers, or sidekiq jobs
  - **only** executes and notifies observers
    - use observers for all other desired behavior
- cleanup:
  - ask all observers to finalize/report
    - timestamps, completion statuses, logs, etc
  - job status updates
    - disable, error, etc as appropriate
- failure cleanup: expected errors the user might cause
  - show good error/log messages
  - help them fix their own problems
  - notify us as appropriate
- error cleanup:
  - includes unexpected errors that:
    - need to come to our attention
    - need to be hidden from the user but give good messaging
    - maybe provide the user a way to reference this issue to us
