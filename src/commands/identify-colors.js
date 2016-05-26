import {STYLE_TYPES, STYLE_ICONS, getNameLookupForLayer} from '../utils/oco-sketch'
import {getStyleColor} from '../utils/sketch-dom'
import {notifyTutorial} from '../utils/oco-tutorial'
var oco = require('opencolor')

export default function identifyColors(context) {
  var command = context.command;
  let layer = context.selection.firstObject();

  var nameLookup = getNameLookupForLayer(command, layer); 
  if (!nameLookup) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.');
    return;
  }

  var identifiedStyles = [];
  if(layer.isKindOfClass(MSTextLayer.class())) {
    var color = '#' + layer.textColor().hexValue();
    if (nameLookup[color]) {
      identifiedStyles.push({
        'type': 'text',
        'value': color,
        'colors': nameLookup[color]
      });
    }
  } else {
    STYLE_TYPES.forEach((type) => {
      var color = getStyleColor(layer, type);
      if (nameLookup[color]) {
        identifiedStyles.push({
          'type': type,
          'value': color,
          'colors': nameLookup[color]
        });
      }
    });
  }

  if (identifiedStyles.length > 0) {
    var str = '';
    var info = identifiedStyles.map((style) => {
      str += STYLE_ICONS[style.type] + ' ' + style.type.toUpperCase() + ' ';
      return style.colors.map((color) => {
        str += color.path + ' ';
        return color.path;
      });
    });
    info = [].concat.apply([], info);
    context.document.showMessage('🌈 ' + str);
  } else {
    context.document.showMessage('🌈 No color identified');
  }

  notifyTutorial(context, 'identifyColors');
}
