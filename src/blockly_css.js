// Blockly v12 CSS, embedded into exported block images (SVG/PNG), which
// can't see the page's stylesheets. app/styles/app.css is appended separately.
//
// Captured from the running app: Blockly's injected <style> tags for the
// common styles and the io_zelos renderer + ioModern theme, with the
// ".io_zelos-renderer.iomodern-theme" ancestor prefix stripped (exported svgs
// have no such ancestors) and app.css removed. Regenerate after a Blockly
// upgrade or a renderer/theme change.
export default `
.blocklyText,
.blocklyFlyoutLabelText {
font: 500 11pt 'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.blocklyTextInputBubble textarea {
font-weight: normal;
}
.blocklyText {
fill: #fff;
}
.blocklyNonEditableField>rect:not(.blocklyDropdownRect),
.blocklyEditableField>rect:not(.blocklyDropdownRect) {
fill: #fff;
}
.blocklyNonEditableField>text,
.blocklyEditableField>text,
.blocklyNonEditableField>g>text,
.blocklyEditableField>g>text {
fill: #575E75;
}
.blocklyFlyoutLabelText {
fill: #575E75;
}
.blocklyText.blocklyBubbleText {
fill: #575E75;
}
.blocklyDraggable:not(.blocklyDisabled)
 .blocklyEditableField:not(.blocklyEditing):hover>rect,
.blocklyDraggable:not(.blocklyDisabled)
 .blocklyEditableField:not(.blocklyEditing):hover>.blocklyPath {
stroke: #fff;
stroke-width: 2;
}
.blocklyHtmlInput {
font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
font-weight: 500;
color: #575E75;
}
.blocklyDropdownText {
fill: #fff !important;
}
.blocklyWidgetDiv .blocklyMenuItem,
.blocklyDropDownDiv .blocklyMenuItem {
font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.blocklyDropDownDiv .blocklyMenuItemContent {
color: #fff;
}
.blocklyHighlightedConnectionPath {
stroke: #0a6cff;
}
.blocklyDisabledPattern > .blocklyOutlinePath {
fill: var(--blocklyDisabledPattern)
}
.blocklyInsertionMarker>.blocklyPath {
fill-opacity: 0.4;
stroke: none;
}
.blocklySelected>.blocklyPath.blocklyPathSelected {
fill: none;
filter: var(--blocklySelectedGlowFilter);
}
.blocklyReplaceable>.blocklyPath {
filter: var(--blocklyReplacementGlowFilter);
}

.blocklySvg {
  background-color: #fff;
  outline: none;
  overflow: hidden;  /* IE overflows by default. */
  position: absolute;
  display: block;
}

.blocklyWidgetDiv {
  display: none;
  position: absolute;
  z-index: 99999;  /* big value for bootstrap3 compatibility */
}

.injectionDiv {
  height: 100%;
  position: relative;
  overflow: hidden;  /* So blocks in drag surface disappear at edges */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.blocklyBlockCanvas.blocklyCanvasTransitioning,
.blocklyBubbleCanvas.blocklyCanvasTransitioning {
  transition: transform .5s;
}

.blocklyEmboss {
  filter: var(--blocklyEmbossFilter);
}

.blocklyTooltipDiv {
  background-color: #ffffc7;
  border: 1px solid #ddc;
  box-shadow: 4px 4px 20px 1px rgba(0,0,0,.15);
  color: #000;
  display: none;
  font: 9pt sans-serif;
  opacity: .9;
  padding: 2px;
  position: absolute;
  z-index: 100000;  /* big value for bootstrap3 compatibility */
}

.blocklyDropDownDiv {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  display: none;
  border: 1px solid;
  border-color: #dadce0;
  background-color: #fff;
  border-radius: 2px;
  padding: 4px;
  box-shadow: 0 0 3px 1px rgba(0,0,0,.3);
}

.blocklyDropDownDiv:focus {
  box-shadow: 0 0 6px 1px rgba(0,0,0,.3);
}

.blocklyDropDownContent {
  max-height: 300px;  /* @todo: spec for maximum height. */
}

.blocklyDropDownArrow {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  z-index: -1;
  background-color: inherit;
  border-color: inherit;
  border-top: 1px solid;
  border-left: 1px solid;
  border-top-left-radius: 4px;
  border-color: inherit;
}

.blocklyHighlighted>.blocklyPath {
  filter: var(--blocklyEmbossFilter);
}

.blocklyHighlightedConnectionPath {
  fill: none;
  stroke: #fc3;
  stroke-width: 4px;
}

.blocklyPathLight {
  fill: none;
  stroke-linecap: round;
  stroke-width: 1;
}

.blocklySelected>.blocklyPathLight {
  display: none;
}

.blocklyDraggable {
  cursor: grab;
  cursor: -webkit-grab;
}

.blocklyDragging {
  cursor: grabbing;
  cursor: -webkit-grabbing;
  /* Drag surface disables events to not block the toolbox, so we have to
   * reenable them here for the cursor values to work. */
  pointer-events: auto;
}

  /* Changes cursor on mouse down. Not effective in Firefox because of
     https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
.blocklyDraggable:active {
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

.blocklyDragging.blocklyDraggingDelete,
.blocklyDragging.blocklyDraggingDelete .blocklyField {
  cursor: url("./handdelete.cur"), auto;
}

.blocklyDragging>.blocklyPath,
.blocklyDragging>.blocklyPathLight {
  fill-opacity: .8;
  stroke-opacity: .8;
}

.blocklyDragging>.blocklyPathDark {
  display: none;
}

.blocklyDisabledPattern>.blocklyPath {
  fill: var(--blocklyDisabledPattern);
  fill-opacity: .5;
  stroke-opacity: .5;
}

.blocklyDisabled>.blocklyPathLight,
.blocklyDisabled>.blocklyPathDark {
  display: none;
}

.blocklyInsertionMarker>.blocklyPath,
.blocklyInsertionMarker>.blocklyPathLight,
.blocklyInsertionMarker>.blocklyPathDark {
  fill-opacity: .2;
  stroke: none;
}

.blocklyNonEditableField>text {
  pointer-events: none;
}

.blocklyFlyout {
  position: absolute;
  z-index: 20;
}

.blocklyText text {
  cursor: default;
}

/*
  Don't allow users to select text.  It gets annoying when trying to
  drag a block and selected text moves instead.
*/
.blocklySvg text {
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  cursor: inherit;
}

.blocklyIconGroup {
  cursor: default;
}

.blocklyIconGroup:not(:hover):not(:focus),
.blocklyIconGroupReadonly {
  opacity: .6;
}

.blocklyIconShape {
  fill: #00f;
  stroke: #fff;
  stroke-width: 1px;
}

.blocklyIconSymbol {
  fill: #fff;
}

.blocklyMinimalBody {
  margin: 0;
  padding: 0;
  height: 100%;
}

.blocklyHtmlInput {
  border: none;
  border-radius: 4px;
  height: 100%;
  margin: 0;
  outline: none;
  padding: 0;
  width: 100%;
  text-align: center;
  display: block;
  box-sizing: border-box;
}

/* Remove the increase and decrease arrows on the field number editor */
input.blocklyHtmlInput[type=number]::-webkit-inner-spin-button,
input.blocklyHtmlInput[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.blocklyMainBackground {
  stroke-width: 1;
  stroke: #c6c6c6;  /* Equates to #ddd due to border being off-pixel. */
}

.blocklyMutatorBackground {
  fill: #fff;
  stroke: #ddd;
  stroke-width: 1;
}

.blocklyFlyoutBackground {
  fill: #ddd;
  fill-opacity: .8;
}

.blocklyMainWorkspaceScrollbar {
  z-index: 20;
}

.blocklyFlyoutScrollbar {
  z-index: 30;
}

.blocklyScrollbarHorizontal,
.blocklyScrollbarVertical {
  position: absolute;
  outline: none;
}

.blocklyScrollbarBackground {
  opacity: 0;
  pointer-events: none;
}

.blocklyScrollbarHandle {
  fill: #ccc;
}

.blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,
.blocklyScrollbarHandle:hover {
  fill: #bbb;
}

/* Darken flyout scrollbars due to being on a grey background. */
/* By contrast, workspace scrollbars are on a white background. */
.blocklyFlyout .blocklyScrollbarHandle {
  fill: #bbb;
}

.blocklyFlyout .blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,
.blocklyFlyout .blocklyScrollbarHandle:hover {
  fill: #aaa;
}

.blocklyInvalidInput {
  background: #faa;
}

.blocklyVerticalMarker {
  stroke-width: 3px;
  fill: rgba(255,255,255,.5);
  pointer-events: none;
}

.blocklyComputeCanvas {
  position: absolute;
  width: 0;
  height: 0;
}

.blocklyNoPointerEvents {
  pointer-events: none;
}

.blocklyContextMenu {
  border-radius: 4px;
  max-height: 100%;
}

.blocklyDropdownMenu {
  border-radius: 2px;
  padding: 0 !important;
}

.blocklyDropdownMenu .blocklyMenuItem {
  /* 28px on the left for icon or checkbox. */
  padding-left: 28px;
}

/* BiDi override for the resting state. */
.blocklyDropdownMenu .blocklyMenuItemRtl {
  /* Flip left/right padding for BiDi. */
  padding-left: 5px;
  padding-right: 28px;
}

.blocklyWidgetDiv .blocklyMenu {
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  background: #fff;
  border: 1px solid transparent;
  box-shadow: 0 0 3px 1px rgba(0,0,0,.3);
  font: normal 13px Arial, sans-serif;
  margin: 0;
  outline: none;
  padding: 4px 0;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
}

.blocklyWidgetDiv .blocklyMenu:focus {
  box-shadow: 0 0 6px 1px rgba(0,0,0,.3);
}

.blocklyDropDownDiv .blocklyMenu {
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  background: inherit;  /* Compatibility with gapi, reset from goog-menu */
  border: inherit;  /* Compatibility with gapi, reset from goog-menu */
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  outline: none;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
}

/* State: resting. */
.blocklyMenuItem {
  border: none;
  color: #000;
  cursor: pointer;
  list-style: none;
  margin: 0;
  /* 7em on the right for shortcut. */
  min-width: 7em;
  padding: 6px 15px;
  white-space: nowrap;
}

/* State: disabled. */
.blocklyMenuItemDisabled {
  color: #ccc;
  cursor: inherit;
}

/* State: hover. */
.blocklyMenuItemHighlight {
  background-color: rgba(0,0,0,.1);
}

/* State: selected/checked. */
.blocklyMenuItemSelected .blocklyMenuItemCheckbox {
  background: url(./sprites.png) no-repeat -48px -16px;
  float: left;
  margin-left: -24px;
  width: 16px;
  height: 16px;
  position: static;  /* Scroll with the menu. */
  display: block;
}

.blocklyMenuItemRtl .blocklyMenuItemCheckbox {
  float: right;
  margin-right: -24px;
}

.blocklyMenuSeparator {
  background-color: #ccc;
  height: 1px;
  border: 0;
  margin-left: 4px;
  margin-right: 4px;
}

.blocklyBlockDragSurface, .blocklyAnimationLayer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
  z-index: 80;
  pointer-events: none;
}

.blocklyField {
  cursor: default;
}

.blocklyInputField {
  cursor: text;
}

.blocklyDragging .blocklyField,
.blocklyDragging .blocklyIconGroup {
  cursor: grabbing;
}

.blocklyActiveFocus:is(
  .blocklyFlyout,
  .blocklyWorkspace,
  .blocklyField,
  .blocklyPath,
  .blocklyHighlightedConnectionPath,
  .blocklyComment,
  .blocklyBubble,
  .blocklyIconGroup,
  .blocklyTextarea
) {
  outline: none;
}

.blocklyZoom>image, .blocklyZoom>svg>image {
  opacity: .4;
}

.blocklyZoom>image:hover, .blocklyZoom>svg>image:hover {
  opacity: .6;
}

.blocklyZoom>image:active, .blocklyZoom>svg>image:active {
  opacity: .8;
}

.blocklyToast {
  font-size: 1.2rem;
  position: absolute;
  bottom: -10rem;
  right: 2rem;
  padding: 1rem;
  color: black;
  background-color: white;
  border: 2px solid black;
  border-radius: 0.4rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  line-height: 1.5;
  transition: bottom 0.3s ease-out;
}

.blocklyToast .blocklyToastMessage {
  maxWidth: 18rem;
}

.blocklyToast .blocklyToastCloseButton {
  margin: 0;
  padding: 0.2rem;
  background-color: transparent;
  color: black;
  border: none;
  cursor: pointer;
}

.injectionDiv {
  --commentFillColour: #FFFCC7;
  --commentBorderColour: #F2E49B;
}

.blocklyComment .blocklyTextarea {
  background-color: var(--commentFillColour);
  border: 1px solid var(--commentBorderColour);
  box-sizing: border-box;
  display: block;
  outline: 0;
  padding: 5px;
  resize: none;
  width: 100%;
  height: 100%;
}

.blocklyReadonly.blocklyComment .blocklyTextarea {
  cursor: inherit;
}

.blocklyDeleteIcon {
  width: 20px;
  height: 20px;
  display: none;
  cursor: pointer;
}

.blocklyFoldoutIcon {
  width: 20px;
  height: 20px;
  transform-origin: 12px 12px;
  cursor: pointer;
}
.blocklyResizeHandle {
  width: 12px;
  height: 12px;
  cursor: se-resize;
}
.blocklyReadonly.blocklyComment .blocklyResizeHandle {
  cursor: inherit;
}

.blocklyCommentTopbarBackground {
  fill: var(--commentBorderColour);
  height: 24px;
}

.blocklyComment .blocklyCommentPreview.blocklyText {
  fill: #000;
  dominant-baseline: middle;
  visibility: hidden;
}

.blocklyCollapsed.blocklyComment .blocklyCommentPreview {
  visibility: visible;
}

.blocklyCollapsed.blocklyComment .blocklyCommentForeignObject,
.blocklyCollapsed.blocklyComment .blocklyResizeHandle {
  display: none;
}

.blocklyCollapsed.blocklyComment .blocklyFoldoutIcon {
  transform: rotate(-90deg);
}

.blocklyRTL .blocklyCommentTopbar {
  transform: scale(-1, 1);
}

.blocklyRTL .blocklyCommentForeignObject {
  direction: rtl;
}

.blocklyRTL .blocklyCommentPreview {
  /* Revert the scale and control RTL using direction instead. */
  transform: scale(-1, 1);
  direction: rtl;
}

.blocklyRTL .blocklyResizeHandle {
  transform: scale(-1, 1);
  cursor: sw-resize;
}

.blocklyCommentHighlight {
  fill: none;
}

.blocklyCommentText.blocklyActiveFocus {
  border-color: #fc3;
  border-width: 2px;
}

.blocklySelected .blocklyCommentHighlight {
  stroke: #fc3;
  stroke-width: 3px;
}

.blocklyCollapsed.blocklySelected .blocklyCommentHighlight {
  stroke: none;
}

.blocklyCollapsed.blocklySelected .blocklyCommentTopbarBackground {
  stroke: #fc3;
  stroke-width: 3px;
}

.blocklyTextInputBubble .blocklyTextarea {
  background-color: var(--commentFillColour);
  border: 0;
  box-sizing: border-box;
  display: block;
  outline: 0;
  padding: 5px;
  resize: none;
  width: 100%;
  height: 100%;
}

.blocklyFlyoutButton {
  fill: #888;
  cursor: default;
}

.blocklyFlyoutButtonShadow {
  fill: #666;
}

@media (hover: hover) {
  .blocklyFlyoutButton:hover {
    fill: #aaa;
  }
}

.blocklyFlyoutButton:active {
  fill: #aaa;
}

.blocklyFlyoutLabel {
  cursor: default;
}

.blocklyFlyoutLabelBackground {
  opacity: 0;
}

.blocklyToolboxCategory:not(.blocklyToolboxSelected):hover {
  background-color: rgba(255, 255, 255, .2);
}

.blocklyToolbox[layout="h"] .blocklyToolboxCategoryContainer {
  margin: 1px 5px 1px 0;
}

.blocklyToolbox[dir="RTL"][layout="h"] .blocklyToolboxCategoryContainer {
  margin: 1px 0 1px 5px;
}

.blocklyToolboxCategory {
  height: 22px;
  line-height: 22px;
  margin-bottom: 3px;
  padding-right: 8px;
  white-space: nowrap;
}

.blocklyToolbox[dir="RTL"] .blocklyToolboxCategory {
  margin-left: 8px;
  padding-right: 0;
}

.blocklyToolboxCategoryIcon {
  background-image: url(./sprites.png);
  height: 16px;
  vertical-align: middle;
  visibility: hidden;
  width: 16px;
}

.blocklyToolboxCategoryIconClosed {
  background-position: -32px -1px;
}

.blocklyToolbox[dir="RTL"] .blocklyToolboxCategoryIconClosed {
  background-position: 0 -1px;
}

.blocklyToolboxSelected>.blocklyToolboxCategoryIconClosed {
  background-position: -32px -17px;
}

.blocklyToolbox[dir="RTL"] .blocklyToolboxSelected>.blocklyToolboxCategoryIconClosed {
  background-position: 0 -17px;
}

.blocklyToolboxCategoryIconOpen {
  background-position: -16px -1px;
}

.blocklyToolboxSelected>.blocklyToolboxCategoryIconOpen {
  background-position: -16px -17px;
}

.blocklyToolboxCategoryLabel {
  cursor: default;
  font: 16px sans-serif;
  padding: 0 3px;
  vertical-align: middle;
}

.blocklyToolboxDelete .blocklyToolboxCategoryLabel {
  cursor: url("./handdelete.cur"), auto;
}

.blocklyToolboxSelected .blocklyToolboxCategoryLabel {
  color: #fff;
}

.blocklyTreeSeparator {
  border-bottom: solid #e5e5e5 1px;
  height: 0;
  margin: 5px 0;
}

.blocklyToolbox[layout="h"] .blocklyTreeSeparator {
  border-right: solid #e5e5e5 1px;
  border-bottom: none;
  height: auto;
  margin: 0 5px 0 5px;
  padding: 5px 0;
  width: 0;
}

.blocklyToolboxDelete {
  cursor: url("./handdelete.cur"), auto;
}

.blocklyToolboxGrab {
  cursor: url("./handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

/* Category tree in Toolbox. */
.blocklyToolbox {
  box-sizing: border-box;
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  background-color: #ddd;
  overflow-x: visible;
  overflow-y: auto;
  padding: 4px 0 4px 0;
  position: absolute;
  z-index: 70;  /* so blocks go under toolbox when dragging */
  -webkit-tap-highlight-color: transparent;  /* issue #1345 */
}

.blocklyToolboxCategoryGroup {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

.blocklyToolboxCategoryGroup:focus {
  outline: none;
}

.blocklyHtmlTextAreaInput {
  font-family: monospace;
  resize: none;
  overflow: hidden;
  height: 100%;
  text-align: left;
}

.blocklyHtmlTextAreaInputOverflowedY {
  overflow-y: scroll;
}
`
