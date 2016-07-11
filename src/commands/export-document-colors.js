import { getLibFolder } from '../utils/oco-sketch'
import { ocoFiles } from '../utils/oco'
import { createAlert, createComboBox, createLabel } from '../utils/sketch-ui'
import { hasMSArray } from '../utils/sketch-deprecated'
import { arrayify } from '../utils/sketch-dom'

var oco = require('opencolor')
import { ntc } from '../vendor/ntc'

export default function exportFromArtboard (context) {
  var ocoPalette = new oco.Entry('Root')

  var alert = createAlert('Export Document Colors', 'Choose a new name to create a new palette or choose an existing one.')

  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  listView.addSubview(createLabel('Palette Name', NSMakeRect(0, 30, 300, 20), 12))

  var existingPalettes = ocoFiles().map(f => f.name)

  var uiSelect = createComboBox(existingPalettes, 0, NSMakeRect(0, 0, 300, 25), true)
  uiSelect.setStringValue('export.oco')
  listView.addSubview(uiSelect)

  alert.addAccessoryView(listView)

  alert.addButtonWithTitle('Export')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return null
  }

  var exportName = uiSelect.stringValue()

  if (!exportName || exportName == '') { // eslint-disable-line eqeqeq
    exportName = uiSelect.objectValueOfSelectedItem()
  }

  if (exportName.indexOf('.oco') === -1) {
    exportName += '.oco'
  }

  var colors = null
  if (hasMSArray()) {
    colors = context.document.documentData().assets().primitiveColors().array()
    colors = arrayify(colors)
  } else {
    colors = context.document.documentData().assets().primitiveColors()
  }
  var usedNames = {}

  ntc.init()

  colors.forEach(function (color, i) {
    var hexValue = '#' + color.hexValue()
    var name = ntc.name(hexValue)[1]

    if (Object.keys(usedNames).indexOf(name) !== -1) {
      usedNames[name]++
      name = name + ' - ' + usedNames[name]
    } else {
      usedNames[name] = 1
    }
    var colorEntry = new oco.Entry(name, [], 'Color')

    colorEntry.addChild(oco.ColorValue.fromColorValue('#' + color.hexValue()), true)
    ocoPalette.addChild(colorEntry)
  })

  var ocoString = oco.render(ocoPalette)
  var filePath = getLibFolder() + '/' + exportName.replace('/', '')

  var nsOcoString = NSString.alloc().init().stringByAppendingString(ocoString)
  nsOcoString.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(filePath, true)

  context.document.showMessage('🌈 Saved in Open Color Library!')
}
