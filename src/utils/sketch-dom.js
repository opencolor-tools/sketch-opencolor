export function arrayify(items) {
  var length = items.count();
  var jsArray = [];
  while (length--) {
    jsArray.push(items.objectAtIndex(length));
  }
  return jsArray;
}

export function parentArtboardForObject(object) {
 if (object.isKindOfClass(MSArtboardGroup)) {
   return object;
 } else if (object.parentGroup() != null) {
   return parentArtboardForObject(object.parentGroup());
 } else {
   return null;
 }
}

function getStyle(layer, styleType) {
 var style = layer.style();
 if(!style[styleType]) {
   return null;
 }
 return style[styleType]();
}

//styleType: one of fill, border, innerShadow
export function getStyleColor(layer, styleType) {
 var style = getStyle(layer, styleType);
 if(!style) {
   return null;
 }
 return '#' + style.color().hexValue();
}
