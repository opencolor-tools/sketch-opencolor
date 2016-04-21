import {arrayify, parentArtboardForObject, getStyleColor} from '../utils/sketch-dom';
import {STYLE_TYPES} from '../utils/oco-sketch'
var oco = require('opencolor');

export default function exportFromArtboard(context) {

  var command = context.command;
  let layer = context.selection.firstObject();
  if (!layer) {
    context.document.showMessage('⛈ Select an artboard first.');
    return;
  }
  var artboard = parentArtboardForObject(layer);
  if (!artboard) {
    context.document.showMessage('⛈ Select an artboard first.');
    return;
  }
  var cachedPalettePath = command.valueForKey_onLayer('ocoPalette', artboard);
  if (!cachedPalettePath) {
    context.document.showMessage('⛈ Connect artboard first.');
    return;
  }
  //artboard
  var ocoPalette = new oco.Entry('Root');
  var groups = {};

  function colorNameProcessor(colorName) {
    var parts = colorName.split('.');
    return {
      colorName: parts[1],
      groupName: parts[0],
    }
  }

  var children = arrayify(artboard.children()).reverse();
  children.forEach(function(child) {
    if (!child.isKindOfClass(MSShapeGroup)) {
      return;
    }
    //var identit getIdentifyStyles(child);
    STYLE_TYPES.forEach((type) => {
      var dotPath = command.valueForKey_onLayer('oco_defines_' + type, child);

      if(!dotPath || dotPath == '') {
        return;
      }
      var colorValue = getStyleColor(child, type);
      var name = dotPath;
      var group = null;
      var processedNames = colorNameProcessor(name);
      var colorName = processedNames.colorName;
      var groupName = processedNames.groupName;

      if(groupName != null) {
        if(Object.keys(groups).indexOf(groupName) != -1) {
          group = groups[groupName];
        } else {
          group = new oco.Entry(groupName, [], 'Entry');
          groups[groupName] = group;
        }
      }

      var colorEntry = new oco.Entry(colorName, [], 'Color');
      colorEntry.addChild(oco.ColorValue.fromColorValue(colorValue), true);

      if(group) {
        group.addChild(colorEntry, [], 'color');
      } else {
        ocoPalette.addChild(colorEntry, [], 'color');
      }

    });

  });

  Object.keys(groups).forEach(function(k) {
    ocoPalette.addChild(groups[k]);
  });
  var boooom = oco.render(ocoPalette);
  var cachedPalettePathParts = cachedPalettePath.split('/');

  // @TODO: fix hard coded
  var libFolder = '/Users/mschieben/Desktop/oco'
  var filePath = libFolder + '/' + cachedPalettePathParts[cachedPalettePathParts.length - 1];

  var nsBoooom = NSString.alloc().init().stringByAppendingString(boooom);
  nsBoooom.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(filePath, true);

  context.document.showMessage('🌈 Saved in Open Color Library!');

}
