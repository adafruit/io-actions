import Blockly from 'blockly'

import BLOCKLY_CSS from "#src/blockly_css.js"


// right-click menu items
export const imageExportRegistryItems = [
  {
    id: "block-svg",
    displayText: 'Save Block as SVG...',
    weight: 100,
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    preconditionFn: () => "enabled",
    callback: scope => {
      const { id, type } = scope.block
      downloadBlockAsSVG(id, type)
    }
  }, {
    id: "block-png",
    displayText: 'Save Block as PNG...',
    weight: 100,
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    preconditionFn: () => "enabled",
    callback: scope => {
      const { id, type } = scope.block
      downloadBlockAsPNG(id, type)
    }
  }
]

// export block image stuff
const blockToSVGBlob = (blockId) => {
  const
    workspace = Blockly.getMainWorkspace(),
    // blockly object
    block = workspace.getBlockById(blockId),
    // svg/dom element
    blockElement = workspace.svgBlockCanvas_.querySelector(`[data-id="${block.id}"`),
    // remember where block was
    blockTransform = blockElement.getAttribute("transform")

  // remove yellow highlight border
  block.unselect()
  // move block to 0,0
  blockElement.removeAttribute("transform")

  const
    blockContent = new XMLSerializer().serializeToString(blockElement),
    // block dimensions
    { x, y, width, height } = blockElement.getBBox(),
    // svg tag attributes
    widthAttr = `width="${width}"`,
    heightAttr = `height="${height}"`,
    viewBoxAttr = `viewBox="${x} ${y} ${width} ${height}"`,
    // all css active on the svg
    css = "<style>\n" + BLOCKLY_CSS + "\n</style>",
    // build a new svg of just this block
    xml =
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${widthAttr} ${heightAttr} ${viewBoxAttr}>
      ${css}
      ${blockContent}
    </svg>`,
    // turn it into an object url for easy sharing
    svgBlob = new Blob([xml], { type: 'image/svg+xml;base64' }),
    svgUrl = URL.createObjectURL(svgBlob)

  // put the block back where it was
  blockElement.setAttribute("transform", blockTransform)

  return svgUrl
}

const
  download = (url, filename) => {
    const element = document.createElement('a')
    element.href = url
    element.download = filename
    element.click()
    URL.revokeObjectURL(element.href)
  },

  downloadBlockAsSVG = (blockId, blockType) => {
    const svgObjectURL = blockToSVGBlob(blockId)

    download(svgObjectURL, `${blockType}.svg`)
  },

  downloadBlockAsPNG = (blockId, blockType) => {
    const
      svgObjectURL = blockToSVGBlob(blockId),
      img = new Image()

    img.onload = function() {
      // draw this image into a canvas of the same dimensions
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext("2d").drawImage(img, 0, 0)

      // extract a png object url from the canvas and download it
      const pngObjectURL = canvas.toDataURL("image/png")
      download(pngObjectURL, `${blockType}.png`)
    }

    img.src = svgObjectURL
  }
