

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
