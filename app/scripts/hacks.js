////////////////
// Visual Design
////////////////


////////////////
// IoConstantProvider / IoRenderer
// custom 'io_zelos' renderer: rounded
// fields; a softened rounded-hexagon connection shape for the schedule's
// cron_* sockets (see makeSoftHexagonal + shapeFor).
////////////////

// Custom renderer based on 'zelos' (rounded, contemporary block shapes, as used
// by MakeCode / Scratch) with slightly larger, gently-rounded input fields so
// dropdowns and text boxes read as comfortable rounded rectangles rather than
// squished pills or ovals.
const IO_RENDERER = 'io_zelos'
class IoConstantProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super()
    this.FIELD_BORDER_RECT_RADIUS = 5     // gently rounded field corners (zelos default: 4)
    this.FIELD_BORDER_RECT_X_PADDING = 12 // a little wider, so short text boxes aren't cramped (default: 8)
    // tighten the gap around inline value inputs so nested blocks (e.g. the
    // template->multiline wrappers in the notification bodies) sit flush
    this.EMPTY_INLINE_INPUT_PADDING = 6   // default: 16
  }

  init() {
    super.init()
    // Custom "rounded hexagon" connection shape for the schedule-settings sockets.
    this.SOFT_HEXAGONAL = this.makeSoftHexagonal()
  }

  // The renderer connection-shape code (makeSoftHexagonal) is the only non-trivial
  // geometry here and the best place to focus review - it must reuse a built-in
  // zelos shape `type` or rendering crashes (see the comment on that function).
  // A hexagon whose corners are all softened with small arcs — the tip AND the two
  // shoulders (where the flat top/bottom edges meet the diagonals) — so the chips
  // read as a distinct pointed shape without fighting the rounded language of every
  // other block. Same width/offsets as zelos' HEXAGONAL (so sockets snap
  // identically) — only the drawn path is softened.
  makeSoftHexagonal() {
    const maxW = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH
    const f = n => Number(n.toFixed(3))
    const width = d => { const x = d / 2; return x > maxW ? maxW : x }

    // A circular arc from the current point turning the tangent from t0 to t1,
    // radius r. Returns the relative end delta plus SVG sweep/large flags (all in
    // the SVG y-down frame, so it composes directly into a path string).
    const arc = (t0, t1, r) => {
      const cross = t0.x * t1.y - t0.y * t1.x
      const dot = t0.x * t1.x + t0.y * t1.y
      const phi = Math.atan2(cross, dot)            // signed turn angle
      const sgn = Math.sign(cross) || 1
      const cx = -t0.y * sgn * r, cy = t0.x * sgn * r   // centre, relative to start
      const c = Math.cos(phi), sn = Math.sin(phi)
      // end = centre + rot(phi)*(start - centre); start-centre = (-cx,-cy)
      const ex = cx + (-cx) * c - (-cy) * sn
      const ey = cy + (-cx) * sn + (-cy) * c
      return { dx: ex, dy: ey, r, sweep: phi > 0 ? 1 : 0, large: Math.abs(phi) > Math.PI ? 1 : 0 }
    }

    // Rounded point profile from (0,0) to (0, s*span): flat -> shoulder arc ->
    // diagonal -> tip arc -> diagonal -> shoulder arc -> flat. `dir` = tip x
    // direction, `up` flips vertical travel. The straight length `d` is solved so
    // the path lands exactly on (0, s*span) — the shape stays closed.
    const profile = (span, dir, up) => {
      const s = up ? -1 : 1
      const w = width(span), half = span / 2
      // Diagonal aims at the tip (dir*w, s*half) — NOT a fixed 45°. On tall blocks
      // `w` is capped (< half), so the diagonal is shallower; hard-coding 45° there
      // made the drawn tip deeper than the width the layout reserved, slicing into
      // the block's content. Use the true diagonal direction so path == reserved box.
      const L = Math.hypot(w, half) || 1
      const u1 = { x: dir * w / L, y: s * half / L }   // diagonal towards the tip
      const u2 = { x: -dir * w / L, y: s * half / L }  // diagonal away from the tip
      const rt = Math.max(2, Math.min(7, w * 0.5, half * 0.5))     // tip radius
      const rs = Math.max(2, Math.min(7.5, w * 0.55, half * 0.55)) // shoulder radius
      const hIn = { x: dir, y: 0 }, hOut = { x: -dir, y: 0 } // flat edges
      const a1 = arc(hIn, u1, rs)   // start shoulder
      const tp = arc(u1, u2, rt)    // tip
      const a3 = arc(u2, hOut, rs)  // end shoulder
      const sumDy = a1.dy + tp.dy + a3.dy
      const d = (s * span - sumDy) / (u1.y + u2.y)  // solve straight length for closure
      const aStr = a => `a ${f(a.r)} ${f(a.r)} 0 ${a.large} ${a.sweep} ${f(a.dx)},${f(a.dy)}`
      return ` ${aStr(a1)} l ${f(d * u1.x)},${f(d * u1.y)} ${aStr(tp)} l ${f(d * u2.x)},${f(d * u2.y)} ${aStr(a3)} `
    }
    return {
      // Reuse the HEXAGONAL type so zelos' layout tables (SHAPE_IN_SHAPE_PADDING,
      // negative-spacing) resolve — the drawn path below is what's actually
      // softened; geometry/width/offsets are identical to the built-in hexagon.
      type: this.SHAPES.HEXAGONAL,
      isDynamic: true,
      width,
      height: d => d,
      connectionOffsetY: d => d / 2,
      connectionOffsetX: d => -d,
      pathDown: d => profile(d, -1, false),
      pathUp: d => profile(d, -1, true),
      // zelos draws the right end-cap the same for up and down (matches HEXAGONAL)
      pathRightDown: d => profile(d, 1, false),
      pathRightUp: d => profile(d, 1, false),
    }
  }

  // Give the schedule-settings connections (cron_month/day/hour/minute) a distinct
  // pointed silhouette, so the Months/Days/Hours/Minutes slots read as "configure
  // via the cog" chips rather than generic droppable sockets. zelos already varies
  // connection shape by check (that's how booleans get a hexagon); we only special-
  // case the cron_* checks — every other block keeps its normal shape.
  shapeFor(connection) {
    let check = connection.getCheck()
    if(!check && connection.targetConnection) { check = connection.targetConnection.getCheck() }
    if(check && check.some(c => typeof c === 'string' && c.startsWith('cron_'))) {
      return this.SOFT_HEXAGONAL
    }
    return super.shapeFor(connection)
  }
}
class IoRenderer extends Blockly.zelos.Renderer {
  makeConstants_() { return new IoConstantProvider() }
}
Blockly.blockRendering.register(IO_RENDERER, IoRenderer)

