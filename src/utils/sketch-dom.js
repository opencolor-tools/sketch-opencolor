export function arrayify (items) {
  if (!items) {
    return []
  }
  var length = items.count()
  var jsArray = []
  while (length--) {
    jsArray.push(items.objectAtIndex(length))
  }
  return jsArray
}

export function layersWithChildren (layers) {
  var items = []
  arrayify(layers).forEach(function (layer) {
    items.push(layer)
    items = items.concat(arrayify(layer.children()))
  })
  return items
}

export function parentPageForObject (object) {
  if (object && object.isKindOfClass(MSPage)) {
    return object
  } else if (object && object.parentGroup() != null) {
    return parentPageForObject(object.parentGroup())
  } else {
    return null
  }
}

export function parentArtboardForObject (object) {
  if (object && object.isKindOfClass(MSArtboardGroup)) {
    return object
  } else if (object && object.parentGroup() != null) {
    return parentArtboardForObject(object.parentGroup())
  } else {
    return null
  }
}

function getStyle (layer, styleType) {
  var style = layer.style()
  if (!style[styleType]) {
    return null
  }
  return style[styleType]()
}

// styleType: one of fill, border, innerShadow
export function getStyleColor (layer, styleType) {
  var style = getStyle(layer, styleType)
  if (!style) {
    return null
  }
  return '#' + style.color().hexValue()
}

export function setStyleColor (layer, styleType, hexValue) {
  var style = layer.style()
  if (!style[styleType]) {
    return null
  }
  style[styleType]().color = MSColor.colorWithSVGString(hexValue)
}

export function findLayersInLayer (rootLayer, name, exactMatch, type, subLayersOnly, layersToExclude) {
  // create predicate format
  var formatRules = ['(name != NULL)']
  var predicateArguments = []

  if (name) {
    if (exactMatch) {
      formatRules.push('(name == %@)')
    } else {
      formatRules.push('(name like %@)')
    }
    predicateArguments.push(name)
  }

  if (type) {
    formatRules.push('(className == %@)')
    predicateArguments.push(type)
  } else {
    formatRules.push('(className == "MSLayerGroup" OR className == "MSShapeGroup" OR className == "MSArtboardGroup" OR className == "MSTextLayer")')
  }

  if (layersToExclude) {
    formatRules.push('NOT (SELF IN %@)')
    predicateArguments.push(layersToExclude)
  }

  var formatString = formatRules.join(' AND ')
  var predicate = NSPredicate.predicateWithFormat_argumentArray(formatString, predicateArguments)

  // get layers to filter
  var layers
  if (subLayersOnly) {
    layers = rootLayer.layers().array()
  } else {
    layers = rootLayer.children()
  }

  var queryResult = layers.filteredArrayUsingPredicate(predicate)
  return arrayify(queryResult)
}
