import d3Shape from 'd3-shape';
import color from 'sketch-color';

import _ from 'lodash';

import {createAlert, createSelect, createLabel} from './utils';

var oco = require('opencolor');

export const HKSketchFusionExtension = {
  name: "Open Color Tools",
  description: "",
  author: "Jan Krutisch",
  authorEmail: "info@opencolor.tools",
  version: "1.0.0",
  identifier: "tools.opencolor.sketch.opencolor",

  commands: {
    sampleCommand: {
      name: 'Import as Document colors',
      run(context) {

        //create file enumerator for presetsPath
        var url = NSURL.fileURLWithPath(NSHomeDirectory() + "/Library/Colors/OpenColorCache");
        var enumerator = NSFileManager.defaultManager().enumeratorAtURL_includingPropertiesForKeys_options_errorHandler(url, [NSURLIsDirectoryKey, NSURLNameKey, NSURLPathKey], NSDirectoryEnumerationSkipsHiddenFiles, null);
        var fileUrl;
        var ocoFiles = [];
        while(fileUrl = enumerator.nextObject()) {

            //make sure that file is JSON
            if(fileUrl.pathExtension().isEqualToString('oco')) {

                //make sure it's a file
                var isDir = MOPointer.alloc().init();
                fileUrl.getResourceValue_forKey_error(isDir, NSURLIsDirectoryKey, null);
                if(!Number(isDir.value())) {

                    //get relative path for preset
                    var presetPath = String(fileUrl.path());
                    var pathParts = presetPath.split("/");
                    var fileName = pathParts[pathParts.length - 1];
                    //create preset structure
                    var ocoFile = {
                        name: fileName,
                        path: presetPath
                    };

                    //add item
                    ocoFiles.push(ocoFile);
                }
            }
        }

        var labels = ocoFiles.map(ocoFile => ocoFile.name);

        var listView = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,50));
        var alert = createAlert("Open Color Tools", "Select a palette to import as document colors");
        var ocoSelect = createSelect(labels, 0, NSMakeRect(0, 0, 300, 25));

        listView.addSubview(createLabel('Please select a palette', NSMakeRect(0, 30, 300, 20), 12));

        listView.addSubview(ocoSelect);
        alert.addAccessoryView(listView);

        alert.addButtonWithTitle("Import");
        alert.addButtonWithTitle("Cancel");

        var responseCode = alert.runModal();
        if(responseCode != '1000') {
          context.document.showMessage('Canceld');
          return;
        }

        // clear them
        context.document.documentData().assets().setColors(MSArray.dataArrayWithArray([]));
        var index = ocoSelect.indexOfSelectedItem();

        var ocoString = NSString.stringWithContentsOfFile(ocoFiles[index].path);
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
    }
  }
};
