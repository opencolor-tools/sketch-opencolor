import { ocoFiles, ocoCachePath, generateNameLookup, generateColorLookup, APP_BUNDLE_IDENTIFIER, APP_PATH } from './oco'
import { createAlert, createSelect, createLabel } from './sketch-ui'
import { parentArtboardForObject, parentPageForObject } from './sketch-dom'
import * as oco from 'opencolor'

export const STYLE_TYPES = ['fill', 'border', 'shadow', 'innerShadow']
export const COLOR_TYPES = STYLE_TYPES.concat(['text'])
export const STYLE_ICONS = {
  'fill': '◼︎',
  'text': '≣',
  'border': '◻︎',
  'shadow': '❑',
  'innerShadow': '⚃'
}

export function openApp () {
  var apps = NSRunningApplication.runningApplicationsWithBundleIdentifier(APP_BUNDLE_IDENTIFIER)
  if (apps.count() > 0) {
    apps.objectAtIndex(0).activateWithOptions(NSApplicationActivateAllWindows)
    return true
  }
  if (NSFileManager.defaultManager().fileExistsAtPath(APP_PATH)) {
    NSWorkspace.sharedWorkspace().launchApplication(APP_PATH)
    return true
  }
  return false
}

export function getLibFolder () {
  var url = NSURL.fileURLWithPath(NSHomeDirectory() + '/Library/Colors/OpenColorCache/libfolder.setting')
  var libFolder = NSString.stringWithContentsOfFile(url)
  return libFolder
}

export function getLinkedPaletteForObject (command, layer) {
  if (!layer) { return null }
  var ocoPalettePath = null

  var artboard = parentArtboardForObject(layer)
  if (artboard) {
    ocoPalettePath = command.valueForKey_onLayer('ocoPalette', artboard)
  }

  if (ocoPalettePath) {
    return ocoPalettePath
  }
  var page = parentPageForObject(artboard)
  if (page) {
    ocoPalettePath = command.valueForKey_onLayer('ocoPalette', page)
  }

  if (ocoPalettePath) {
    return ocoPalettePath
  }
  return getDefaultPalette()
}

function urlResolver (url, line) {
  var ocoName = url.split('//')[1]
  var ocoPalettePath = ocoCachePath() + '/' + ocoName + '.oco'
  var ocoPaletteUrl = NSURL.fileURLWithPath(ocoPalettePath)
  var ocoString = NSString.stringWithContentsOfFile(ocoPaletteUrl)

  return ocoString
}

export function getOcoTreeForLayer (command, layer) {
  var ocoPalettePath = getLinkedPaletteForObject(command, layer)
  if (!ocoPalettePath) {
    return undefined
  }

  if (('' + ocoPalettePath).indexOf('/Library/Colors') === -1) {    // string is relative
    ocoPalettePath = ocoCachePath() + '/' + ocoPalettePath
  }
  var ocoPaletteUrl = NSURL.fileURLWithPath(ocoPalettePath)
  var ocoString = NSString.stringWithContentsOfFile(ocoPaletteUrl)
  var tree = oco.parse(ocoString + '\n', urlResolver)
  return tree
}

export function getNameLookupForLayer (command, layer) {
  var tree = getOcoTreeForLayer(command, layer)
  if (!tree) {
    return undefined
  }
  return generateNameLookup(tree)
}

export function getColorLookupForLayer (command, layer) {
  var tree = getOcoTreeForLayer(command, layer)
  return generateColorLookup(tree)
}

export function getDefaultPalette () {
  var palette = '' + NSUserDefaults.standardUserDefaults().objectForKey('oco.defaultPalette')
  return palette
}

export function setDefaultPalette (path) {
  NSUserDefaults.standardUserDefaults().setObject_forKey(path, 'oco.defaultPalette')
}

export function selectOcoFile (title, buttonText, selectedPath, addUnselected) {
  var files = ocoFiles()
  var labels = files.map(ocoFile => ocoFile.name)
  if (addUnselected) {
    labels = ['--unselected--'].concat(labels)
  }

  var paths = files.map(ocoFile => ocoFile.path)

  var selectedIndex = Math.max(0, paths.indexOf(selectedPath))
  if (addUnselected) {
    selectedIndex += 1
  }

  var listView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var alert = createAlert('Open Color Tools', title)
  var ocoSelect = createSelect(labels, selectedIndex, NSMakeRect(0, 0, 300, 25))

  listView.addSubview(createLabel('Please select a palette', NSMakeRect(0, 30, 300, 20), 12))

  listView.addSubview(ocoSelect)
  alert.addAccessoryView(listView)

  alert.addButtonWithTitle(buttonText)
  alert.addButtonWithTitle('Cancel')

  var responseCode = alert.runModal()
  if (responseCode != '1000') { // eslint-disable-line eqeqeq
    return null
  }

  // clear them
  var index = ocoSelect.indexOfSelectedItem()
  if (addUnselected) {
    index -= 1
  }
  if (index < 0) {
    return ''
  }
  return files[index].path
}
