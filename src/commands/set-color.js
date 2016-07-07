import { STYLE_TYPES, STYLE_ICONS, getNameLookupForLayer, getLinkedPaletteForObject } from '../utils/oco-sketch'
import { getStyleColor, arrayify } from '../utils/sketch-dom'
import { getName } from '../utils/oco'
import { createAlert, createComboBox, createLabel } from '../utils/sketch-ui'
import updateColors from './update-colors'

export default function setColor (context) {
  let command = context.command
  let layer = context.selection.firstObject()
  let paletteName = getName(getLinkedPaletteForObject(command, layer))
  var nameLookup = getNameLookupForLayer(command, layer)
  if (!nameLookup) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.')
    return
  }

  var identifiedStyles = []
  if (layer.isKindOfClass(MSTextLayer.class())) {
    var color = '#' + layer.textColor().hexValue()
    if (color) {
      identifiedStyles.push({
        'type': 'text',
        'value': color,
        'colors': nameLookup[color] || []
      })
    }
  } else {
    STYLE_TYPES.forEach((type) => {
      var color = getStyleColor(layer, type)
      if (color) {
        identifiedStyles.push({
          'type': type,
          'value': color,
          'colors': nameLookup[color] || []
        })
      }
    })
  }

  // build ui for identifiedStyles
  var definedNames = []
  Object.keys(nameLookup).forEach(function (k) {
    var paths = nameLookup[k].map(name => name.path)
    definedNames = definedNames.concat(paths)
  })
  definedNames = definedNames.sort()

  var alert = createAlert(`Set Color · ${paletteName}`, `Update the color of the following styles based on values in ${paletteName} palette.`)

  var nSelected = context.selection.count()
  if (nSelected > 1) {
    var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 20))
    listView.addSubview(createLabel(`Save sets the color on ${nSelected} selected layers`, NSMakeRect(0, 0, 300, 20), 10))
    alert.addAccessoryView(listView)
  }

  identifiedStyles.forEach((style, index) => {
    var values = [''].concat(definedNames)
    var selectedValue = null

    var existingValue = command.valueForKey_onLayer('oco_defines_' + style.type, layer)

    let saveIndicator = ''
    if (existingValue && existingValue != '') { // eslint-disable-line eqeqeq
      selectedValue = existingValue
      saveIndicator = ' › linked as'
    } else if (style.colors.length) {
      saveIndicator = ' › identified as'
      selectedValue = style.colors[0].path
      values = style.colors.map(name => name.path).concat(values)
    }

    var uiSelect = createComboBox(values, 0, NSMakeRect(0, 0, 300, 25), true)
    if (selectedValue) {
      uiSelect.setStringValue(selectedValue)
    }

    var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
    listView.addSubview(createLabel(STYLE_ICONS[style.type] + ' ' + style.type + saveIndicator, NSMakeRect(0, 30, 300, 20), 12))
    listView.addSubview(uiSelect)
    alert.addAccessoryView(listView)
    identifiedStyles[index].uiSelect = uiSelect
  })

  alert.addButtonWithTitle('Save')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return null
  }

  identifiedStyles.forEach((style) => {
    var value = style.uiSelect.stringValue()
    if (!value || value == '') { // eslint-disable-line eqeqeq
      value = style.uiSelect.objectValueOfSelectedItem()
    }

    arrayify(context.selection).forEach(function (layer) {
      command.setValue_forKey_onLayer(String(value), 'oco_defines_' + style.type, layer)
    })
  })

  updateColors(context)
}
