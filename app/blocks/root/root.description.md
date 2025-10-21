The Root block is the foundation of every Adafruit IO Action. Connect Triggers (like 'when temperature > 80°F' or 'every morning at 8 AM') to define when your Action runs, then attach Action blocks (like 'send email', 'publish to feed', or 'if/then logic') to define what happens when triggered.

## Configuration

<div class="config-icon">⚙️</div>

The Root block has special configuration settings that control how your action's triggers behave. You can access these by clicking the gear icon on the block.

### `Delay Setting`

The [Delay Setting](/blocks/uncategorized/delay_settings) adds a cooldown period after a trigger fires, before the Actions are executed, preventing the action from running too frequently. This is useful for rate-limiting notifications or avoiding noisy data that might cause rapid re-triggers.

<img src="/actions-docs/block_images/delay_settings.png">

As well as setting the duration, there are two delay modes:

-   **Reset (Extend Delay)**: _"deletes the existing delay and start a new one"_

    Each time a trigger condition is met during the cooldown period, the delay timer is reset. The action will only run after the trigger condition has remained true for the entire duration of the delay.
    -   *Example*: If you have a 5-minute delay for a "temperature > 80°F" trigger, and the temperature keeps fluctuating above 80°F every minute, the action will *not* run until the temperature stays below 80°F for a full 5 minutes.

-   **Keep (Ignore)**: _"keeps the existing delay and ignore new triggers"_

    The action runs the very first time the trigger condition is met, after the delay period. It ignores all subsequent trigger events until the delay period has passed and actions executed.
    -   *Example*: With a 5-minute delay, the action runs immediately when the temperature first goes above 80°F. It will ignore any change in trigger conditions, regardless of what the temperature does during that time.