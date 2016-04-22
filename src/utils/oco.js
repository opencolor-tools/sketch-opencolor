export const APP_BUNDLE_IDENTIFIER = 'tools.opencolor.companion-app';
export const APP_PATH = '/Applications/OpenColor Tools.app';

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
