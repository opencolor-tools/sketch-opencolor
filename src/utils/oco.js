export const APP_BUNDLE_IDENTIFIER = 'tools.opencolor.companion'
export const APP_PATH = '/Applications/Open Color Companion.app'

export function getName (path) {
  return path.split('/').pop().replace('.oco', '')
}

export function getSignature (tree) {
  const signature = []
  tree.forEach((entry) => {
    if (entry.type !== 'Entry') {
      signature.push(entry.name)
    }
  })
  return signature.sort()
}

export function ocoFiles () {
  var url = NSURL.fileURLWithPath(NSHomeDirectory() + '/Library/Colors/OpenColorCache')
  var enumerator = NSFileManager.defaultManager().enumeratorAtURL_includingPropertiesForKeys_options_errorHandler(url, [NSURLIsDirectoryKey, NSURLNameKey, NSURLPathKey], NSDirectoryEnumerationSkipsHiddenFiles, null)
  var fileUrl
  var files = []
  while (fileUrl = enumerator.nextObject()) { // eslint-disable-line no-cond-assign
    if (fileUrl.pathExtension().isEqualToString('oco')) {
      var isDir = MOPointer.alloc().init()
      fileUrl.getResourceValue_forKey_error(isDir, NSURLIsDirectoryKey, null)
      if (!Number(isDir.value())) {
        var presetPath = '' + fileUrl.path()
        files.push({
          name: getName(presetPath),
          path: presetPath
        })
      }
    }
  }
  return files
}

export function generateNameLookup (ocoTree) {
  var colors = {} // #FFFFFF -> { path: name: isReference:}
  ocoTree.traverseTree(['Color', 'Reference'], function (entry) {
    var color = ''
    if (entry.type === 'Reference') {
      var colorEntry = entry.resolved()
      if (colorEntry && colorEntry.type === 'Color') {
        color = colorEntry.hexcolor()
      }
    } else {
      color = entry.hexcolor()
    }
    colors[color] = colors[color] || []
    colors[color].push({
      path: entry.path().replace(/^Root\./, ''),
      name: entry.name,
      isReference: (entry.type === 'Reference')
    })
  })
  return colors
}

export function generateColorLookup (ocoTree) {
  var colors = {} // dot.path -> { value: name: isReference:}

  ocoTree.traverseTree(['Color', 'Reference'], function (entry) {
    var value = ''
    if (entry.type === 'Reference') { // eslint-disable-line eqeqeq
      var colorEntry = entry.resolved()
      if (colorEntry && colorEntry.type === 'Color') {
        value = colorEntry.hexcolor()
      }
    } else {
      value = entry.hexcolor()
    }
    colors[entry.path()] = {
      value: value,
      name: entry.name,
      isReference: (entry.type === 'Reference')
    }
  })
  return colors
}
