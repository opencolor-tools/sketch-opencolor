/**
* Files library
*
* Provides functionality to load and save files to the file system.
*/

import Context from '../context'

/**
* Prompts user to select a file and returns the path to the selected file.
*
* @param {String} path - Path to set as the initial location of the file browser.
* @returns {String}
*/
export function selectFile (initialPath, title, message) {
  // create panel
  let panel = NSOpenPanel.openPanel()

  // set panel properties
  panel.setTitle(title)
  panel.setMessage(message)
  panel.setPrompt('Select')
  panel.setCanCreateDirectories(false)
  panel.setCanChooseFiles(true)
  panel.setCanChooseDirectories(false)
  panel.setAllowsMultipleSelection(false)
  panel.setShowsHiddenFiles(false)
  panel.setExtensionHidden(false)

  // set initial panel path
  if (initialPath) {
    panel.setDirectoryURL(NSURL.fileURLWithPath(initialPath))
  } else {
    panel.setDirectoryURL(NSURL.fileURLWithPath('/Users/' + NSUserName()))
  }

  // show panel
  let pressedButton = panel.runModal()
  if (pressedButton === NSOKButton) {
    return panel.URL().path()
  }
}

/**
* Prompts user to select a folder and returns the path to the selected folder.
*
* @param {String} path - Path to set as the initial location of the file browser.
* @returns {String}
*/
export function selectFolder (initialPath, title, message) {
  // create panel
  let panel = NSOpenPanel.openPanel()

  // set panel properties
  panel.setTitle(title)
  panel.setMessage(message)
  panel.setPrompt('Select')

  panel.setCanCreateDirectories(true)
  panel.setCanChooseFiles(false)
  panel.setCanChooseDirectories(true)
  panel.setAllowsMultipleSelection(false)
  panel.setShowsHiddenFiles(false)
  panel.setExtensionHidden(false)

  // set initial panel path
  if (initialPath) {
    panel.setDirectoryURL(NSURL.fileURLWithPath(initialPath))
  } else {
    panel.setDirectoryURL(NSURL.fileURLWithPath('/Users/' + NSUserName()))
  }

  // show panel
  let pressedButton = panel.runModal()
  if (pressedButton === NSOKButton) {
    return panel.URL().path()
  }
}

/**
* Reads the contexts of a text based file at the provided path.
*
* @param {String} path
* @returns {String}
*/
export function readFileAsText (path) {
  return NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, false)
}

/**
* Saves the text to a file at the specified file path.
*
* @param {String} text
* @param {String} filePath
*/
export function saveTextToFile (text, filePath) {
  text = NSString.alloc().init().stringByAppendingString(text)
  filePath = NSString.alloc().init().stringByAppendingString(filePath)

  // save file
  text.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(filePath, true)
}

/**
* Loads the JSON file at the specified path and parses and returns its content.
*
* @param {String} path
* @returns {Object/Array}
*/
export function loadJSONData (path) {
  // load contents
  let contents = readFileAsText(path)

  // get data from JSON
  let data
  try {
    data = JSON.parse(contents)
  } catch (e) {
    Context().document.showMessage("There was an error parsing JSON data. Please make sure it's valid.")
    return
  }

  return data
}
