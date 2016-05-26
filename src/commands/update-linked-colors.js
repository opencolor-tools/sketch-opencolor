import {COLOR_TYPES, getColorLookupForLayer} from '../utils/oco-sketch'
import {createAlert, createLabel} from '../utils/sketch-ui';
import {arrayify, setStyleColor} from '../utils/sketch-dom';

export default function updateLinks(context) {
  if(!context.selection.count()) {
    context.document.showMessage('Select layers first.');
    return;
  }

  var palette = getOcoTreeForLayer(context.command, context.selection.firstObject());

  if (!palette) {
    context.document.showMessage('⛈ Connect Artboard with Palette, first.');
    return;
  }

  arrayify(context.selection).forEach(function(layer) {
    COLOR_TYPES.forEach(function(styleType) {

      var entryName = context.command.valueForKey_onLayer('oco_defines_' + styleType, layer);
      if(!entryName) {
        return;
      }
      var entry = palette.get(entryName);
      if(!entry) {
        return;
      }
      if(styleType == 'text') {
        layer.setTextColor(MSColor.colorWithSVGString(entry.hexcolor()));
      } else {
        setStyleColor(layer, styleType, entry.hexcolor());
      }
    });
  });

}