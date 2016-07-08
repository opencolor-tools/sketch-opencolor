export const APP_BUNDLE_IDENTIFIER = 'tools.opencolor.companion'
export const APP_PATH = '/Applications/Open Color Companion.app'

import path from 'path'

export function getName (pathName) {
  return path.basename('' + pathName, '.oco')
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

export function ocoCachePath () {
  return NSHomeDirectory() + '/Library/Colors/OpenColorCache'
}

export function ocoFiles () {
  var cachePath = ocoCachePath()
  var url = NSURL.fileURLWithPath(cachePath)
  var enumerator = NSFileManager.defaultManager().enumeratorAtURL_includingPropertiesForKeys_options_errorHandler(url, [NSURLIsDirectoryKey, NSURLNameKey, NSURLPathKey], NSDirectoryEnumerationSkipsHiddenFiles, null)
  var fileUrl
  var files = []
  while (fileUrl = enumerator.nextObject()) { // eslint-disable-line no-cond-assign
    if (fileUrl.pathExtension().isEqualToString('oco')) {
      var isDir = MOPointer.alloc().init()
      fileUrl.getResourceValue_forKey_error(isDir, NSURLIsDirectoryKey, null)
      if (!Number(isDir.value())) {
        var presetPath = path.relative('' + cachePath, '' + fileUrl.path())
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