INJECT_OPTIONS.renderer = IO_RENDERER
INJECT_OPTIONS.grid = { spacing: 26, length: 2, colour: '#c7ced8', snap: true }
INJECT_OPTIONS.move = { smoothScrolling: true }

////////////////
// Palette vibrancy + snapRadius.
////////////////

// Brighter, more saturated block colours so the palette reads fresh and vibrant
// instead of the muddy/dark defaults (this is what turns e.g. a dull brown into
// a clean orange). Applies to every hue-based block colour NOT remapped below.
Blockly.utils.colour.setHsvSaturation(0.58)
Blockly.utils.colour.setHsvValue(0.70)

// Make connections more forgiving: a larger snap radius so blocks — especially
// wide ones like the weather/comparison combos — don't have to be dropped
// pixel-perfect to snap into an input.
Blockly.config.snapRadius = 64
Blockly.config.connectingSnapRadius = 64


////////////////
// Field prototype extensions:
// checkbox look, mutator cog, template-field sizing, floating-value
// click-to-select, mutator close-on-outside-click.
////////////////

// Custom checkbox look: instead of a "✓" glyph, draw a rounded colour-filled
// inner square inset within the (rounded) field box, with a white gap between.
// We extend FieldCheckbox so every checkbox in every block gets the new look.
;(() => {
  const
    CHECKBOX_SIZE = 22,
    CHECKED_INSET = 5,
    CHECKED_CORNER_RADIUS = 3,
    CHECKED_SIZE = CHECKBOX_SIZE - (CHECKED_INSET*2),
    CHECKED_X = CHECKED_INSET,
    CHECKED_Y = CHECKED_INSET,
    CHECKED_WIDTH = CHECKED_SIZE,
    CHECKED_HEIGHT = CHECKED_SIZE

  // extend the built-in checkbox class directly
  class IoFieldCheckbox extends Blockly.FieldCheckbox {

    // helper to hide/show our checked square based on the field's value
    renderCheckedStatus() {
      if(!this.ioInnerSquare_) { return }

      const value = this.getValue()
      this.ioInnerSquare_.style.display = (value === true || value === 'TRUE') ? '' : 'none'
    }

    // make the checkbox box square (default is a tall rectangle)
    updateSize_(margin) {
      super.updateSize_(margin)

      this.size_.width = CHECKBOX_SIZE
      this.size_.height = CHECKBOX_SIZE
      this.borderRect_?.setAttribute('width', String(CHECKBOX_SIZE))
      this.borderRect_?.setAttribute('height', String(CHECKBOX_SIZE))
    }

    // override initView to hide old check and insert new check SVG
    initView() {
      super.initView()

      // hide the default checkmark glyph (kept for field sizing, just transparent)
      this.ioInnerSquare_ = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'class': 'io-checkbox-inner',
          x: CHECKED_X,
          y: CHECKED_Y,
          width: CHECKED_WIDTH,
          height: CHECKED_HEIGHT,
          rx: CHECKED_CORNER_RADIUS,
          ry: CHECKED_CORNER_RADIUS
        },
        this.fieldGroup_)
      this.renderCheckedStatus()
    }

    // override doValueUpdate_
    doValueUpdate_(value) {
      super.doValueUpdate_(value)

      this.renderCheckedStatus()
    }
  }

  // unregister the usual checkbox
  Blockly.fieldRegistry.unregister('field_checkbox')
  // register our checkbox with overrides
  Blockly.fieldRegistry.register('field_checkbox', IoFieldCheckbox)
})()

