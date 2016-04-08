import {createSelect, createAlert, createLabel, selectOcoFile, parentArtboardForObject, generateNameLookup, getStyleColor} from './utils';
var oco = require('opencolor');

export const HKSketchFusionExtension = {
  name: "Open Color Tools",
  description: "",
  author: "Jan Krutisch",
  authorEmail: "info@opencolor.tools",
  version: "1.0.0",
  identifier: "tools.opencolor.sketch.opencolor",

  commands: {
    importAsDocumentColorsCommand: {
      name: 'Import as Document colors',
      run(context) {

        //create file enumerator for presetsPath
        // clear them
        var result = selectOcoFile("Select a palette to import as document colors", "Import");
        if (!result) { return; }

        context.document.documentData().assets().setColors(MSArray.dataArrayWithArray([]));


        var ocoString = NSString.stringWithContentsOfFile(result);
        var tree = oco.parse(ocoString + "\n");
        var colors = [];
        function traverseTree(subtree) {
          print("Subtree");
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
        appController.refreshCurrentDocument();
      }
    },
    connectArtboardWithPalette: {
      name: 'Connect Artboard with Palette',
      run(context) {
        var command = context.command;
        let layer = context.selection.firstObject();
        if (!layer) { return; }
        var artboard = parentArtboardForObject(layer);

        if (!artboard) { return; }
        var value = command.valueForKey_onLayer('ocoPalette', artboard);
        var result = selectOcoFile("Select a palette to connect to the current Artboard", "Connect", "" + value, true);
        if (!result) { return; }

        command.setValue_forKey_onLayer(String(result), 'ocoPalette', artboard);

      }
    },
    identifyColor: {
      name: 'Identify Color',
      run(context) {
        const styleTypes = ['fill', 'border', 'shadow', 'innerShadow'];
        var command = context.command;
        let layer = context.selection.firstObject();
        if (!layer) { return; }
        var artboard = parentArtboardForObject(layer);
        if (!artboard) { 
          context.document.showMessage('⛈ The layer needs to be part of an artboard');
          return;
        }
        var ocoPalettePath = command.valueForKey_onLayer('ocoPalette', artboard);
        if(!ocoPalettePath) {
          context.document.showMessage('⛈ Connect Artboard with Palette, first.');
          return;
        }
        var ocoString = NSString.stringWithContentsOfFile(ocoPalettePath);
        var tree = oco.parse(ocoString + "\n");
        var nameLookup = generateNameLookup(tree);
        var info = [];
        if(layer.isKindOfClass(MSTextLayer.class())) {
          var color = '#' + layer.textColor().hexValue();
          if (nameLookup[color]) {
            info.push(`type: ${nameLookup[color].join(", ")} `);
          }
        } else {
          styleTypes.forEach((type) => {
            var color = getStyleColor(layer, type);
            if (nameLookup[color]) {
              info.push(`${type}: ${nameLookup[color].join(", ")} `);
            }
          });
        }
        if (info.length > 0) {
          context.document.showMessage('🌈 ' + info.join(", "));
        } else {
          context.document.showMessage("No color identified");
        }
      }
    }
  }
};
