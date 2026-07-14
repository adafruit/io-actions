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
  const FC = Blockly.FieldCheckbox
  const positionInner = field => {
    const inner = field.ioInnerSquare_, box = field.borderRect_
    if(!inner || !box) { return }
    const
      w = Number(box.getAttribute('width')) || 0,
      h = Number(box.getAttribute('height')) || 0,
      gap = 5,                                   // thick white border between box and fill
      size = Math.max(0, Math.min(w, h) - gap * 2)
    inner.setAttribute('width', size)
    inner.setAttribute('height', size)
    inner.setAttribute('x', (w - size) / 2)
    inner.setAttribute('y', (h - size) / 2)
    const v = field.getValue()
    inner.style.display = (v === true || v === 'TRUE') ? '' : 'none'
  }

  // make the checkbox box square (default is a tall rectangle)
  const baseSize = FC.prototype.updateSize_
  FC.prototype.updateSize_ = function(margin) {
    baseSize.call(this, margin)
    const S = 22 // small square checkbox
    this.size_.width = S
    this.size_.height = S
    if(this.borderRect_) {
      this.borderRect_.setAttribute('width', String(S))
      this.borderRect_.setAttribute('height', String(S))
    }
  }

  const baseInit = FC.prototype.initView
  FC.prototype.initView = function() {
    baseInit.call(this)
    // hide the default checkmark glyph (kept for field sizing, just transparent)
    if(this.textElement_) { this.textElement_.style.fill = 'transparent' }
    this.ioInnerSquare_ = Blockly.utils.dom.createSvgElement(
      'rect', { 'class': 'io-checkbox-inner', rx: 3, ry: 3 }, this.fieldGroup_)
    positionInner(this)
  }
  const baseRender = FC.prototype.render_
  FC.prototype.render_ = function() { baseRender.call(this); positionInner(this) }
  const baseUpdate = FC.prototype.doValueUpdate_
  FC.prototype.doValueUpdate_ = function(v) { baseUpdate.call(this, v); positionInner(this) }
})()

// Long-form text: cap the multiline field's on-block PREVIEW to a few lines (so
// a long email body can't blow up the block) while keeping the full value, and
// give a roomy, resizable editor when the field is clicked.
;(() => {
  const FMI = Blockly.FieldMultilineInput
  if(!FMI) { return }
  const PREVIEW_LINES = 4
  const baseInit = FMI.prototype.initView
  FMI.prototype.initView = function() {
    if(!isFinite(this.maxLines_)) { this.maxLines_ = PREVIEW_LINES }
    baseInit.call(this)
  }
  const baseWidget = FMI.prototype.widgetCreate_
  FMI.prototype.widgetCreate_ = function() {
    const ta = baseWidget.call(this)
    // Hard-cap the editor to the field's width so opening it never stretches the
    // field (and the whole block). Only grow vertically; the textarea word-wraps.
    const fw = this.borderRect_ ? Number(this.borderRect_.getAttribute('width')) : (this.size_ && this.size_.width)
    Object.assign(ta.style, {
      boxSizing: 'border-box',
      ...(fw ? { width: fw + 'px', maxWidth: fw + 'px' } : {}),
      minHeight: '160px',
      maxHeight: '55vh',
      resize: 'vertical',
      overflow: 'auto',
    })
    return ta
  }
})()

// Template text fields (the Subject / Body inside a text_template wrapper) get a
// generous fixed minimum width, so they start "full length" and don't keep
// resizing the block as you type. Scoped to text_template content so unrelated
// short inputs (feed values, etc.) are unaffected.
;(() => {
  const
    WHITE_W = 220, // the visible white text box stays this fixed width
    FIELD_W = 234  // ...just a bit wider, so the box sits fully inside the teal
                   //    wrapper (small teal margin) rather than filling it edge-to-edge
  const widen = field => {
    const parent = field.getSourceBlock && field.getSourceBlock()?.getParent?.()
    if(parent && parent.type === 'text_template' && field.size_) {
      field.size_.width = FIELD_W
      if(field.borderRect_) { field.borderRect_.setAttribute('width', String(WHITE_W)) }
    }
  }
  ;[Blockly.FieldTextInput, Blockly.FieldMultilineInput].forEach(Cls => {
    if(!Cls) { return }
    const base = Cls.prototype.updateSize_
    Cls.prototype.updateSize_ = function(margin) { base.call(this, margin); widen(this) }
  })
})()

