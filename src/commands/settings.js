import {selectOcoFile, getDefaultPalette, setDefaultPalette} from '../utils/oco-sketch';
import {getName} from '../utils/oco';

export default function settings(context) {

  var result = selectOcoFile("The default palette is used to identity colors in any sketch document (when artboards are not linked to a palette)", "Set Default", getDefaultPalette(), true);
  if (!result) { return; }
  setDefaultPalette(result)

  context.document.showMessage(`Default set to ${getName(result)}`);
}
