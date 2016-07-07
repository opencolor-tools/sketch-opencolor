import { findLayersInLayer } from '../utils/sketch-dom'

export function notifyTutorial (context, action) {
  var artboards = context.document.artboards()
  if (!artboards.count()) {
    return
  }
  var firstArtboard = artboards.objectAtIndex(0)
  if (firstArtboard.name() != 'oct/tutorial/config') { // eslint-disable-line eqeqeq
    return
  }
  var configString = firstArtboard.children().objectAtIndex(0).stringValue()
  var config = null
  try {
    config = JSON.parse(configString)
  } catch (e) {
    context.document.showMessage(e)
  }
  if (!config) {
    return
  }
  if (!config[action]) {
    return
  }
  var actionConfig = config[action]

  if (!actionConfig.length) {
    return
  }
  actionConfig.forEach((ruleSet) => {
    if ('show' in ruleSet) {
      findLayersInLayer(context.document.currentPage(), ruleSet['show']).forEach((l) => {
        l.setIsVisible(true)
      })
    }
    if ('hide' in ruleSet) {
      findLayersInLayer(context.document.currentPage(), ruleSet['hide']).forEach((l) => {
        l.setIsVisible(false)
      })
    }
  })
}
