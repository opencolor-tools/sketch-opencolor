import log from '../utils/log'
import { SKETCH_PLUGIN_IDENTIFIER, selectOcoFile } from '../utils/oco-sketch'
import { parentArtboardForObject } from '../utils/sketch-dom'

export default function linkArtboard (context) {
  var command = context.command
  let layer = context.selection.firstObject()
  if (!layer) { return }
  var artboard = parentArtboardForObject(layer)

  if (!artboard) { return }
  var value = command.valueForKey_onLayer_forPluginIdentifier('ocoPalette', artboard, SKETCH_PLUGIN_IDENTIFIER)

  var result = selectOcoFile('Select a palette to connect to the current Artboard', 'Connect', '' + value, true)
  if (!result) { return }

  command.setValue_forKey_onLayer_forPluginIdentifier(String(result), 'ocoPalette', artboard, SKETCH_PLUGIN_IDENTIFIER)
}
