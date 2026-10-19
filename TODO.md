# TODO

look in `scripts/hacks.js` and extract things into proper tool affordances

## agents.md

- give agents overall context for this projects (app vs src)
- provide skills for working with individual tools (blocks, fields, themes, images, etc)

## app/images

- drop images in here
  - png
  - svg
- reference by name elsewhere
- tools build the images into the export as appropriate:
  - convert to datauri
  - write into or reference in:
    - CSS
    - block definitions
    - theming objects

## app/colors

- specify named colors
- specify variants
- use color transforms
- arbitrary js, imports, etc

## app/theme/theme_name/

has blockly theming affordances:

- ConstantProviders
- Blockly.Theme configs
- custom CSS chunks

can refer to:

- images
- colors
- fonts

tools build blockly theme objects

ability to swap between themes at runtime

## app/fields

Custom Field Definitions

- extend existing fields
- update field registry (add/remove/overwrite)
- reference from Block Definitions

## app/toolbox

- icons
- themes
- css hooks

## Events

Would be good to wrap events in a nice interface, as well.

Blockly events are bad, as written. You can attach listeners to the workspace or to blocks, but they fire on every workspace event and you have to filter out all the ones you don't care about:

```js
block.addChangeListener(function({ blockId, type, name, element, newValue, oldValue }) {
  if(!blockId || type !== "change" || workspace.getBlockById(blockId).type !== "weather" || element !== "field" || name !== "POWER_UP_ID") {
    return
  }

  // ...now do the work you care about

})
````

Would be nice to specify some of that at registration and have be handled automatically:
```js
listenFor({
  type: "change",
  block: [aBlock, "block-type", blockFunc(block)]
})
````

Then we can do the filtering efficiently, in one spot, with tests, and expose a nice interface, or layers of interfaces (kitchen sink/low-level vs porcelain/higher-order-functions)
