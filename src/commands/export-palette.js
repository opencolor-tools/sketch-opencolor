import { arrayify, getStyleColor } from '../utils/sketch-dom'
import { SKETCH_PLUGIN_IDENTIFIER, getLibFolder, openApp } from '../utils/oco-sketch'
import { createAlert, createLabel, createComboBox } from '../utils/sketch-ui'
import { ocoFiles } from '../utils/oco'
import { Entry, ColorValue, render } from 'opencolor'

export default function exportPalette (context) {
  let page = context.document.currentPage()
  let artboards = page.artboards()
  let command = context.command

  let getMetadata = (layer) => {
    let stringifiedMetadata = command.valueForKey_onLayer_forPluginIdentifier('oco_metadata', layer, SKETCH_PLUGIN_IDENTIFIER)
    return stringifiedMetadata ? JSON.parse(stringifiedMetadata) : {}
  }

  // create palette
  let ocoPalette = new Entry()
  let paletteMetadata = getMetadata(page)
  Object.keys(paletteMetadata).forEach(key => {
    ocoPalette.metadata.set(key, paletteMetadata[key])
  })

  // create color groups
  arrayify(artboards).forEach(artboard => {
    let colorGroup = new Entry()
    let colorGroupMetadata = getMetadata(artboard)
    Object.keys(colorGroupMetadata).forEach(key => {
      colorGroup.metadata.set(key, colorGroupMetadata[key])
    })
    ocoPalette.set(artboard.name(), colorGroup)

    // sort and filter swatches
    let children = arrayify(artboard.children()).sort((a, b) => {
      return a.absoluteRect().y() - b.absoluteRect().y()
    }).filter(child => {
      return child.isKindOfClass(MSShapeGroup) && String(child.name()) !== '.'
    })

    // create colors
    children.forEach(child => {
      let colorName = child.name().split('.').pop()
      let colorValue = getStyleColor(child, 'fill')
      let colorEntry = new Entry(colorName, [ColorValue.fromColorValue(colorValue)], 'Color')
      colorGroup.set(colorName, colorEntry)
    })
  })

  // ask to save palette
  let alert = createAlert('Export Palette', 'Save the exported palette into an OCO file.')

  let listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  listView.addSubview(createLabel('Enter a new name or overwrite an existing palette:', NSMakeRect(0, 30, 300, 20), 12))

  let existingPalettes = ocoFiles().map(file => file.name.replace('.oco', ''))
  let uiSelect = createComboBox(existingPalettes, 0, NSMakeRect(0, 0, 300, 25), true)

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
