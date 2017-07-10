import log from '../utils/log'
import { SKETCH_PLUGIN_IDENTIFIER, COLOR_TYPES, getOcoTreeForLayer } from '../utils/oco-sketch'
import { createAlert, createLabel, createSelect } from '../utils/sketch-ui'
import { layersWithChildren } from '../utils/sketch-dom'
import { getSignature } from '../utils/oco'
import updateColors from './update-colors'

function intersect (a, b) {
  var t
  if (b.length > a.length) {
    t = b
    b = a
    a = t // indexOf to loop over shorter
  }
  return a.filter((e) => {
    return (b.indexOf(e) !== -1)
  })
}

export default function swapTheme (context) {
  if (!context.selection.count()) {
    context.document.showMessage('Select layers first')
    return
  }

  const requestedPaths = []
  layersWithChildren(context.selection).forEach(function (layer) {
    COLOR_TYPES.forEach(function (styleType) {
      var entryName = '' + context.command.valueForKey_onLayer_forPluginIdentifier('oco_defines_' + styleType, layer, SKETCH_PLUGIN_IDENTIFIER)
      if (!entryName) {
        return
      }
      if (requestedPaths.indexOf(entryName) === -1) { requestedPaths.push(entryName) }
    })
  })
  let signature = []
  let assignedThemes = {}
  requestedPaths.forEach((path) => {
    var pathSpec = path.split('.')
    if (pathSpec.length === 2) {
      assignedThemes[pathSpec[0]] = true
      signature.push(pathSpec[1])
    }
  })
  assignedThemes = Object.keys(assignedThemes)
  let selectedTheme = assignedThemes.length ? assignedThemes[0] : ''

  signature = signature.sort()

  var palette = getOcoTreeForLayer(context.command, context.selection.firstObject())
  if (!palette) {
    context.document.showMessage('⛈ Connect Artboard with Palette or update settings, first.')
    return
  }

  const themes = {}
  palette.traverseTree(['Palette'], (entry) => {
    themes[entry.path()] = getSignature(entry)
  })

  const matchingThemes = []

  Object.keys(themes).forEach((path) => {
    var themeSignature = themes[path]
    if (intersect(signature, themeSignature).length === signature.length) {
      matchingThemes.push(path)
    }
  })

  var alert = createAlert('Swap Theme', 'Find and Replaces all assigned color names', 'icon.png')
  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 60))

  var fromValues = ['*'].concat(assignedThemes)
  var uiSelectFrom = createSelect(fromValues, 0, NSMakeRect(80, 30, 200, 22), true)
  listView.addSubview(createLabel('From', NSMakeRect(0, 30, 80, 22), 12, true))
  listView.addSubview(uiSelectFrom)

  var firstNotSelected = matchingThemes.indexOf(selectedTheme) > 0 ? 0 : 1

  var uiSelectTo = createSelect(matchingThemes, firstNotSelected, NSMakeRect(80, 0, 200, 22), true)
  listView.addSubview(createLabel('To', NSMakeRect(0, 0, 80, 22), 12, true))
  listView.addSubview(uiSelectTo)

  alert.addAccessoryView(listView)

  alert.addButtonWithTitle('Swap Theme')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return
  }

  var fromThemeIndex = uiSelectFrom.indexOfSelectedItem()
  var toThemeIndex = uiSelectTo.indexOfSelectedItem()

  var fromTheme = fromValues[fromThemeIndex]
  var toTheme = matchingThemes[toThemeIndex]

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

      var pathSpec = existingValue.split('.')
      if (pathSpec.length === 2) {
        if (fromTheme == '*') { // eslint-disable-line eqeqeq
          pathSpec[0] = toTheme
        } else {
          pathSpec[0] = pathSpec[0].replace(fromTheme, toTheme)
        }
      }
      var newValue = pathSpec.join('.')

      if (newValue === existingValue) {
        info.error = 'not matching'
        return
      }

      info.to = newValue
      context.command.setValue_forKey_onLayer_forPluginIdentifier(String(newValue), 'oco_defines_' + styleType, layer, SKETCH_PLUGIN_IDENTIFIER)

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

  var title = `Swapped ${replacementCounts} values in ${changes.length} Layers (while searching in ${selectionWithChildren.length} layers).`
  var details = 'Replacements:\n\n'
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
      details += key + '\n'
      errors[key].forEach(function (replacementInfo) {
        details += '🚨 ' + replacementInfo.error
        details += ' › ' + replacementInfo.from + ' › ' + replacementInfo.to + '\n'
        details += '\n'
      })
      var alert = createAlert(title, details, 'icon.png')
      alert.addButtonWithTitle('Done!')
      alert.runModal()
    })
  }
}
