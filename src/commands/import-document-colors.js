import {selectOcoFile} from '../utils/oco-sketch';
import {arrayify} from '../utils/sketch-dom';
import {notifyTutorial} from '../utils/oco-tutorial';
import {hasMSArray} from '../utils/sketch-deprecated';
var oco = require('opencolor');

export default function importAsDocumentColors(context) {

  //create file enumerator for presetsPath
  // clear them
  var result = selectOcoFile("Select a palette to import as document colors", "Import");
  if (!result) { return; }

  // clear existing palette
  if (hasMSArray()) {
    context.document.documentData().assets().setColors(MSArray.dataArrayWithArray([]));
  } else {
    context.document.documentData().assets().setColors([]);
  }
  // context.document.documentData().assets().setColors(NSArray.arrayWithArray([]));
  var ocoString = NSString.stringWithContentsOfFile(result);
  var tree = oco.parse(ocoString + "\n");
  var colors = [];
  function traverseTree(subtree) {
    subtree.children.forEach(function(entry) {
      if (entry.type == 'Color') {
        colors.push(MSColor.colorWithSVGString(entry.hexcolor()));
      } else if (entry.type == 'Palette') {
        traverseTree(entry);
      }
    });
  };
  traverseTree(tree);
  if (hasMSArray()) {
    var msColors = MSArray.dataArrayWithArray(colors);
    context.document.documentData().assets().setColors(msColors);
  } else {
    context.document.documentData().assets().setColors(colors);
  }

  // save on each existing page (as ist not possible to store user data on document)
  arrayify(context.document.pages()).forEach(function(page) {
    context.command.setValue_forKey_onLayer(String(result), 'ocoPalette', page);
  });

  NSApp.delegate().refreshCurrentDocument();

  notifyTutorial(context, 'importAsDocumentColors');

}
