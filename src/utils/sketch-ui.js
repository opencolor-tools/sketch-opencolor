export function createSelect (items, selectedIndex, frame) {
  var select = NSPopUpButton.alloc().initWithFrame_pullsDown(frame, false)
  select.addItemsWithTitles(items)
  select.selectItemAtIndex(selectedIndex)
  return select
}

export function createComboBox (items, selectedIndex, frame, pullsDown) {
  var select = NSComboBox.alloc().initWithFrame(frame)
  select.numberOfVisibleItems = 12
  select.completes = true

  select.addItemsWithObjectValues(items)
  select.selectItemAtIndex(selectedIndex)
  return select
}

export function createAlert (title, message, iconFilePath) {
  var alert = COSAlertWindow.new()
  alert.setMessageText(title)
  alert.setInformativeText(message)

  if (iconFilePath) {
    var icon = NSImage.alloc().initByReferencingFile(iconFilePath)
    alert.setIcon(icon)
  }
  return alert
}

export function createLabel (text, frame, fontSize) {
  var label = NSTextField.alloc().initWithFrame(frame)
  label.setStringValue(text)

  label.setFont(NSFont.boldSystemFontOfSize(fontSize))

  label.setBezeled(false)
  label.setDrawsBackground(false)
  label.setEditable(false)
  label.setSelectable(false)

  return label
}
