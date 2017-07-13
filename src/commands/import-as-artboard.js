import { SKETCH_PLUGIN_IDENTIFIER, selectOcoFile } from '../utils/oco-sketch'
import { ocoCachePath } from '../utils/oco'
import { colorFromHex } from '../utils/sketch-dom'
import { parse } from 'opencolor'

const FILL = 0

export default function importAsArtboard (context) {
  // create file enumerator for presetsPath
  // clear them
  var command = context.command
  var result = selectOcoFile('Select a palette to import as document colors', 'Import')
  if (!result) { return }

  var ocoString = NSString.stringWithContentsOfFile(ocoCachePath() + '/' + result)
  var tree = parse(ocoString + '\n')
  var artboard = MSArtboardGroup.new()
  var artboardWidth = 400

  var pathParts = result.split('/')
  var fileName = pathParts[pathParts.length - 1]
  artboard.setName(`${fileName} · Visual Colors`)
  command.setValue_forKey_onLayer_forPluginIdentifier(String(result), 'ocoPalette', artboard, SKETCH_PLUGIN_IDENTIFIER)

  var padding = 20
  var x = padding
  var height = 40
  var width = artboardWidth - 2 * padding
  var artboardHeight = padding * 2
  var index = 0
  tree.traverseTree(['Color'], (entry) => {
    var rect = MSRectangleShape.alloc().init()
    rect.frame().setX(x)
    rect.frame().setY(padding + (height + padding) * index)
    artboardHeight += (height + padding)
    rect.frame().setWidth(width)
    rect.frame().setHeight(height)
    rect.setName(entry.path())
    rect.setNameIsFixed(true)
    var group = MSShapeGroup.shapeWithPath(rect)
    var fill = group.style().addStylePartOfType(FILL)
    fill.color = colorFromHex(entry.hexcolor())
    artboard.addLayers([group])

    command.setValue_forKey_onLayer_forPluginIdentifier(entry.path(), 'oco_defines_fill', group, SKETCH_PLUGIN_IDENTIFIER)

    index++
  })

  var frame = artboard.frame()
  frame.setX(0)
  frame.setY(0)
  frame.setWidth(artboardWidth)
  frame.setHeight(artboardHeight)

  context.document.currentPage().addLayers([artboard])
}
