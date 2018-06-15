import { SKETCH_PLUGIN_IDENTIFIER } from '../utils/oco-sketch'
import { createAlert, createLabel, createComboBox, createTextField } from '../utils/sketch-ui'
import MochaJSDelegate from '../vendor/MochaJSDelegate'

export default function setMetadata (context) {
  // make sure that either there is no selection or an artboard is selected
  let command = context.command

  if (context.selection.count() > 1) {
    return context.document.showMessage('Please select a single artboard or remove selection.')
  }

  let selectedLayer = context.selection.firstObject()
  let targetLayer = null
  let isArtboard = false
  if (selectedLayer) {
    if (selectedLayer.isKindOfClass(MSArtboardGroup)) {
      targetLayer = selectedLayer
      isArtboard = true
    } else {
      return context.document.showMessage('Please select an artboard to add color group metadata. Unselect all layers to add global palette metadata.')
    }
  } else {
    targetLayer = context.document.currentPage()
  }

  // get metadata already stored on target layer
  let stringifiedMetadata = command.valueForKey_onLayer_forPluginIdentifier('oco_metadata', targetLayer, SKETCH_PLUGIN_IDENTIFIER)
  let storedMetadata = stringifiedMetadata ? JSON.parse(stringifiedMetadata) : {}

  // create alert
  let alert = createAlert(`Set ${(isArtboard) ? 'Color Group' : 'Palette'} Metadata`, 'Set a value for an existing or a new metadata key.')
  let alertView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 112))

  // create key selection
  alertView.addSubview(createLabel('Key:', NSMakeRect(0, 93, 300, 20), 12))
  let keys = Object.keys(storedMetadata)
  let keysComboBox = createComboBox(keys, 0, NSMakeRect(0, 63, 300, 25), true)
  alertView.addSubview(keysComboBox)

  // create value field
  alertView.addSubview(createLabel('Value:', NSMakeRect(0, 27, 300, 20), 12))
  let valueField = createTextField('some value', NSMakeRect(0, 0, 300, 22))
  alertView.addSubview(valueField)

  // select first key and display its value
  if (keys.length) {
    keysComboBox.setStringValue(keys[0])
    valueField.setStringValue(storedMetadata[keys[0]])
  }

  let updateValue = (key) => {
    let value = storedMetadata[key] || ''
    valueField.setStringValue(value)
  }

  // listen for changes to combobox text
  COScript.currentCOScript().setShouldKeepAround(true)
  let keysComboBoxDelegate = new MochaJSDelegate({
    'controlTextDidChange:': (notification) => {
      let key = notification.userInfo().objectForKey('NSFieldEditor').textStorage().string()
      updateValue(key)
    },
    'comboBoxSelectionDidChange:': (notification) => {
      let key = notification.object().objectValueOfSelectedItem()
      updateValue(key)
    }
  })
  keysComboBox.setDelegate(keysComboBoxDelegate.getClassInstance())

  alert.addAccessoryView(alertView)
  alert.addButtonWithTitle('Set')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    COScript.currentCOScript().setShouldKeepAround(false)
    return null
  }
  COScript.currentCOScript().setShouldKeepAround(false)

  // make change based on user entry
  let selectedKey = keysComboBox.stringValue()
  let providedValue = String(valueField.stringValue())
  if (providedValue.length) {
    storedMetadata[selectedKey] = providedValue
  } else {
    delete storedMetadata[selectedKey]
  }

  command.setValue_forKey_onLayer_forPluginIdentifier(JSON.stringify(storedMetadata), 'oco_metadata', targetLayer, SKETCH_PLUGIN_IDENTIFIER)
}
