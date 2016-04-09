import {arrayify, createSelect, createComboBox, createAlert, createLabel, selectOcoFile, parentArtboardForObject, generateNameLookup, generateColorLookup, getStyleColor} from './utils';
var oco = require('opencolor');


var STYLE_ICONS = {
  'fill': '◼︎',
  'text': '≣',
  'border': '◻︎',
  'shadow': '❑',
  'innerShadow': '⚃'
}

const STYLE_TYPES = ['fill', 'border', 'shadow', 'innerShadow'];

function getNameLookup(command, layer) {
  if (!layer) { return null; }
  var artboard = parentArtboardForObject(layer);
  if (!artboard) { 
    return null;
  }
  var ocoPalettePath = command.valueForKey_onLayer('ocoPalette', artboard);
  if(!ocoPalettePath) {
    return undefined;
  }
  var ocoString = NSString.stringWithContentsOfFile(ocoPalettePath);
  var tree = oco.parse(ocoString + "\n");
  var nameLookup = generateNameLookup(tree);
  return nameLookup;
}

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
    importAsTaggedLayersColorsCommand: {
      name: 'Import as Artboards',
      run(context) {

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
    },
    exportTaggedLayers: {
      name: 'Export Artboard',
      run(context) {

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

            log(groupName);
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
        var libFolder = '/Users/mschieben/Desktop/oco'
        var filePath = libFolder + '/' + cachedPalettePathParts[cachedPalettePathParts.length - 1];

        var nsBoooom = NSString.alloc().init().stringByAppendingString(boooom);
        nsBoooom.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(filePath, true);

        context.document.showMessage('🌈 Saved in Open Color Library!');

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

        var nameLookup = getNameLookup(command, layer);
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
          styleTypes.forEach((type) => {
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
          //context.document.showMessage('🌈 ' + info.join(", "));
          context.document.showMessage('🌈 ' + str);
        } else {
          context.document.showMessage("No color identified");
        }
      }
    },
    useLayerAsDefinition: {
      name: 'Use Layer to define color values',
      run(context) {
        const styleTypes = ['fill', 'border', 'shadow', 'innerShadow'];
        var command = context.command;
        let layer = context.selection.firstObject();
        var nameLookup = getNameLookup(command, layer);
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
          styleTypes.forEach((type) => {
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

        // build ui for identifiedStyles
        var definedNames = [];
        Object.keys(nameLookup).forEach(function(k) {
          var paths = nameLookup[k].map(name => name.path);
          definedNames = definedNames.concat(paths);
        });
        definedNames = ['-- nothing --'].concat(definedNames);

        var alert = createAlert('Open Color Tools', 'Use the following colors of this layer to create a oco color');

        identifiedStyles.forEach((style, index) => {

          var listView = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,50));
          listView.addSubview(createLabel(STYLE_ICONS[style.type] + ' ' + style.type + ' · color name', NSMakeRect(0, 30, 300, 20), 12));

          var uiSelect = createComboBox(definedNames, 0, NSMakeRect(0, 0, 300, 25), true);
          var existingValue = command.valueForKey_onLayer('oco_defines_' + style.type, layer);


          if(existingValue && existingValue != '') {
            uiSelect.setStringValue(existingValue);
          }

          listView.addSubview(uiSelect);
          alert.addAccessoryView(listView);
          identifiedStyles[index].uiSelect = uiSelect;

        });

        alert.addButtonWithTitle('Define Color');
        alert.addButtonWithTitle('Cancel');

        var responseCode = alert.runModal();
        if(responseCode != '1000') {
          return null;
        }

        identifiedStyles.forEach((style) => {
          var text = style.uiSelect.objectValueOfSelectedItem();
          var value = style.uiSelect.stringValue();
          var index = style.uiSelect.indexOfSelectedItem();

          if(!value || value == '') {
            value = style.uiSelect.objectValueOfSelectedItem();
          }

          command.setValue_forKey_onLayer(String(value), 'oco_defines_' + style.type, layer);

        });

        //var alert = createAlert("Open Color Tools", "Select a color");
        //var listView = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,50));

        /*
        var ocoSelect = createSelect(definedNames, 1, NSMakeRect(0, 0, 300, 25), true);

        listView.addSubview(createLabel('Please set a color name', NSMakeRect(0, 30, 300, 20), 12));

        listView.addSubview(ocoSelect);
        alert.addAccessoryView(listView);

        alert.addButtonWithTitle(buttonText);
        alert.addButtonWithTitle("Cancel");

        var responseCode = alert.runModal();
        if(responseCode != '1000') {
          return null;
        }

        var index = ocoSelect.indexOfSelectedItem();
        */
      }
    }
  }
};
