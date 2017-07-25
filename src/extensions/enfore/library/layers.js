/**
* Layers library
*
* Provides functionality to get, find, check or otherwise manipulate layers.
*/

import Context from './context'
import * as Utils from './utils'

export const PAGE = 'MSPage'
export const ARTBOARD = 'MSArtboardGroup'
export const GROUP = 'MSLayerGroup'
export const TEXT = 'MSTextLayer'
export const SHAPE = 'MSShapeGroup'
export const BITMAP = 'MSBitmapLayer'
export const SYMBOL = 'MSSymbolInstance'
export const SYMBOL_MASTER = 'MSSymbolMaster'
export const ANY = null

/**
* Finds layers with specified name in the root layer. The name can be set to '*'
* and exactMatch to false, in which case all layers are returned.
*
* @param {String} name
* @param {Boolean} exactMatch
* @param {String} type
* @param {MSLayer} rootLayer
* @param {Boolean} subLayersOnly
* @param {Array} layersToExclude
* @returns {Array}
*/
export function findLayersInLayer (name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude) {
  // create predicate format
  let formatRules = ['(name != NULL)']
  let args = []

  // name
  if (name) {
    if (exactMatch) {
      formatRules.push('(name == %@)')
    } else {
      formatRules.push('(name like %@)')
    }
    args.push(name)
  }

  // type
  if (type) {
    formatRules.push('(className == %@)')
    args.push(type)
  } else {
    formatRules.push('(className == "MSLayerGroup" OR className == "MSShapeGroup" OR className == "MSArtboardGroup" OR className == "MSTextLayer")')
  }

  // layers to exclude
  if (layersToExclude) {
    formatRules.push('NOT (SELF IN %@)')
    args.push(layersToExclude)
  }

  // prepare format string
  let formatString = formatRules.join(' AND ')

  // create predicate
  let predicate = NSPredicate.predicateWithFormat_argumentArray(formatString, args)

  // get layers to filter
  let layers
  if (subLayersOnly) {
    layers = rootLayer.layers()
  } else {
    layers = rootLayer.children()
  }

  // perform query
  let queryResult = layers.filteredArrayUsingPredicate(predicate)

  // return result as js array
  return Utils.convertToJSArray(queryResult)
}

/**
* Finds a single layer in the root layer.
*
* @param {String} name
* @param {Boolean} exactMatch
* @param {String} type
* @param {MSLayer} rootLayer
* @param {Boolean} subLayersOnly
* @param {Array} layersToExclude
* @returns {MSLayer}
*/
export function findLayerInLayer (name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude) {
  let result = findLayersInLayer(name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude)

  // return first layer in result
  if (result.length) return result[0]
}

/**
* Finds a set of layer in a set of root layers.
*
* @param {String} name
* @param {Boolean} exactMatch
* @param {String} type
* @param {MSLayer} rootLayers
* @param {Boolean} subLayersOnly
* @param {Array} layersToExclude
* @returns {array}
*/
export function findLayersInLayers (name, exactMatch, type, rootLayers, subLayersOnly, layersToExclude) {
  let layers = []
  rootLayers.forEach((rootLayer) => {
    let result = findLayersInLayer(name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude)
    layers = layers.concat(result)
  })

  // return all found layers
  return layers
}

/**
* Finds a single layer in a set of root layers.
*
* @param {String} name
* @param {Boolean} exactMatch
* @param {String} type
* @param {MSLayer} rootLayers
* @param {Boolean} subLayersOnly
* @param {Array} layersToExclude
* @returns {array}
*/
export function findLayerInLayers (name, exactMatch, type, rootLayers, subLayersOnly, layersToExclude) {
  let result = findLayersInLayers(name, exactMatch, type, rootLayers, subLayersOnly, layersToExclude)

  // return first layer in result
  if (result.length) return result[0]
}

/**
* Finds a page with the specified name in the current document.
*
* @param {String} name
* @param {Boolean} fullMatch
* @returns {MSPage}
*/
export function findPageWithName (name, fullMatch) {
  let doc = MSDocument.currentDocument()
  let pages = Utils.convertToJSArray(doc.pages())
  for (let i = 0; i < pages.length; i++) {
    let currentPage = pages[i]

    // if page matches name
    if (fullMatch) {
      if (currentPage.name() === name) {
        return currentPage
      }
    } else {
      if (currentPage.name().indexOf(name) > -1) {
        return currentPage
      }
    }
  }
}

