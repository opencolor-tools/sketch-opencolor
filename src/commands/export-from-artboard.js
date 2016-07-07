import { arrayify, parentArtboardForObject, getStyleColor } from '../utils/sketch-dom'
import { STYLE_TYPES, getLibFolder, openApp } from '../utils/oco-sketch'
import { createAlert, createLabel, createComboBox } from '../utils/sketch-ui'
import { ocoFiles } from '../utils/oco'
import { hasMSArray } from '../utils/sketch-deprecated'
import { Entry, ColorValue, render } from 'opencolor'

export default function exportFromArtboard (context) {
  var command = context.command
  let layer = context.selection.firstObject()
  if (!layer) {
    context.document.showMessage('⛈ Select an artboard first.')
    return
  }
  var artboard = parentArtboardForObject(layer)
  if (!artboard) {
    context.document.showMessage('⛈ Select an artboard first.')
    return
  }
  var cachedPalettePath = command.valueForKey_onLayer('ocoPalette', artboard)
  if (!cachedPalettePath) {
    cachedPalettePath = 'new-palette'
  }
  // artboard
  var ocoPalette = new Entry()

  var children = artboard.children()
  if (hasMSArray()) {
    children = arrayify(children).reverse()
  } else {
    children = children.reverse()
  }
  children.forEach(function (child) {
    if (!child.isKindOfClass(MSShapeGroup)) {
      return
    }
    // var identit getIdentifyStyles(child)
    STYLE_TYPES.forEach((type) => {
      var dotPath = command.valueForKey_onLayer('oco_defines_' + type, child)
      if (!dotPath || dotPath == '') { // eslint-disable-line eqeqeq
        return
      }
      var colorValue = getStyleColor(child, type)
      var colorEntry = new Entry(dotPath.split('.').pop(), [ColorValue.fromColorValue(colorValue)], 'Color')
      ocoPalette.set(dotPath, colorEntry)
    })
  })

  var alert = createAlert('Export Palette', 'Enter a name for the palette')

  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  listView.addSubview(createLabel('Enter a new name or overwrite an existing palette:', NSMakeRect(0, 30, 300, 20), 12))

  var existingPalettes = ocoFiles().map(file => file.name.replace('.oco', ''))
  var uiSelect = createComboBox(existingPalettes, 0, NSMakeRect(0, 0, 300, 25), true)

  if (cachedPalettePath && cachedPalettePath != '') { // eslint-disable-line eqeqeq
    uiSelect.setStringValue(cachedPalettePath.split('/').pop().replace('.oco', ''))
  }

  listView.addSubview(uiSelect)
  alert.addAccessoryView(listView)

  alert.addButtonWithTitle('Save')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return null
  }

  // in memoriam to #sketcHHackday 2016 the following variable
  // should be call boooom
  var boooom = render(ocoPalette)

  var name = uiSelect.stringValue()
  if (!name || name == '') { // eslint-disable-line eqeqeq
    name = uiSelect.objectValueOfSelectedItem()
  }

  var filePath = getLibFolder() + name.replace('.oco', '') + '.oco'

  var nsBoooom = NSString.alloc().init().stringByAppendingString(boooom)
  nsBoooom.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(filePath, true)

  context.document.showMessage(`🌈 Saved as "${name}" in Open Color Library`)

  openApp()
}
