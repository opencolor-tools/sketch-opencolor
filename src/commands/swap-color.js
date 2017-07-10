import log from '../utils/log'
import { SKETCH_PLUGIN_IDENTIFIER, COLOR_TYPES, getColorLookupForLayer } from '../utils/oco-sketch'
import { createAlert, createLabel } from '../utils/sketch-ui'
import { layersWithChildren } from '../utils/sketch-dom'
import updateColors from './update-colors'

export default function swapColor (context) {
  if (!context.selection.count()) {
    context.document.showMessage('Select layers first.')
    return
  }

  var colorLookup = getColorLookupForLayer(context.command, context.selection.firstObject())

  if (!colorLookup) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.')
    return
  }

  var alert = createAlert('Swap Color', 'Finds and replaces strings in assigned color names of all selected layers and their children. Updates the color values based on the new names.', 'icon.png')
  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 110))

  var searchTextField = NSTextField.alloc().initWithFrame(NSMakeRect(80, 74, 200, 22))
  listView.addSubview(createLabel('Find', NSMakeRect(0, 74, 80, 22), 12, true))
  listView.addSubview(createLabel('You can use regular expression. e.g. "/^." to replace the first character.', NSMakeRect(80, 38, 200, 32), 10, false))
  listView.addSubview(searchTextField)

  var replaceTextField = NSTextField.alloc().initWithFrame(NSMakeRect(80, 10, 200, 22))
  listView.addSubview(createLabel('Replace', NSMakeRect(0, 10, 80, 22), 12, true))
  listView.addSubview(replaceTextField)

  alert.addAccessoryView(listView)

  alert.addButtonWithTitle('Update Color Names and Values')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return
  }

  var searchTerm = searchTextField.stringValue()
  if (searchTerm.indexOf('/') === 0) {
    try {
      searchTerm = new RegExp(searchTerm.replace('/', ''))
    } catch (e) {
      context.document.showMessage('Invalid Regular Expression: "' + searchTerm.replace('/', '') + '"')
      return
    }
  }
  var replaceTerm = replaceTextField.stringValue()
  var selectionWithChildren = layersWithChildren(context.selection)
  var changes = []
  var replacementCounts = 0

  selectionWithChildren.forEach(function (layer) {
    var replacements = []
    COLOR_TYPES.forEach(function (styleType) {
      var existingValue = context.command.valueForKey_onLayer_forPluginIdentifier('oco_defines_' + styleType, layer, SKETCH_PLUGIN_IDENTIFIER)

      if (!existingValue) {
        return
      }
      var info = {
        style: styleType,
        from: existingValue,
        error: false
      }
      var newValue = existingValue.replace(searchTerm, replaceTerm)
      info.to = newValue
      if (Object.keys(colorLookup).indexOf(newValue) === -1) {
        info.error = 'Not in palette'
      } else {
        context.command.setValue_forKey_onLayer_forPluginIdentifier(String(newValue), 'oco_defines_' + styleType, layer, SKETCH_PLUGIN_IDENTIFIER)
      }

      replacements.push(info)
    })
    replacementCounts += replacements.length
    if (replacements.length) {
      changes.push({
        layer: layer.name(),
        replacements: replacements
      })
    }
  })

  var title = `Found ${replacementCounts} values in ${changes.length} layers`
  var details = `searching in ${selectionWithChildren.length} layers\n\nErrors\n\n`
  var errors = {}

  updateColors(context)

  changes.forEach(function (info) {
    info.replacements.forEach(function (replacementInfo) {
      if (replacementInfo.error) {
        errors[info.layer] = errors[info.layer] || []
        errors[info.layer].push(replacementInfo)
      }
    })
  })

  if (Object.keys(errors).length === 0) {
    context.document.showMessage(`🌈 ${title}`)
  } else {
    Object.keys(errors).forEach(function (key) {
      details += '🚨 Layer: ' + key + '\n\n'
      errors[key].forEach(function (replacementInfo) {
        details += '· ' + replacementInfo.error
        details += ': from "' + replacementInfo.from + '" to "' + replacementInfo.to + '"\n'
        details += '\n'
      })
      var alert = createAlert(title, details, 'icon.png')
      alert.addButtonWithTitle('Done!')
      alert.runModal()
    })
  }
}
