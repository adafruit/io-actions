/**
 * @import Blockly from "blockly"
 */

/**
 * @typedef {object} BlockConnections
 * @prop {string} mode "value", "statement"
 * @prop {string|string[]} output what kinds of blocks can be inserted here?
 */

/**
 * @typedef {object} BlockExtensionFunctionInjectable
 * @prop {Blockly.Block} block
 */

/**
 * @callback BlockExtensionFunction
 * @param {BlockExtensionFunctionInjectable} injectables
 */

/**
 * @typedef {Object.<string, BlockExtensionFunction>} BlockExtensions
 */

/**
 * @callback BlockGenerator
 * @param {Blockly.Block} block
 * @param {Blockly.Generator} generator
 */

/**
 * @typedef {Object.<string, BlockGenerator>} BlockGenerators
 */

/**
 * @typedef {object} BlockRegeneratorHelpers
 * @property {function} expressionToBlock
 */

/**
 * @callback BlockRegenerator
 * @param {Object.<string, Object<?,?>>} blockObject
 * @param {BlockRegeneratorHelpers} helpers
 */

/**
 * @typedef {Object.<string, BlockRegenerator>} BlockRegenerators
 */

/**
 * A plain-old JavaScript object that provides shortcuts for specifying a
 * Blockly Block. It can export:
 * - Blockly's block JSON format
 * - Blockly's block instance JSON format
 * - documentation fragments
 *
 * @typedef {object} BlockDefinitionRaw
 * @prop {string} type unique string to identify this kind of block internally
 * @prop {string=} bytecodeKey the unique key this block gets serialized to
 * @prop {string} name unique string we use when talking about a block
 * @prop {boolean=} inputsInline Blockly pass-through property that determines
 *   how the block is rendered
 * @prop {(number|string)=} color A number or string from 0-360 that specifies a
 *   color in Blockly's radial color space
 * @prop {(number|string)=} colour Alias for "color"
 * @prop {string=} primaryCategory For blocks appearing in multiple categories,
 *   this property determines which menu this block will appear under in the
 *   docs.
 * @prop {string} description Markdown documentation for this block. The first
 *   line will be automatically set as the Block's tooltip.
 * @prop {BlockConnections} connections
 * @prop {BlockExtensions=} extensions
 * @prop {string} template
 * @prop {object=} fields
 * @prop {object=} inputs
 * @prop {BlockGenerators=} generators
 * @prop {BlockRegenerators=} regenerators
 */