/**
 * Finds a layer by its ObjectID.
 *
 * @param {String} objectID
 * @param {MSLayer} rootLayer
 * @return {MSLayer}
 */
export function findLayerByObjectID (objectID, rootLayer) {
  // create predicate format
  let formatString = '(objectID == %@)'
  let args = [objectID]

  // create predicate
  let predicate = NSPredicate.predicateWithFormat_argumentArray(formatString, args)
  let layers = rootLayer.children()
  // perform query
  let queryResult = layers.filteredArrayUsingPredicate(predicate)

  // return result as js array
  let result = Utils.convertToJSArray(queryResult)
  if (result.length) return result[0]
}

/**
 * Gets the parent artboard of the given layer.
 *
 * @param {MSLayer} layer
 * @return {MSArtboardGroup}
 */
export function getParentArtboard (layer) {
  if (layer && isArtboard(layer)) {
    return layer
  } else {
    return layer.parentArtboard()
  }
}

/**
 * Centers the canvas to the provided layer.
 *
 * @param {MSLayer} layer
 */
export function jumpToLayer (layer) {
  // get doc
  let doc = MSDocument.currentDocument()

  // get current view
  let currentView = doc.valueForKey('currentView')

  // get parent page
  let page = layer.valueForKey('parentPage')

  // set current page
  doc.performSelectorOnMainThread_withObject_waitUntilDone(NSSelectorFromString('setCurrentPage:'), page, true)

  // select layer
  layer.select_byExpandingSelection(true, false)

  // center selected layer view
  currentView.performSelectorOnMainThread_withObject_waitUntilDone(NSSelectorFromString('centerSelectionInVisibleArea'), null, true)
}

/**
* Refreshes text layer boundaries after setting text. This is used as Sketch
* sometimes forgets to resize the text layer.
*
* @param layer
*/
export function refreshTextLayer (layer) {
  layer.adjustFrameToFit()
  layer.select_byExpandingSelection(true, false)
  layer.setIsEditingText(true)
  layer.setIsEditingText(false)
  layer.select_byExpandingSelection(false, false)
}

/**
* Returns the currently selected layers as a Javascript array.
*
* @returns {Array}
*/
export function getSelectedLayers () {
  return Utils.convertToJSArray(Context().document.selectedLayers())
}

/**
* Sets the current layer selection to the provided layers.
*
* @param {Array} layers
*/
export function selectLayers (layers) {
  // deselect all layers
  let selectedLayers = getSelectedLayers()
  selectedLayers.forEach((layer) => {
    layer.select_byExpandingSelection(false, false)
  })

  // select layers
  layers.forEach(function (layer) {
    layer.select_byExpandingSelection(true, true)
  })
}

/**
 * Removes the given layer from the document.
 *
 * @param {MSLayer} layer
 */
export function removeLayer (layer) {
  layer.parentGroup().removeLayer(layer)
}

/**
 * Gets all pages in the current document.
 *
 * @returns {Array}
 */
export function getPages () {
  return Context().document.pages()
}

/**
* Adds a page with the specified name to the current document.
*
* @param {String} name
* @returns {MSPage}
*/
export function addPage (name) {
  // get doc
  let doc = Context().document

  // get current page
  let currentPage = doc.currentPage()

  // create new page
  let page = doc.addBlankPage()
  page.setName(name)

  // make current page active again
  doc.setCurrentPage(currentPage)

  return page
}

/**
* Removes the page with the specified name from the current document.
*
* @param {MSPage} page
*/
export function removePage (page) {
  // get doc
  let doc = Context().document

  // get current page
  let currentPage = doc.currentPage()

  // remove page
  doc.removePage(page)

  // make current page active again
  doc.setCurrentPage(currentPage)
}

