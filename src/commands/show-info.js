import log from '../utils/log'
import { getLibFolder, getDefaultPalette } from '../utils/oco-sketch'
import { createAlert } from '../utils/sketch-ui'
import { getName } from '../utils/oco'

export default function showInfo (context) {
  var title = 'Open Color Tools'
  var message = `
Thank you for using the Open Color Sketch Plugin.
The plugin works best with its companion app and the color picker.

Settings:
· Palette Library: ${getLibFolder()}
· Default Palette: ${(getName(getDefaultPalette()) || 'not set')}

Need support?
Want to learn more on designing with meaningful colors?

Please visit http://opencolor.tools
`

  var alert = createAlert(title, message)

  alert.addButtonWithTitle('Visit Website')
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return null
  }

  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(String('http://opencolor.tools')))
}
