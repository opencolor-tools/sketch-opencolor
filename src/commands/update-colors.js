import { COLOR_TYPES, getOcoTreeForLayer } from '../utils/oco-sketch'
import { layersWithChildren, setStyleColor } from '../utils/sketch-dom'

export default function updateLinkedColors (context) {
  if (!context.selection.count()) {
    context.document.showMessage('⛈ Select layers, first')
    return
  }

  var palette = getOcoTreeForLayer(context.command, context.selection.firstObject())

  if (!palette) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.')
    return
  }

  layersWithChildren(context.selection).forEach(function (layer) {
    COLOR_TYPES.forEach(function (styleType) {
      var entryName = '' + context.command.valueForKey_onLayer('oco_defines_' + styleType, layer)
      if (!entryName) {
        return
      }
      var entry = palette.get(entryName)
      if (!entry) {
        return
      }
      if (entry.type == 'Reference') { // eslint-disable-line eqeqeq
        entry = entry.resolved()
        if (!entry) {
          return
        }
      }
      if (styleType == 'text') { // eslint-disable-line eqeqeq
        layer.setTextColor(MSColor.colorWithSVGString(entry.hexcolor()))
      } else {
        setStyleColor(layer, styleType, entry.hexcolor())
      }
    })
  })
}
