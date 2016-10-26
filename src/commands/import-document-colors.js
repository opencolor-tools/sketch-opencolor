import { SKETCH_PLUGIN_IDENTIFIER, selectOcoFile } from '../utils/oco-sketch'
import { ocoCachePath } from '../utils/oco'
import { arrayify } from '../utils/sketch-dom'
import { notifyTutorial } from '../utils/oco-tutorial'
import { hasMSArray } from '../utils/sketch-deprecated'
import { parse } from 'opencolor'

export default function importAsDocumentColors (context) {
  // create file enumerator for presetsPath
  // clear them
  var result = selectOcoFile('Select a palette to import as document colors', 'Import')
  if (!result) { return }

  // clear existing palette
  if (hasMSArray()) {
    context.document.documentData().assets().setColors(MSArray.dataArrayWithArray([]))
  } else {
    context.document.documentData().assets().setColors([])
  }
  // context.document.documentData().assets().setColors(NSArray.arrayWithArray([]))
  var ocoString = NSString.stringWithContentsOfFile(ocoCachePath() + '/' + result)
  var tree = parse(ocoString + '\n')
  var colors = []
  function traverseTree (subtree) {
    subtree.children.forEach(function (entry) {
      if (entry.type == 'Color') { // eslint-disable-line eqeqeq
        colors.push(MSColor.colorWithSVGString(entry.hexcolor()))
      } else if (entry.type == 'Palette') { // eslint-disable-line eqeqeq
        traverseTree(entry)
      }
    })
  }
  traverseTree(tree)
  if (hasMSArray()) {
    var msColors = MSArray.dataArrayWithArray(colors)
    context.document.documentData().assets().setColors(msColors)
  } else {
    context.document.documentData().assets().setColors(colors)
  }

  // save on each existing page (as ist not possible to store user data on document)
  arrayify(context.document.pages()).forEach(function (page) {
    context.command.setValue_forKey_onLayer_forPluginIdentifier(String(result), 'ocoPalette', page, SKETCH_PLUGIN_IDENTIFIER)
  })

  NSApp.delegate().refreshCurrentDocument()

  notifyTutorial(context, 'importAsDocumentColors')
}
