import { COLOR_TYPES, STYLE_ICONS, getNameLookupForLayer } from '../utils/oco-sketch'
import { getStyleColor, hexColor } from '../utils/sketch-dom'
import { notifyTutorial } from '../utils/oco-tutorial'

export function identifyAll (context) {
  return identifyColors(context, COLOR_TYPES)
}

export function identifyFill (context) {
  return identifyColors(context, ['fill'])
}

export function identifyBorder (context) {
  return identifyColors(context, ['border'])
}

export function identifyText (context) {
  return identifyColors(context, ['text'])
}

function identifyColors (context, types) {
  var command = context.command
  let layer = context.selection.firstObject()

  var nameLookup = getNameLookupForLayer(command, layer)
  if (!nameLookup) {
    context.document.showMessage('⛈ Select layer, link artboard or set default palette.')
    return
  }

  var shouldIdentifyText = (types.indexOf('text') !== -1)
  var styleTypes = types.filter(t => t !== 'text')

  var identifiedStyles = []
  if (shouldIdentifyText && layer.isKindOfClass(MSTextLayer.class())) {
    var color = hexColor(layer.textColor())
    if (color && nameLookup[color]) {
      identifiedStyles.push({
        'type': 'text',
        'value': color,
        'colors': nameLookup[color]
      })
    }
  } else {
    styleTypes.forEach((type) => {
      var color = getStyleColor(layer, type)
      if (color && nameLookup[color]) {
        identifiedStyles.push({
          'type': type,
          'value': color,
          'colors': nameLookup[color]
        })
      }
    })
  }

  if (identifiedStyles.length > 0) {
    var str = ''
    var info = identifiedStyles.map((style) => { // eslint-disable-line no-unused-vars
      str += STYLE_ICONS[style.type] + ' ' + style.type.toUpperCase() + ': '
      return style.colors.map((color) => {
        str += color.path + ' '
        return color.path
      })
    })
    info = [].concat.apply([], info)
    context.document.showMessage('🌈 ' + str)
  } else {
    context.document.showMessage(`🌈 No ${types.join(', ')} color identified`)
  }

  notifyTutorial(context, 'identifyColors')
}
