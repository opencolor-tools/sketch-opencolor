export function arrayify(items) {
  var length = items.count();
  var jsArray = [];
  while (length--) {
    jsArray.push(items.objectAtIndex(length));
  }
  return jsArray;
}

export function bezierPathFromSVGPath(path) {
  const isClosed = MOPointer.alloc().init();

  path = SVGPathInterpreter.bezierPathFromCommands_isPathClosed(path,isClosed);

  let bounds = path.bounds();
  return NSMakePoint(bounds.origin.x+bounds.size.width/2,bounds.origin.y+bounds.size.height/2);
}

export function createSelect(items, selectedIndex, frame) {
  var select = NSPopUpButton.alloc().initWithFrame_pullsDown(frame, false);
  select.addItemsWithTitles(items);
  select.selectItemAtIndex(selectedIndex);
  return select;
}

export function createComboBox(items, selectedIndex, frame, pullsDown) {

  var select = NSComboBox.alloc().initWithFrame(frame);
  select.numberOfVisibleItems = 12;
  select.completes = true;

  select.addItemsWithObjectValues(items);
  select.selectItemAtIndex(selectedIndex);
  return select;
}

export function createAlert(title, message, iconFilePath) {

  var alert = COSAlertWindow.new();
  alert.setMessageText(title);
  alert.setInformativeText(message);

  if(iconFilePath) {
    var icon = NSImage.alloc().initByReferencingFile(iconFilePath);
    alert.setIcon(icon);
  }
  return alert;
}

export function createLabel(text, frame, fontSize) {

  var label = NSTextField.alloc().initWithFrame(frame);
  label.setStringValue(text);

  label.setFont(NSFont.boldSystemFontOfSize(fontSize));

  label.setBezeled(false);
  label.setDrawsBackground(false);
  label.setEditable(false);
  label.setSelectable(false);

  return label;

}

export function ocoFiles() {
  var url = NSURL.fileURLWithPath(NSHomeDirectory() + "/Library/Colors/OpenColorCache");
  var enumerator = NSFileManager.defaultManager().enumeratorAtURL_includingPropertiesForKeys_options_errorHandler(url, [NSURLIsDirectoryKey, NSURLNameKey, NSURLPathKey], NSDirectoryEnumerationSkipsHiddenFiles, null);
  var fileUrl;
  var files = [];
  while(fileUrl = enumerator.nextObject()) {
    if(fileUrl.pathExtension().isEqualToString('oco')) {
      var isDir = MOPointer.alloc().init();
      fileUrl.getResourceValue_forKey_error(isDir, NSURLIsDirectoryKey, null);
      if(!Number(isDir.value())) {
        var presetPath = String(fileUrl.path());
        var pathParts = presetPath.split("/");
        var fileName = pathParts[pathParts.length - 1];
        files.push({
          name: fileName,
          path: presetPath
        });
      }
    }
  }
  return files;
}

export function selectOcoFile(title, buttonText, selectedPath, addUnselected) {
  var files = ocoFiles();
  var labels = files.map(ocoFile => ocoFile.name);
  if (addUnselected) {
    labels = ['--unselected--'].concat(labels);
  }

  var paths = files.map(ocoFile => ocoFile.path);
  var selectedIndex = Math.max(0, paths.indexOf(selectedPath));
  if (addUnselected) {
    selectedIndex += 1;
  }

  var listView = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,50));
  var alert = createAlert("Open Color Tools", "Select a palette to import as document colors");
  var ocoSelect = createSelect(labels, selectedIndex, NSMakeRect(0, 0, 300, 25));

  listView.addSubview(createLabel('Please select a palette', NSMakeRect(0, 30, 300, 20), 12));

  listView.addSubview(ocoSelect);
  alert.addAccessoryView(listView);

  alert.addButtonWithTitle(buttonText);
  alert.addButtonWithTitle("Cancel");

  var responseCode = alert.runModal();
  if(responseCode != '1000') {
    return null;
  }

  // clear them
  var index = ocoSelect.indexOfSelectedItem();
  if (addUnselected) {
    index -= 1;
  }
  if (index < 0) {
    return "";
  }
  return files[index].path;

}


export function parentArtboardForObject(object) {
 if (object.isKindOfClass(MSArtboardGroup)) {
   return object;
 } else if (object.parentGroup() != null) {
   return parentArtboardForObject(object.parentGroup());
 } else {
   return null;
 }
};

export function generateNameLookup(ocoTree) {
  var colors = {};
  traverseTree(ocoTree, [], function(path, entry, isReference) {
    if (entry.type === 'Color') {
      var color = entry.get('rgb').value;
      colors[color] = colors[color] || [];
      colors[color].push({
        path: path.join(".") + "." + entry.name,
        name: entry.name,
        isReference: isReference
      });
    }
  });
  return colors;
}

export function generateColorLookup(ocoTree) {
  var colors = {};
  traverseTree(ocoTree, [], function(path, entry, isReference) {
    if (entry.type === 'Color') {
      var value = entry.get('rgb').value;
      var dotPath = path.join(".") + "." + entry.name;
      colors[dotPath] = {
        value: value,
        name: entry.name,
        isReference: isReference
      }
    }
  });
  return colors;
}

export function traverseTree(subtree, path, callback) {
  subtree.forEach(function(entry) {
    if (entry.type === 'Entry') {
      traverseTree(entry, path.concat([entry.name]), callback);
    } else if (entry.type === 'Reference') {
      callback(path, entry.resolved(), true);
    } else {
      callback(path, entry, false);
    }
  });
}


function getStyle(layer, styleType) {
 var style = layer.style();
 if(!style[styleType]) {
   return null;
 }
 return style[styleType]();
}

//styleType: one of fill, border, innerShadow
export function getStyleColor(layer, styleType) {
 var style = getStyle(layer, styleType);
 if(!style) {
   return null;
 }
 return '#' + style.color().hexValue();
}