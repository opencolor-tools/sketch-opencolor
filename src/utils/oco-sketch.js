import {ocoFiles, generateNameLookup, APP_BUNDLE_IDENTIFIER, APP_PATH} from './oco'
import {createAlert, createSelect, createLabel} from './sketch-ui'
import {parentArtboardForObject, parentPageForObject} from './sketch-dom'
import * as oco from 'opencolor'

export const STYLE_TYPES = ['fill', 'border', 'shadow', 'innerShadow'];
export const STYLE_ICONS = {
  'fill': '◼︎',
  'text': '≣',
  'border': '◻︎',
  'shadow': '❑',
  'innerShadow': '⚃'
}

export function openApp() {
  var apps = NSRunningApplication.runningApplicationsWithBundleIdentifier(APP_BUNDLE_IDENTIFIER);
  if(apps.count() > 0) {
    apps.objectAtIndex(0).activateWithOptions(NSApplicationActivateAllWindows);
    return true;
  }
  if(NSFileManager.defaultManager().fileExistsAtPath(APP_PATH)) {
    NSWorkspace.sharedWorkspace().launchApplication(APP_PATH)
    return true;
  }
  return false;
}

export function getLibFolder() {
  var url = NSURL.fileURLWithPath(NSHomeDirectory() + '/Library/Colors/OpenColorCache/libfolder.setting');
  var libFolder = NSString.stringWithContentsOfFile(url);
  return libFolder;
}

export function getLinkedPaletteForObject(command, layer) {
  if (!layer) { return null; }
  var artboard = parentArtboardForObject(layer);
  if (!artboard) {
    return null;
  }
  var ocoPalettePath = command.valueForKey_onLayer('ocoPalette', artboard);
  if(ocoPalettePath) {
    return ocoPalettePath;
  }
  var page = parentPageForObject(artboard);
  if (!page) {
    return null;
  }
  ocoPalettePath = command.valueForKey_onLayer('ocoPalette', page);
  if(ocoPalettePath) {
    return ocoPalettePath;
  }
  return null;
}

export function getNameLookupForLayer(command, layer) {
  var ocoPalettePath = getLinkedPaletteForObject(command, layer);
  if(!ocoPalettePath) {
    return undefined;
  }
  var ocoString = NSString.stringWithContentsOfFile(ocoPalettePath);
  var tree = oco.parse(ocoString + "\n");
  var nameLookup = generateNameLookup(tree);
  return nameLookup;
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
  var alert = createAlert('Open Color Tools', 'Select a palette to import as document colors');
  var ocoSelect = createSelect(labels, selectedIndex, NSMakeRect(0, 0, 300, 25));

  listView.addSubview(createLabel('Please select a palette', NSMakeRect(0, 30, 300, 20), 12));

  listView.addSubview(ocoSelect);
  alert.addAccessoryView(listView);

  alert.addButtonWithTitle(buttonText);
  alert.addButtonWithTitle('Cancel');

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
