/**
 * Gui library
 *
 * Provides functionality to create various user interface components.
 */

import Context from './context'

/**
 * Creates a new alert with a title, message and icon.
 *
 * @param {string} title
 * @param {string} message
 * @param {string} iconFileName
 * @returns {COSAlertWindow}
 */
export function createAlert (title, message, iconFileName) {
  let alert = COSAlertWindow.new()
  alert.setMessageText(title)
  alert.setInformativeText(message)

  if (iconFileName) {
    // get icon path
    let iconUrl = Context().plugin.urlForResourceNamed(iconFileName)

    // set icon
    let icon = NSImage.alloc().initByReferencingFile(iconUrl.path())
    alert.setIcon(icon)
  }

  return alert
}

/**
 * Creates an NSTextField styled as a label.
 *
 * @param {string} text
 * @param {int} fontSize
 * @param {boolean} bold
 * @param {NSRect} frame
 * @returns {NSTextField}
 */
export function createLabel (text, fontSize, bold, frame) {
  // create label
  let label = NSTextField.alloc().initWithFrame(frame)
  label.setStringValue(text)

  // set font
  if (bold) {
    label.setFont(NSFont.boldSystemFontOfSize(fontSize))
  } else {
    label.setFont(NSFont.systemFontOfSize(fontSize))
  }

  // set properties to make the text field look like a label
  label.setBezeled(false)
  label.setDrawsBackground(false)
  label.setEditable(false)
  label.setSelectable(false)

  return label
}

/**
 * Creates an NSButton styled as a checkbox.
 *
 * @param {string} text
 * @param {boolean} checked
 * @param {NSRect} frame
 * @returns {NSButton}
 */
export function createCheckbox (text, checked, frame) {
  // convert boolean to NSState
  checked = (checked === false) ? NSOffState : NSOnState

  // create checkbox button
  let checkbox = NSButton.alloc().initWithFrame(frame)
  checkbox.setButtonType(NSSwitchButton)
  checkbox.setBezelStyle(0)
  checkbox.setTitle(text)
  checkbox.setState(checked)

  return checkbox
}

/**
 * Creates an NSPopUpButton that can be used as a list select menu.
 *
 * @param {Array} items
 * @param {int} selectedIndex
 * @param {NSRect} frame
 * @returns {NSPopUpButton}
 */
export function createSelect (items, selectedIndex, frame) {
  // create select
  let select = NSPopUpButton.alloc().initWithFrame_pullsDown(frame, false)

  // add items to the list
  select.addItemsWithTitles(items)
  select.selectItemAtIndex(selectedIndex)

  return select
}
