import log from '../utils/log'
import { selectOcoFile, getDefaultPalette, setDefaultPalette } from '../utils/oco-sketch'
import { getName } from '../utils/oco'

export default function settings (context) {
  log('hello there settings')

  log('hello')

  /* global log */
  // let actualLog = log
  // log = function (message) {
  //   actualLog('PLUGIN: ' + message)
  // }

  var result = selectOcoFile('The default palette is used to identify colors in any sketch document (when artboards are not linked to a palette)', 'Set Default', getDefaultPalette(), true)
  if (!result) { return }
  setDefaultPalette(result)

  context.document.showMessage(`Default set to ${getName(result)}`)
}
