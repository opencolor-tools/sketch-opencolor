import {selectOcoFile} from '../utils/oco-sketch';
import {arrayify} from '../utils/sketch-dom';
var oco = require('opencolor');

export default function importAsDocumentColors(context) {

  //create file enumerator for presetsPath
  // clear them
  var result = selectOcoFile("Select a palette to import as document colors", "Import");
  if (!result) { return; }

  // clear existing palette
  context.document.documentData().assets().setColors(MSArray.dataArrayWithArray([]));

  var ocoString = NSString.stringWithContentsOfFile(result);
  var tree = oco.parse(ocoString + "\n");
  var colors = [];
  function traverseTree(subtree) {
    subtree.children.forEach(function(entry) {
      if (entry.type === 'Color') {
        colors.push(MSColor.colorWithSVGString(entry.get('rgb').value));
      } else if (entry.type === 'Entry') {
        traverseTree(entry);
      }
    });
  };
  traverseTree(tree);
  var msColors = MSArray.dataArrayWithArray(colors);
  context.document.documentData().assets().setColors(msColors);

  // save on each existing page (as ist not possible to store user data on document)
  arrayify(context.document.pages()).forEach(function(page) {
    context.command.setValue_forKey_onLayer(String(result), 'ocoPalette', page);
  });

  NSApp.delegate().refreshCurrentDocument();

}
