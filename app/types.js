/**
 * @import Blockly from "blockly"
 */

/**
 * @typedef {object} BlockConnections
 * @prop {("value"|"statement")=} mode Is this block a value or statement?
 * @prop {string=} next Limits the blocks that can connect to the bottom of
 *   this statement block.
 * @prop {string|string[]=} output what kinds of blocks can be inserted here?
 */

/**
 * @typedef {object} BlockExtensionFunctionInjectable
 * @prop {Blockly.Block} block
 * @prop {function} observeData
 * @prop {object} data
 */

/**
 * @callback BlockExtensionFunction
 * @param {BlockExtensionFunctionInjectable} injectables
 */

/**
 * @typedef {string[]|Object.<string, BlockExtensionFunction>} BlockExtensions
 */

/**
 * @typedef {string|object} BlocklyMixin
 */

 /**
 * @typedef {BlocklyMixin[]} BlockMixins
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
 * @property {function} arrayToStatements
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
 * @prop {boolean=} ioPlus Indicates this block requires an IO+ account.
 * @prop {boolean=} disabled Marks this block for exclusion from all app and
 *   docs builds.
 * @prop {string} description Markdown documentation for this block. The first
 *   line will be automatically set as the Block's tooltip.
 * @prop {BlockConnections=} connections
 * @prop {BlockExtensions=} extensions
 * @prop {object=} mutator
 * @prop {BlockMixins=} mixins
 * @prop {string} template
 * @prop {object=} fields
 * @prop {object=} inputs
 * @prop {BlockGenerators=} generators
 * @prop {BlockRegenerators=} regenerators
 * @prop {object=} docOverrides
 */
