import { SKETCH_PLUGIN_IDENTIFIER, selectOcoFile } from '../utils/oco-sketch'
import { ocoCachePath } from '../utils/oco'
import { colorFromHex } from '../utils/sketch-dom'
import { parse } from 'opencolor'

const COLOR_GROUP_WIDTH = 300
const COLOR_GROUP_PADDING = 20
const COLOR_GROUP_MARGIN = 40
const COLOR_SWATCH_HEIGHT = 20

export default function importPalette (context) {
  let command = context.command

  let ocoFileName = selectOcoFile('Select a palette to import', 'Import')
  if (!ocoFileName) { return }

  let setMetadata = (layer, metadata) => {
    let storedMetadata = {}
    metadata.keys().forEach(key => {
      let value = metadata.get(key)
      if (value.type === 'Reference') value = '=' + value.refName
      storedMetadata[key] = value
    })

    command.setValue_forKey_onLayer_forPluginIdentifier(JSON.stringify(storedMetadata), 'oco_metadata', layer, SKETCH_PLUGIN_IDENTIFIER)
  }

  // create new page for palette
  let ocoString = String(NSString.stringWithContentsOfFile(ocoCachePath() + '/' + ocoFileName))
  let ocoPalette = parse(ocoString + '\n')
  let page = context.document.addBlankPage()
  page.setName(ocoFileName.split('.')[0])
  context.document.setCurrentPage(page)
  setMetadata(page, ocoPalette.metadata)

  // create color groups
  let artboards = []
  ocoPalette.children.forEach((colorGroup, i) => {
    let artboard = MSArtboardGroup.new()
    artboard.setName(colorGroup.name)
    command.setValue_forKey_onLayer_forPluginIdentifier(ocoFileName, 'ocoPalette', artboard, SKETCH_PLUGIN_IDENTIFIER)
    setMetadata(artboard, colorGroup.metadata)

    // create color swatches
    let swatches = []
    colorGroup.children.forEach((color, j) => {
      let rect = MSRectangleShape.alloc().init()
      rect.frame().setX(COLOR_GROUP_PADDING)
      rect.frame().setY(COLOR_GROUP_PADDING + (COLOR_SWATCH_HEIGHT + COLOR_GROUP_PADDING) * j)
      rect.frame().setWidth(COLOR_GROUP_WIDTH - COLOR_GROUP_PADDING * 2)
      rect.frame().setHeight(COLOR_SWATCH_HEIGHT)
      rect.setName(color.name)
      rect.setNameIsFixed(true)
      let colorSwatch = MSShapeGroup.shapeWithPath(rect)
      let fill = colorSwatch.style().addStylePartOfType(0)
      fill.color = colorFromHex(color.hexcolor())
      swatches.push(colorSwatch)
    })
    artboard.addLayers(swatches.reverse())

    // set color group artboard frame
    artboard.frame().setX(i * COLOR_GROUP_WIDTH + i * COLOR_GROUP_MARGIN)
    artboard.frame().setY(0)
    artboard.frame().setWidth(COLOR_GROUP_WIDTH)
    artboard.frame().setHeight(COLOR_GROUP_PADDING + colorGroup.children.length * (COLOR_SWATCH_HEIGHT + COLOR_GROUP_PADDING))
    artboards.push(artboard)
  })

  context.document.currentPage().addLayers(artboards.reverse())
}