// Replace the busy default mutator gear (reads as a snowflake at icon size) with
// a clean, bold 8-lobe cog.
;(() => {
  const MI = Blockly.icons && Blockly.icons.MutatorIcon
  if(!MI) { return }
  const GEAR = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path fill-rule='evenodd' d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/></svg>"
  const baseInit = MI.prototype.initView
  MI.prototype.initView = function(listener) {
    baseInit.call(this, listener)
    const root = this.svgRoot
    if(!root) { return }
    const sym = root.querySelector('.blocklyIconSymbol')
    if(sym) { sym.style.display = 'none' }
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
  const MI = Blockly.icons && Blockly.icons.MutatorIcon
  const BS = Blockly.BlockSvg
  const Size = Blockly.utils && Blockly.utils.Size
  if(!MI || !BS || !Size) { return }
  const isGrid = blk => {
    if(!blk || !blk.outputConnection || !blk.outputConnection.getCheck) { return false }
    const c = blk.outputConnection.getCheck()
    return !!(c && c.some(x => typeof x === 'string' && x.startsWith('cron_')) &&
              blk.inputList && blk.inputList.length > 1)
  }
  // 1) The cog takes no horizontal space in the layout, so every checkbox row starts
  //    at the same x (the cog no longer shoves the first row right). The icon's SVG
  //    (and thus its click target) is untouched — only its measured size.
  const baseGetSize = MI.prototype.getSize
  MI.prototype.getSize = function() {
    const s = baseGetSize.call(this)
    return isGrid(this.sourceBlock) ? new Size(0, s.height) : s
  }
  // 2) After the block draws, park the cog vertically-centred in the left hexagon
  //    tip. This runs post-render (the renderer places icons during render, so this
  //    is the last word) and re-applies on every re-render.
  const parkCog = blk => {
    if(!isGrid(blk) || !blk.getIcons) { return }
    const mi = blk.getIcons().find(i =>
      i.svgRoot && i.svgRoot.querySelector && i.svgRoot.querySelector('.io-mutator-gear'))
    if(!mi || !mi.svgRoot) { return }
    const h = baseGetSize.call(mi).height
    mi.svgRoot.setAttribute('transform', `translate(14, ${Number((blk.height / 2 - h / 2).toFixed(2))})`)
  }
  ;['render', 'renderEfficiently'].forEach(name => {
    if(typeof BS.prototype[name] !== 'function') { return }
    const base = BS.prototype[name]
    BS.prototype[name] = function(...args) {
      const r = base.apply(this, args)
      try { parkCog(this) } catch(_) { /* never let a cosmetic tweak break render */ }
      return r
    }
  })
})()

INJECT_OPTIONS.grid = { spacing: 26, length: 2, colour: '#c7ced8', snap: true }

// Close an open mutator popup when the user clicks anywhere outside it. Blockly
// leaves the bubble open until you click the cog again (and there's no close
// button), which feels sticky. We track the open mutator icon and dismiss it on
// any pointerdown that isn't inside the popup (its bubble canvas) or on a cog.
;(() => {
  const MI = Blockly.icons && Blockly.icons.MutatorIcon
  if(!MI || !MI.prototype.setBubbleVisible) { return }
  let openIcon = null
  const baseSet = MI.prototype.setBubbleVisible
  MI.prototype.setBubbleVisible = function(visible) {
    const ret = baseSet.call(this, visible)
    if(visible) { openIcon = this }
    else if(openIcon === this) { openIcon = null }
    return ret
  }
  document.addEventListener('pointerdown', e => {
    if(!openIcon) { return }
    const t = e.target
    if(!t || typeof t.closest !== 'function') { return }
    // inside the popup itself (bubble content + its mini-workspace/flyout)
    if(t.closest('.blocklyBubbleCanvas')) { return }
    // on a mutator cog — let Blockly's own toggle handle open/close
    if(t.closest('.blockly-icon-mutator')) { return }
    openIcon.setBubbleVisible(false)
  }, true)
})()

// Orphaned value blocks (a floating reporter like a bare number/text pill) are a
// UX trap: the editable field fills the whole block, so a single click opens the
// field editor, and the open editor swallows Delete/Backspace — leaving no way to
// select the block to remove it. For a FLOATING value block (an output connection
// that isn't plugged into anything), make the first click just SELECT it (so it
// can be deleted or dragged away) and a second click open the editor. Blocks that
// are plugged into a socket are untouched — they still edit on a single click.
;(() => {
  const F = Blockly.Field
  if(!F || !F.prototype.showEditor) { return }
  // id of the floating block we've selected-but-not-yet-opened for editing
  let armed = null

  const isFloating = block =>
    block && block.outputConnection && !block.outputConnection.isConnected()

  const baseShow = F.prototype.showEditor
  F.prototype.showEditor = function(e) {
    const block = this.getSourceBlock && this.getSourceBlock()
    if(isFloating(block) && armed !== block.id) {
      // first click: select so it can be deleted/moved, but don't trap the user
      // inside the field editor.
      armed = block.id
      try { block.select() } catch(_) { /* older API — ignore */ }
      return
    }
    armed = null
    return baseShow.call(this, e)
  }

  // Re-arm whenever selection leaves the armed block (clicking empty canvas or a
  // different block), so returning to it again requires the select-first click.
  const setSelected = Blockly.common && Blockly.common.setSelected
  if(setSelected) {
    Blockly.common.setSelected = function(newSel) {
      if(!newSel || (armed && newSel.id !== armed)) { armed = null }
      return setSelected.call(this, newSel)
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
INJECT_OPTIONS.move = { smoothScrolling: true }


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

////////////////
// Custom CSS
// sidebar chrome, category icons, checkbox,
// field edit-widget ring, dropdown checkmark, white block borders.
////////////////

// MakeCode-style category sidebar: roomier rows, larger readable labels, a bold
// colour accent bar per category, and clear hover/selected states. Blockly keeps
// the per-category accent colour as an inline `border-left`, so we only restyle
// spacing, typography, and interaction states here.
Blockly.Css.register(`
  .blocklyToolboxDiv {
    background-color: #ffffff;
    border-right: 1px solid #e6e9ef;
    padding: 8px 0;
    min-width: 168px;
  }

  /* one category row */
  .blocklyTreeRow {
    display: flex;
    align-items: center;
    height: auto;
    min-height: 44px;
    margin: 0 0 4px 0;
    /* square edges; the inline border-left keeps each category's accent colour */
    border-radius: 0;
    transition: background-color 0.12s ease;
    cursor: pointer;
  }
  /* On hover, fill the whole row with the category's accent colour (copied into
     --io-cat-colour after inject) and flip the label + icon to white. */
  .blocklyTreeRow:hover {
    background-color: var(--io-cat-colour, rgba(10, 108, 255, 0.08)) !important;
  }
  .blocklyTreeRow:hover .blocklyTreeLabel {
    color: #ffffff;
  }
  .blocklyTreeRow:hover .io-cat-icon {
    filter: brightness(0) invert(1);
  }
  /* the active/selected category gets the same full-width accent fill as hover */
  .blocklyTreeSelected {
    background-color: var(--io-cat-colour, rgba(10, 108, 255, 0.10)) !important;
  }
  .blocklyTreeSelected .io-cat-icon {
    filter: brightness(0) invert(1);
  }

  /* icon + label wrapper inside the row */
  .blocklyTreeRowContentContainer {
    display: flex;
    align-items: center;
    padding: 0 18px;
    width: 100%;
  }

  /* category label text */
  .blocklyTreeLabel {
    font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #2e3440;
  }
  .blocklyTreeSelected .blocklyTreeLabel {
    color: #ffffff;
  }

  /*
   * Category icons.
   * The toolbox exporter maps each category's icon name to the class
   * "io-cat-icon io-cat-icon-<name>" on the row's icon element. The SVGs below
   * are lightweight placeholders — swap the background-image data URIs for the
   * Font Awesome Pro icons when ready (only this block needs to change).
   */
  .io-cat-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    flex: 0 0 auto;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 20px 20px;
  }
  .io-cat-icon-triggers     { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%238A2E52'><path d='M128 320L156.5 92C158.5 76 172.1 64 188.3 64L356.9 64C371.9 64 384 76.1 384 91.1C384 94.3 383.4 97.6 382.3 100.6L336 224L475.3 224C495.5 224 512 240.4 512 260.7C512 268.1 509.8 275.3 505.6 281.4L313.4 562.4C307.5 571 297.8 576.1 287.5 576.1L284.6 576.1C268.9 576.1 256.1 563.3 256.1 547.6C256.1 545.3 256.4 543 257 540.7L304 352L160 352C142.3 352 128 337.7 128 320z'/></svg>"); }
  .io-cat-icon-logic        { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%237E57D4'><path d='M294.8 97.8C303.8 94.1 314.1 96.1 321 103L361 143C370.4 152.4 370.4 167.6 361 176.9L321 216.9C314.1 223.8 303.8 225.8 294.8 222.1C285.8 218.4 280 209.7 280 200L280 192L176 192C149.5 192 128 213.5 128 240C128 266.5 149.5 288 176 288L464 288C525.9 288 576 338.1 576 400C576 446.4 547.8 486.1 507.7 503.2C498.4 527.1 475.2 544 448 544C412.7 544 384 515.3 384 480C384 444.7 412.7 416 448 416C466.6 416 483.4 423.9 495 436.6C505.4 427.8 512 414.7 512 400C512 373.5 490.5 352 464 352L176 352C114.1 352 64 301.9 64 240C64 178.1 114.1 128 176 128L280 128L280 120C280 110.3 285.8 101.5 294.8 97.8zM480 96C515.3 96 544 124.7 544 160C544 195.3 515.3 224 480 224C444.7 224 416 195.3 416 160C416 124.7 444.7 96 480 96zM215.4 512C204.3 531.1 183.7 544 160 544C124.7 544 96 515.3 96 480C96 444.7 124.7 416 160 416C183.7 416 204.4 428.9 215.4 448L248 448L248 440C248 430.3 253.8 421.5 262.8 417.8C271.8 414.1 282.1 416.1 289 423L329 463C338.4 472.4 338.4 487.6 329 496.9L289 536.9C282.1 543.8 271.8 545.8 262.8 542.1C253.8 538.4 248 529.7 248 520L248 512L215.4 512z'/></svg>"); }
  .io-cat-icon-math         { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%232E9E3B'><path d='M64 112C64 85.5 85.5 64 112 64L240 64C266.5 64 288 85.5 288 112L288 240C288 266.5 266.5 288 240 288L112 288C85.5 288 64 266.5 64 240L64 112zM352 112C352 85.5 373.5 64 400 64L528 64C554.5 64 576 85.5 576 112L576 240C576 266.5 554.5 288 528 288L400 288C373.5 288 352 266.5 352 240L352 112zM400 352L528 352C554.5 352 576 373.5 576 400L576 528C576 554.5 554.5 576 528 576L400 576C373.5 576 352 554.5 352 528L352 400C352 373.5 373.5 352 400 352zM64 400C64 373.5 85.5 352 112 352L240 352C266.5 352 288 373.5 288 400L288 528C288 554.5 266.5 576 240 576L112 576C85.5 576 64 554.5 64 528L64 400zM488 136C488 122.7 477.3 112 464 112C450.7 112 440 122.7 440 136L440 152L424 152C410.7 152 400 162.7 400 176C400 189.3 410.7 200 424 200L440 200L440 216C440 229.3 450.7 240 464 240C477.3 240 488 229.3 488 216L488 200L504 200C517.3 200 528 189.3 528 176C528 162.7 517.3 152 504 152L488 152L488 136zM136 152C122.7 152 112 162.7 112 176C112 189.3 122.7 200 136 200L216 200C229.3 200 240 189.3 240 176C240 162.7 229.3 152 216 152L136 152zM119 407C109.6 416.4 109.6 431.6 119 440.9L142 463.9L119 486.9C109.6 496.3 109.6 511.5 119 520.8C128.4 530.1 143.6 530.2 152.9 520.8L175.9 497.8L198.9 520.8C208.3 530.2 223.5 530.2 232.8 520.8C242.1 511.4 242.2 496.2 232.8 486.9L209.8 463.9L232.8 440.9C242.2 431.5 242.2 416.3 232.8 407C223.4 397.7 208.2 397.6 198.9 407L175.9 430L152.9 407C143.5 397.6 128.3 397.6 119 407zM424 400C410.7 400 400 410.7 400 424C400 437.3 410.7 448 424 448L504 448C517.3 448 528 437.3 528 424C528 410.7 517.3 400 504 400L424 400zM424 480C410.7 480 400 490.7 400 504C400 517.3 410.7 528 424 528L504 528C517.3 528 528 517.3 528 504C528 490.7 517.3 480 504 480L424 480z'/></svg>"); }
  .io-cat-icon-text         { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%231499A8'><path d='M192 160L192 192C192 209.7 177.7 224 160 224C142.3 224 128 209.7 128 192L128 136C128 113.9 145.9 96 168 96L472 96C494.1 96 512 113.9 512 136L512 192C512 209.7 497.7 224 480 224C462.3 224 448 209.7 448 192L448 160L352 160L352 480L400 480C417.7 480 432 494.3 432 512C432 529.7 417.7 544 400 544L240 544C222.3 544 208 529.7 208 512C208 494.3 222.3 480 240 480L288 480L288 160L192 160z'/></svg>"); }
  .io-cat-icon-variables    { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%233B57C9'><path d='M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z'/></svg>"); }
  .io-cat-icon-feeds        { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%23B83DBA'><path d='M96 128C96 110.3 110.3 96 128 96C357.8 96 544 282.2 544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512C480 317.6 322.4 160 128 160C110.3 160 96 145.7 96 128zM96 480C96 444.7 124.7 416 160 416C195.3 416 224 444.7 224 480C224 515.3 195.3 544 160 544C124.7 544 96 515.3 96 480zM128 224C287.1 224 416 352.9 416 512C416 529.7 401.7 544 384 544C366.3 544 352 529.7 352 512C352 388.3 251.7 288 128 288C110.3 288 96 273.7 96 256C96 238.3 110.3 224 128 224z'/></svg>"); }
  .io-cat-icon-notifications{ background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%23D63A3A'><path d='M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z'/></svg>"); }
  .io-cat-icon-weather      { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%232F86C9'><path d='M208.3 256C251.4 256 288.8 280.4 307.5 316.1C322.2 298.9 343.9 288 368.3 288C412.5 288 448.3 323.8 448.3 368C448.3 373.5 447.7 378.9 446.7 384C447.2 384 447.8 384 448.3 384C501.3 384 544.3 427 544.3 480C544.3 533 501.3 576 448.3 576L128.3 576C75.3 576 32.3 533 32.3 480C32.3 437.5 60 401.5 98.3 388.8C97 382 96.3 375.1 96.3 368C96.3 306.1 146.4 256 208.3 256zM400.3 32.2C405.6 32.2 410.6 34.9 413.6 39.3L460.9 109.7L544.2 93.4C549.4 92.4 554.8 94.1 558.5 97.8C562.3 101.6 563.9 107 562.9 112.2L546.6 195.5L617 242.8C621.4 245.8 624.1 250.8 624.1 256.1C624.1 261.4 621.5 266.4 617.1 269.3L546.7 316.6L561.2 390.8C544 369.1 520.8 352.4 494 343.5C491.5 330.8 487.1 318.9 481.2 307.8C490.8 292.9 496.4 275.1 496.4 256.1C496.4 203.1 453.4 160.1 400.4 160.1C352.5 160.1 312.8 195.2 305.6 241C284.7 225 259.7 214 232.5 209.9L254 195.4L237.7 112.2L237.4 110.2C237.1 105.6 238.7 101.1 242 97.8C245.8 94 251.2 92.4 256.4 93.4L339.7 109.7L387 39.3L388.2 37.7C391.2 34.2 395.6 32.2 400.3 32.2zM400.3 208C426.8 208 448.3 229.5 448.3 256C448.3 259.8 447.8 263.6 446.9 267.1C425.2 250.2 398 240 368.3 240C363.7 240 359.2 240.2 354.8 240.7C361.2 221.7 379.1 208 400.3 208z'/></svg>"); }
  .io-cat-icon-air          { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%2316A085'><path d='M352 96C352 113.7 366.3 128 384 128L424 128C437.3 128 448 138.7 448 152C448 165.3 437.3 176 424 176L96 176C78.3 176 64 190.3 64 208C64 225.7 78.3 240 96 240L424 240C472.6 240 512 200.6 512 152C512 103.4 472.6 64 424 64L384 64C366.3 64 352 78.3 352 96zM416 448C416 465.7 430.3 480 448 480L480 480C533 480 576 437 576 384C576 331 533 288 480 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L480 352C497.7 352 512 366.3 512 384C512 401.7 497.7 416 480 416L448 416C430.3 416 416 430.3 416 448zM192 576L232 576C280.6 576 320 536.6 320 488C320 439.4 280.6 400 232 400L96 400C78.3 400 64 414.3 64 432C64 449.7 78.3 464 96 464L232 464C245.3 464 256 474.7 256 488C256 501.3 245.3 512 232 512L192 512C174.3 512 160 526.3 160 544C160 561.7 174.3 576 192 576z'/></svg>"); }
  .io-cat-icon-utility      { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%23607D8B'><path d='M541.4 162.6C549 155 561.7 156.9 565.5 166.9C572.3 184.6 576 203.9 576 224C576 312.4 504.4 384 416 384C398.5 384 381.6 381.2 365.8 376L178.9 562.9C150.8 591 105.2 591 77.1 562.9C49 534.8 49 489.2 77.1 461.1L264 274.2C258.8 258.4 256 241.6 256 224C256 135.6 327.6 64 416 64C436.1 64 455.4 67.7 473.1 74.5C483.1 78.3 484.9 91 477.4 98.6L388.7 187.3C385.7 190.3 384 194.4 384 198.6L384 240C384 248.8 391.2 256 400 256L441.4 256C445.6 256 449.7 254.3 452.7 251.3L541.4 162.6z'/></svg>"); }
  .io-cat-icon-advanced     { background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640' fill='%236B7280'><path d='M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z'/></svg>"); }

  /* Checkbox: hide the default tick; the FieldCheckbox extension draws a
     colour-filled inner square (with a white gap) inside the rounded box. */
  .blocklyCheckbox { fill: transparent !important; }
  .io-checkbox-inner { fill: #0a6cff !important; }

  /* Dropdown menu selected-item checkmark. Blockly draws it from a bitmap sprite
     (a dark tick), which is invisible/wrong on our dark-filled menus. Replace it
     with an inline white check so it reads on the coloured menu background. */
  .blocklyMenuItemCheckbox {
    background-image: none !important;
  }
  .blocklyMenuItemSelected .blocklyMenuItemCheckbox {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>") !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 15px 15px !important;
  }

  /* A 1px WHITE stroke around every block so blocks separate cleanly from the
     (darker) workspace surface and from each other when stacked. */
  .blocklyPath {
    stroke: #ffffff;
    stroke-width: 1px;
  }

  .blockly-icon-mutator .blocklyIconShape {
    rx: 8px;
    ry: 8px;
    fill: rgba(0, 0, 0, 0.22);
    stroke: none;
    transform: scale(1.5);
    transform-box: fill-box;
    transform-origin: center;
  }
  .io-mutator-gear {
    transform: scale(1.05);
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Editing a text/number field. Blockly's default is a fuzzy translucent-white
     4px halo on the widget plus a pill-radius navy input border — it reads as a
     blurry, offset outline over the block. Replace it with a crisp focus ring
     that matches the resting field's rounded-rect shape and the theme blue. */
  .blocklyWidgetDiv {
    box-shadow: none !important;
  }
  .blocklyHtmlInput {
    box-sizing: border-box !important;
    box-shadow: none !important;
    border: 1.5px solid #0a6cff !important;
    /* keep Blockly's computed radius so the edit box matches the field/block
       silhouette (a pill on reporter blocks) instead of poking out as a rect */
    color: #2e3440 !important;
  }
`)