/**
* Checks if the layer is a symbol instance.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isSymbolInstance (layer) {
  return layer.isKindOfClass(MSSymbolInstance.class())
}

/**
* Checks if the layer is a symbol master.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isSymbolMaster (layer) {
  return layer.isKindOfClass(MSSymbolMaster.class())
}

/**
* Checks if the layer is a layer group.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isLayerGroup (layer) {
  return layer.isKindOfClass(MSLayerGroup.class()) && !layer.isKindOfClass(MSShapeGroup.class())
}

/**
* Checks if the layer is a shape/shape group.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isLayerShapeGroup (layer) {
  return layer.isKindOfClass(MSShapeGroup.class())
}

/**
* Checks if the layer is a bitmap layer.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isLayerBitmap (layer) {
  return layer.isKindOfClass(MSBitmapLayer.class())
}

/**
* Checks if the layer is a text layer.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isLayerText (layer) {
  return layer.isKindOfClass(MSTextLayer.class())
}

/**
* Checks if the layer is an artboard.
*
* @param {MSLayer} layer
* @returns {Boolean}
*/
export function isArtboard (layer) {
  return layer.isKindOfClass(MSArtboardGroup.class())
}

/**
* Retrieves overrides for a symbol instance.
*
* @param {MSSymbolInstance} layer
* @returns {NSDictionary}
*/
export function getSymbolOverrides (layer) {
  let overrides
  if (Utils.sketchVersion() < 44) {
    // get main overrides dictionary
    overrides = layer.overrides()
    if (!overrides) {
      overrides = NSDictionary.alloc().init()
    }

    overrides = overrides.objectForKey(NSNumber.numberWithInt(0))
  } else {
    overrides = layer.overrides()
  }
  return overrides
}

/**
* Sets overrides for a symbol instance.
*
* @param {MSSymbolInstance} layer
* @param {NSDictionary} overrides
*/
export function setSymbolOverrides (layer, overrides) {
  if (Utils.sketchVersion() < 44) {
    layer.setOverrides(NSDictionary.dictionaryWithObject_forKey(overrides, NSNumber.numberWithInt(0)))
  } else {
    layer.setOverrides(overrides)
  }
  return overrides
}

/**
 * Sets data for key on given layer. Data is stored as user metadata.
 *
 * @param {MSLayer} layer
 * @param {Object/Array} data
 * @param {String} key
 */
export function setDataForKey (layer, data, key) {
  Context().command.setValue_forKey_onLayer(JSON.stringify(data), key, layer)
}

/**
 * Gets data stored in layer metadata under the specified key.
 *
 * @param {MSLayer} layer
 * @param {String} key
 * @return {Object/Array}
 */
export function getDataForKey (layer, key) {
  let data = Context().command.valueForKey_onLayer(key, layer)
  if (data) {
    return JSON.parse(data)
  }
}

/**
 * Gets the fills component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {Array}
 */
export function getFills (layer) {
  return layer.style().fills()
}

/**
 * Gets the first fill component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {MSStylePart}
 */
export function getFill (layer) {
  return getFills(layer)[0]
}

/**
 * Gets the borders component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {Array}
 */
export function getBorders (layer) {
  return layer.style().borders()
}

/**
 * Gets the first border component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {MSStylePart}
 */
export function getBorder (layer) {
  return getBorders(layer)[0]
}

/**
 * Gets the shadows component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {Array}
 */
export function getShadows (layer) {
  return layer.style().shadows()
}

/**
 * Gets the first shadow component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {MSStylePart}
 */
export function getShadow (layer) {
  return getShadows(layer)[0]
}

/**
 * Gets the inner shadows component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {Array}
 */
export function getInnerShadows (layer) {
  return layer.style().innerShadows()
}

/**
 * Gets the first inner shadow component of the style of the given layer.
 *
 * @param {MSLayer} layer
 * @return {MSStylePart}
 */
export function getInnerShadow (layer) {
  return getInnerShadows(layer)[0]
}

/**
 * Gets an MSColor instance from the given style part.
 *
 * @param {MSStylePart} stylePart
 * @return {MSColor}
 */
export function getStylePartColor (stylePart) {
  return stylePart.color()
}

/**
 * Gets an MSColor instance from the given text layer.
 *
 * @param {MSTextLayer} textLayer
 * @return {MSColor}
 */
export function getTextColor (textLayer) {
  if (!isLayerText(textLayer)) return

  return textLayer.textColor()
}

/**
 * Gets an MSColor instance from the given artboard layer.
 *
 * @param {MSArtboardGroup} artboardLayer
 * @return {MSColor}
 */
export function getArtboardBackgroundColor (artboardLayer) {
  if (!isArtboard(artboardLayer)) return
  if (!artboardLayer.hasBackgroundColor()) return

  return artboardLayer.backgroundColorGeneric()
}