// Custom Multiline Text Field
// - set minimum and maximum dimensions so they don't warp their parent blocks
// - applies to previews and editors
;(() => {
  const PREVIEW_LINES = 4
  const
    WHITE_W = 220, // the visible white text box stays this fixed width
    FIELD_W = 234  // ...just a bit wider, so the box sits fully inside the teal

  class IoFieldMultilineInput extends Blockly.FieldMultilineInput {
    maxDisplayLength = 36
    maxLines_ = PREVIEW_LINES

    // override render_ to apply a better per-line truncation algorithm
    render_() {
      super.render_()

      // subtract the X padding from the white rectangle width to
      // get the full width of our text previews
      const insetWidth = WHITE_W - (this.getConstants().FIELD_BORDER_RECT_X_PADDING * 2)
      // get all the <text> nodes super.render_() just created
      const textNodes = this.getSvgRoot().querySelectorAll("g.blocklyEditableText text")

      textNodes.forEach(node => {
        // skip nodes that fit inside the field already
        if(node.getComputedTextLength() <= insetWidth) { return }

        // set textLength and lengthAdjust settings, which squeezes the text
        // the text is already truncated by the maxDisplayLength setting, so
        // if it's still too long, it shouldn't be by very much, so the squeezing
        // doesn't look too bad
        node.setAttribute("textLength", insetWidth)
        node.setAttribute("lengthAdjust", "spacingAndGlyphs")
      })
    }

    // Force the text editor to match the field's width so opening it never stretches the
    // field (and the whole block). Only grow vertically; the textarea word-wraps.
    widgetCreate_() {
      const
        // parent class produces an HTML <textarea>
        textarea = super.widgetCreate_(),
        // scale with the current zoom level
        scale = this.workspace_.getScale(),
        width = `${WHITE_W*scale}px`

      // modify its styles to affect the visuals we're after
      Object.assign(textarea.style, {
        boxSizing: 'border-box',
        width,
        maxWidth: width,
        minHeight: `${160*scale}px`,
        maxHeight: '55vh',
        resize: 'vertical',
        overflow: 'auto',
      })

      return textarea
    }

    updateSize_(margin) {
      super.updateSize_(margin)

      // eary out if we don't have a size or we aren't parented by a text template block
      if(!this.size_ || this.getSourceBlock?.()?.getParent?.()?.type !== 'text_template') {
        return
      }

      this.size_.width = FIELD_W
      this.borderRect_?.setAttribute('width', String(WHITE_W))
    }
  }

  // unregister the usual multiline input
  Blockly.fieldRegistry.unregister('field_multilinetext')
  // register our multiline input with overrides
  Blockly.fieldRegistry.register('field_multilinetext', IoFieldMultilineInput)
})()

