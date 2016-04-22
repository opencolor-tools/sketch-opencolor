import {getLibFolder} from '../utils/oco-sketch';
import {createAlert} from '../utils/sketch-ui';

export default function showInfo(context) {

  var title = 'Open Color Tools';
  var message = `
Thank you for using Open Color Tools.
Open Color Tools works best with its companion app.

–

· Library: ${getLibFolder()}

-

Need more info or support?
Please visit http://opencolor.tools
`;

  var alert = createAlert(title, message);

  alert.addButtonWithTitle('Visit Website');
  alert.addButtonWithTitle('Cancel');

  var responseCode = alert.runModal();
  if(responseCode != '1000') {
    return null;
  }

  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(String('http://opencolor.tools')));

}
