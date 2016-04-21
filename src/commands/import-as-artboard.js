import {selectOcoFile} from '../utils/oco-sketch';
import {generateColorLookup} from '../utils/oco';
var oco = require('opencolor');

export default function importAsArtboard(context) {
  //create file enumerator for presetsPath
  // clear them
  var command = context.command;
  var result = selectOcoFile("Select a palette to import as document colors", "Import");
  if (!result) { return; }

  var ocoString = NSString.stringWithContentsOfFile(result);
  var tree = oco.parse(ocoString + "\n");
  var colorLookup = generateColorLookup(tree);

  var artboard = MSArtboardGroup.new()
  var artboardWidth = 400;

  var pathParts = result.split('/');
  var fileName = pathParts[pathParts.length - 1];
  artboard.setName(`${fileName} · Visual Colors`);
  command.setValue_forKey_onLayer(String(result), 'ocoPalette', artboard);


  var padding = 20;
  var x = padding;
  var height = 40;
  var width = artboardWidth - 2 * padding;
  var artboardHeight = padding * 2;

  Object.keys(colorLookup).forEach((dotPath, index) => {
    var color = colorLookup[dotPath];
    if(color.isReference) {
      return;
    }

    var rect = artboard.addLayerOfType('rectangle');
    rect.frame().setX(x);
    rect.frame().setY(padding + (height + padding) * index);
    artboardHeight += (height + padding);
    rect.frame().setWidth(width);
    rect.frame().setHeight(height);
    rect.setName(dotPath);
    rect.setNameIsFixed(true);
    var fill = rect.style().fills().addNewStylePart();
    fill.color = MSColor.colorWithSVGString(color.value);

    command.setValue_forKey_onLayer(String(dotPath), 'oco_defines_fill', rect);
  });

  var frame = artboard.frame()
  frame.setX(0)
  frame.setY(0)
  frame.setWidth(artboardWidth)
  frame.setHeight(artboardHeight);

  context.document.currentPage().addLayers([artboard]);
}