// Custom Text Input Field
// - minimum and maximum dimensions to they don't warp their parent block
;(() => {
  const
    WHITE_W = 220, // the visible white text box stays this fixed width
    FIELD_W = 234  // ...just a bit wider, so the box sits fully inside the teal
                   //    wrapper (small teal margin) rather than filling it edge-to-edge
  class IoFieldTextInput extends Blockly.FieldTextInput {
    maxDisplayLength = 34

    // override render_ to apply a better preview truncation algorithm
    render_() {
      super.render_()

      // subtract the X padding from the white rectangle width to
      // get the full width of our text previews
      const insetWidth = WHITE_W - (this.getConstants().FIELD_BORDER_RECT_X_PADDING * 2)
      // get all the <text> nodes super.render_() just created
      const textNodes = this.getSvgRoot().querySelectorAll("g.blocklyEditableText text")

      textNodes.forEach(node => {
        // skip nodes that fit inside the field already
        if(node.getComputedTextLength() <= insetWidth) { return }

        // set textLength and lengthAdjust settings, which squeezes the text
        // the text is already truncated by the maxDisplayLength setting, so
        // if it's still too long, it shouldn't be by very much, so the squeezing
        // doesn't look too bad
        node.setAttribute("textLength", insetWidth)
        node.setAttribute("lengthAdjust", "spacingAndGlyphs")
      })
    }

    updateSize_(margin) {
      super.updateSize_(margin)

      // eary out if we don't have a size or we aren't parented by a text template block
      if(!this.size_ || this.getSourceBlock?.()?.getParent?.()?.type !== 'text_template') {
        return
      }

      this.size_.width = FIELD_W
      this.borderRect_?.setAttribute('width', String(WHITE_W))
    }
  }

  // unregister the usual text input
  Blockly.fieldRegistry.unregister('field_input')
  // register our text input with overrides
  Blockly.fieldRegistry.register('field_input', IoFieldTextInput)
 })()

// Replace the busy default mutator gear (reads as a snowflake at icon size) with
// a clean, bold 8-lobe cog.
;(() => {
  const MI = Blockly.icons?.MutatorIcon
  if(!MI) { return }

  // svg datauri of nice gear
  const GEAR = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path fill-rule='evenodd' d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/></svg>"

  const baseInitView = MI.prototype.initView
  MI.prototype.initView = function(listener) {
    baseInitView.call(this, listener)

    const root = this.svgRoot
    if(!root) { return }

    // hide the original gear
    const sym = root.querySelector('.blocklyIconSymbol')
    if(sym) { sym.style.display = 'none' }

    // create a new gear and set its href
    const img = Blockly.utils.dom.createSvgElement(
      'image', { 'class': 'io-mutator-gear', width: 16, height: 16, x: 0, y: 0 }, root)
    img.setAttribute('href', GEAR)
  }
})()

// On the MULTI-ROW cron blocks (the month/day checkbox grids), the mutator cog
// otherwise sits in the first row and shoves that row's checkboxes right, so the
// rows don't line up. Park the cog vertically-centred in the block's left hexagon
// tip and give it zero layout width, so every checkbox row starts at the same x.
// Single-row chips (Every day, At minute…) are left alone — their cog is already
// centred. Scoped to cron_* value blocks with more than one input row.
;(() => {
  const
    MI = Blockly.icons?.MutatorIcon,
    BS = Blockly.BlockSvg,
    Size = Blockly.utils?.Size
  // early out if we're missing any required bits
  if(!MI || !BS || !Size) { return }

  // helper that determines if a block has multiple schedule input rows
  const hasScheduleInputRows = block => {
    const connectionChecks = block?.outputConnection?.getCheck?.()
    if(!connectionChecks) { return false }

    const
      hasScheduleConnections = connectionChecks.some(x => x.startsWith('cron_')),
      hasMultipleInputs = block.inputList.length > 1

    return hasScheduleConnections && hasMultipleInputs
  }

  // 1) The cog takes no horizontal space in the layout, so every checkbox row starts
  //    at the same x (the cog no longer shoves the first row right). The icon's SVG
  //    (and thus its click target) is untouched — only its measured size.
  const baseGetSize = MI.prototype.getSize
  MI.prototype.getSize = function() {
    const s = baseGetSize.call(this)

    return hasScheduleInputRows(this.sourceBlock)
      ? new Size(0, s.height)
      : s
  }

  // 2) After the block draws, park the cog vertically-centred in the left hexagon
  //    tip. This runs post-render (the renderer places icons during render, so this
  //    is the last word) and re-applies on every re-render.
  const parkCog = blk => {
    if(!hasScheduleInputRows(blk) || !blk.getIcons) { return }

    const mi = blk.getIcons().find(i => i.svgRoot?.querySelector('.io-mutator-gear'))
    if(!mi) { return }

    const h = baseGetSize.call(mi).height
    mi.svgRoot.setAttribute('transform', `translate(14, ${Number((blk.height / 2 - h / 2).toFixed(2))})`)
  }

  ;['render', 'renderEfficiently'].forEach(name => {
    if(typeof BS.prototype[name] !== 'function') { return }
    const base = BS.prototype[name]
    BS.prototype[name] = function(...args) {
      const r = base.apply(this, args)

      try {
        parkCog(this)
      } catch(error) {
        /* never let a cosmetic tweak break render */
        console.warn(error)
      }

      return r
    }
  })
})()


