/*

  MUTING FUNCTIONALITY

 */

 function setMuteStateIndicatorOnLayer ($layer, state) {
   // log("set mute state")
   var layer = $layer.get(0)
   var layerID = layer.objectID()
   var containerName = 'MuteIndicators'
   var artboard = parentArtboardForObject($layer.get(0))

   if (!artboard) {
     return
   }

   // ensure group
   var container = Library.findLayersInLayer(containerName, true, false, artboard)
   if (container.length) {
     container = container.pop()
   } else {
     container = null
   }

   log('GOING 1')

   if (!container && state) {
     container = MSLayerGroup.alloc().initWithFrame_(NSMakeRect(0, 0, 0, 0))
     container.setName(containerName)
     artboard.addLayers_(NSArray.arrayWithObject_(container))
   }

   log('GOING 2')
   log(container)
   log(state)

   var indicatorName = layerID + ' - indicator'
   var indicator = null

   log('GOING 3')

   if (state) {
     log('GOING 4A')

     indicator = Library.findLayersInLayer(indicatorName, true, false, container)
     if (indicator.length) {
       indicator = indicator.pop()
     } else {
       indicator = null
     }

     if (!indicator) {
       log('create indicator')
       indicator = MSShapeGroup.shapeWithBezierPath_(NSBezierPath.bezierPathWithRect_(CGRectMake(0, 0, 100, 100)))
       indicator.setName(indicatorName)
       container.addLayers_(NSArray.arrayWithObject_(indicator))
     }
     indicator.setIsLocked(true)
     indicator.absoluteRect().setX(layer.absoluteRect().x())
     indicator.absoluteRect().setY(layer.absoluteRect().y())
     indicator.frame().setWidth(layer.frame().width())
     indicator.frame().setHeight(layer.frame().height())
     // indicator.style().removeStyleFillAtIndex(0);
     if (!indicator.style().fills().count()) {
       var fill = indicator.style().addStylePartOfType(0)
       fill.color = colorFromHex('#E3239B')
       fill.setOpacity(0.5)
     }
   } else {
     log('GOING 4B')

     if (indicator) {
       indicator.parentGroup().removeLayer(indicator)
     }
   }
 }

// ============================================
