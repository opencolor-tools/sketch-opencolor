/**
* Tags library
*
* Provides a convenient way work with tags.
*/

import Context from './context'
import * as Layers from '../layers'

export const TAGS_PAGE_NAME = 'color-hacks'
export const TAGS_LAYER_NAME = 'names'

/**
 * Creates a simplified name from an array of tags.
 *
 * @param {Array} tags
 * @return {String}
 */
export function getSimplifiedName (tags) {
  // split tags into their components
  let tagComponents = []
  tags.forEach(function (tag) {
    tagComponents.push(tag.split('_'))
  })

  // make universal first component
  let firstComponents = []
  tagComponents.forEach(function (singleTagComponents) {
    firstComponents.push(singleTagComponents[0])
  })
  let maxFirstComponent = firstComponents.reduce(function (a, b) { return a > b ? a : b })
  let firstComponent = firstComponents.reduce(function (a, b) { return a > b ? b : a })
  while (maxFirstComponent.indexOf(firstComponent) !== 0) {
    firstComponent = firstComponent.slice(0, -1)
  }

  // get common remaining components
  let commonComponents = []
  tagComponents.forEach(function (singleTagComponents) {
    for (let i = 1; i < singleTagComponents.length; ++i) {
      if (commonComponents.indexOf(singleTagComponents[i]) === -1) {
        commonComponents.push(singleTagComponents[i])
      }
    }
  })

  // add first component to common components
  commonComponents.unshift(firstComponent)

  // replace not mapped
  for (let i = 0; i < commonComponents.length; ++i) {
    if (commonComponents[i] === '- not mapped -') commonComponents[i] = 'not mapped'
  }

  return commonComponents.join('_')
}

/**
 * Updates the name of the given layer based on the tags assigned to it.
 *
 * @param {MSLayer} layer
 * @param {Boolean} simplified
 */
export function updateLayerName (layer, simplified) {
  // get layer data
  let data = Layers.getDataForKey(layer, 'data')
  if (!data) return

  // get mapping
  let mapping = data.mapping
  if (!mapping) return

  // get all tags from mapping
  let tags = []
  Object.keys(mapping).forEach(function (key) {
    tags.push(mapping[key])
  })

  // create name
  let name = ''
  if (simplified) name = getSimplifiedName(tags)
  else {
    // get unique tags
    let uniqueTags = []
    tags.forEach(function (tag) {
      for (let i = 0; i < tags.length; ++i) {
        if (uniqueTags.indexOf(tags[i]) === -1) {
          uniqueTags.push(tags[i])
        }
      }
    })
    tags = uniqueTags

    // replace not mapped
    for (let i = 0; i < tags.length; ++i) {
      if (tags[i] === '- not mapped -') tags[i] = 'not mapped'
    }

    name = tags.join(', ')
  }

  // set layer name
  layer.setName(name)
}

/**
 * Updates the names of all layers in the document based on tags assigned to them.
 *
 * @param {Boolean} simplified
 */
export function updateAllLayerNames (simplified) {
  let pages = Layers.getPages()

  let layers = Layers.findLayersInLayers('*', false, null, pages, false, null)
  layers.forEach(function (layer) {
    updateLayerName(layer, simplified)
  })
}

/*

metadata to add to layers: (for 'data' key)

data: {
  mapping: {
    fill:,
    border:,
    text:,
    innershadow:,
    isMuted:
  }
}

*/

/**
 * Checks that tags are found within the document.
 *
 * @return {Boolean}
 */
export function ensureTags () {
  let tags = getTags()
  if (!tags) {
    Context().document.showMessage(`Please ensure there is a page named '${TAGS_PAGE_NAME}' that contains a text layer named ${TAGS_LAYER_NAME}.`)
  }

  return !!tags
}

/**
 * Gets tags from the tags page.
 *
 * @return {Array}
 */
export function getTags () {
  // find page with tags
  let tagsPage = Layers.findPageWithName(TAGS_PAGE_NAME)
  if (!tagsPage) return

  // find tags layer
  let tagsLayer = Layers.findLayerInLayer(TAGS_LAYER_NAME, true, Layers.TEXT, tagsPage, false, null)
  if (!tagsLayer) return

  // split text into individual tags
  return tagsLayer.stringValue().split('\n')
}