// Close an open mutator popup when the user clicks anywhere outside it. Blockly
// leaves the bubble open until you click the cog again (and there's no close
// button), which feels sticky. We track the open mutator icon and dismiss it on
// any pointerdown that isn't inside the popup (its bubble canvas) or on a cog.
;(() => {
  const MI = Blockly.icons?.MutatorIcon
  if(!MI) { return }

  // track which bubble is open
  const openIcons = []

  // hook setBubbleVisible to update our bubble tracker
  const baseSetBubbleVisible = MI.prototype.setBubbleVisible
  MI.prototype.setBubbleVisible = function(visible) {
    // add the icon when bubbles open
    if(visible) {
      openIcons.push(this)

      // remove the icon when it closes, if present
    } else if(openIcons.indexOf(this) > -1) {
      openIcons.splice(openIcons.indexOf(this), 1)
    }

    return baseSetBubbleVisible.call(this, visible)
  }

  document.addEventListener('pointerdown', e => {
    // early out if we aren't tracking any open bubbles
    if(!openIcons.length) { return }

    // early out if we don't have an event target with a closest function
    const { target } = e
    if(typeof target?.closest !== 'function') { return }

    // inside the popup itself (bubble content + its mini-workspace/flyout)
    if(target.closest('.blocklyBubbleCanvas')) { return }

    // on a mutator cog — let Blockly's own toggle handle open/close
    if(target.closest('.blockly-icon-mutator')) { return }

    // iterate backwards since we remove items while we work
    for(let i=openIcons.length-1; i>=0; i--) {
      openIcons[i].setBubbleVisible(false)
    }
  }, true)
})()

// require 2 clicks to edit a floating number block
// the field for these blocks fills the entire block making it hard to
// select them for deletion (the input swallow the DELETE/BACKSPACE keypress)
;(() => {
  const F = Blockly.Field
  if(!F?.prototype.showEditor) { return }

  // id of the floating block we've selected-but-not-yet-opened for editing
  let armed = null

  const isFloatingNumber = block =>
    block?.type === "io_math_number" && !block.outputConnection?.isConnected()

  const baseShowEditor = F.prototype.showEditor
  F.prototype.showEditor = function(e) {
    const block = this.getSourceBlock?.()

    // only works on floating math blocks that aren't already selected
    if(isFloatingNumber(block) && armed !== block.id) {
      // first click: selection still happens as normal
      armed = block.id
      return // returns without opening the editor
    }

    // click didn't land on a block to arm, clear the arming switch and call through
    armed = null
    return baseShowEditor.call(this, e)
  }

  // Re-arm whenever selection leaves the armed block (clicking empty canvas or a
  // different block), so returning to it again requires the select-first click.
  const baseSetSelected = Blockly.common?.setSelected
  if(baseSetSelected) {
    Blockly.common.setSelected = function(newSel) {
      if(!newSel || (armed && newSel.id !== armed)) { armed = null }
      return baseSetSelected.call(this, newSel)
    }
  }
})()

////////////////
// ioModernTheme
////////////////

// Modern colour/typography theme. Block hues still come from each block's own
// `colour`; this only refreshes fonts, the workspace surface, the toolbox/flyout
// chrome, and selection/cursor highlights.
const ioModernTheme = Blockly.Theme.defineTheme('ioModern', {
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: "'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    weight: '500',
    size: 11,
  },
  componentStyles: {
    workspaceBackgroundColour: '#dde2e8',
    toolboxBackgroundColour: '#ffffff',
    toolboxForegroundColour: '#2e3440',
    flyoutBackgroundColour: '#eef1f5',
    flyoutForegroundColour: '#4c566a',
    flyoutOpacity: 1,
    scrollbarColour: '#c2c8d0',
    scrollbarOpacity: 0.5,
    insertionMarkerColour: '#1a1a2e',
    insertionMarkerOpacity: 0.4,
    cursorColour: '#0a6cff',
    selectedGlowColour: '#0a6cff',
    selectedGlowOpacity: 0.6,
    replacementGlowColour: '#0a6cff',
    markerColour: '#0a6cff',
  },
})

INJECT_OPTIONS.theme = ioModernTheme


AFTER_FIRST_RENDER_CALLBACKS.push(
  () => {
    // Copy each category's resolved accent colour (Blockly sets it as the row's
    // inline border-left) into a CSS custom property, so the sidebar stylesheet
    // can paint the full-row hover fill in that exact colour.
    document.querySelectorAll('.blocklyTreeRow').forEach(row => {
      const accent = getComputedStyle(row).borderLeftColor
      if(accent) { row.style.setProperty('--io-cat-colour', accent) }
    })
  }
)
