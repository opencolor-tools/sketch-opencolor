import {COLOR_TYPES, getColorLookupForLayer} from '../utils/oco-sketch'
import {createAlert, createLabel} from '../utils/sketch-ui';
import {arrayify, layersWithChildren} from '../utils/sketch-dom';
import updateLinkedColors from './update-linked-colors'

export default function updateLinks(context) {
  if(!context.selection.count()) {
    context.document.showMessage('Select layers first.');
    return;
  }

  var colorLookup = getColorLookupForLayer(context.command, context.selection.firstObject());

  if (!colorLookup) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.');
    return;
  }

  var alert = createAlert("Swap Color", "Find and Replaces all assigned color names", "icon.png");
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
  var selectionWithChildren = layersWithChildren(context.selection);
  var changes = [];
  var replacementCounts = 0;

  selectionWithChildren.forEach(function(layer) {
    var replacements = [];
    COLOR_TYPES.forEach(function(styleType) {

      var existingValue = context.command.valueForKey_onLayer('oco_defines_' + styleType, layer);

      if(!existingValue) {
        return;
      }
      var info = {
        style: styleType,
        from: existingValue,
        error: false
      }
      var newValue = existingValue.replace(searchTerm, replaceTerm);
      info.to = newValue;
      if(Object.keys(colorLookup).indexOf(newValue) == -1) {
        info.error = 'Not in palette'
      } else {
        context.command.setValue_forKey_onLayer(String(newValue), 'oco_defines_' + styleType, layer);
      }

      replacements.push(info);
    });
    replacementCounts += replacements.length;
    if (replacements.length) {
      changes.push({
        layer: layer.name(),
        replacements: replacements
      })
    }
  });

  var title = `Replaced ${replacementCounts} values in ${changes.length} Layers (while searching in ${selectionWithChildren.length} layers).`;
  var details = 'Replacements:\n\n';
  changes.forEach(function(info) {
    details += info.layer + '\n';
    info.replacements.forEach(function(replacementInfo) {
      if (replacementInfo.error) {
        details += '🚨 ' + replacementInfo.error + '\n'
      } else {
        details += '✅ ' + replacementInfo.style + '\n'
      }
      details += '  ' + replacementInfo.from + ' ➡︎ ' + replacementInfo.to + '\n';
    })
  });
  var alert = createAlert(title, details, 'icon.png');
  alert.addButtonWithTitle('Done!');

  updateLinkedColors(context);

  alert.runModal();
}
