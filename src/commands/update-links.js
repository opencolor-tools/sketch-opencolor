import {COLOR_TYPES, getColorLookupForLayer} from '../utils/oco-sketch'
import {createAlert, createLabel} from '../utils/sketch-ui';
import {arrayify} from '../utils/sketch-dom';

export default function updateLinks(context) {
  if(!context.selection.count()) {
    context.document.showMessage('Select layers first.');
    return;
  }

  var colorLookup = getColorLookupForLayer(context.command, context.selection.firstObject());
  log(colorLookup);
  if (!colorLookup) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.');
    return;
  }

  var alert = createAlert("Find and Replace", "Please configure replacement", "icon.png");
  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 60));

  var searchTextField = NSTextField.alloc().initWithFrame(NSMakeRect(80, 30, 200, 22));
  listView.addSubview(createLabel('Find', NSMakeRect(0, 30, 80, 22), 12, true));
  listView.addSubview(searchTextField);

  var replaceTextField = NSTextField.alloc().initWithFrame(NSMakeRect(80, 0, 200, 22));
  listView.addSubview(createLabel('Replace', NSMakeRect(0, 0, 80, 22), 12, true));
  listView.addSubview(replaceTextField);

  alert.addAccessoryView(listView);

  alert.addButtonWithTitle('Find, Replace & Update Colors');
  alert.addButtonWithTitle('Cancel');

  var responseCode = alert.runModal();
  if(responseCode != '1000') {
    return;
  }

  var searchTerm = searchTextField.stringValue();
  var replaceTerm = replaceTextField.stringValue();

  var replacements = [];
  var replacementCounts = 0;
  var affectedLayers = 0;

  arrayify(context.selection).forEach(function(layer) {
    var wasAffected = false;
    COLOR_TYPES.forEach(function(styleType) {

      var existingValue = context.command.valueForKey_onLayer('oco_defines_' + styleType, layer);

      if(!existingValue) {
        return;
      }
      var info = {
        from: existingValue,
        error: false
      }
      var newValue = existingValue.replace(searchTerm, replaceTerm);
      info.to = newValue;
      if(Object.keys(colorLookup).indexOf(newValue) == -1) {
        info.error = 'Not in palette'
      } else {
        context.command.setValue_forKey_onLayer(String(newValue), 'oco_defines_' + styleType, layer);
        wasAffected = true;
        replacementCounts++;
      }

      replacements.push(info);
    });
    if(wasAffected) {
      affectedLayers++;
    }
  });

  var title = "Replaced " + replacementCounts + " values in " + affectedLayers + " Layers (while searching in " + context.selection.count() + " layers).";
  var info = 'Replacements:\n\n';
  Object.keys(replacements).forEach(function(key) {
    var replacementInfo = replacements[key];
    if (replacementInfo.error) {
      info += '🚨 ' + replacementInfo.error + '\n'
    } else {
      info += '✅ '
    }
    info += replacementInfo.from + ' ➡︎ ' + replacementInfo.to + '\n';
  });
  var alert = createAlert(title, info, 'icon.png');
  alert.addButtonWithTitle('Doneke!');
  alert.addButtonWithTitle("Cancel");
  alert.runModal();
}
