/**
 * Colors library
 *
 * Provides functionality to work with colors.
 */

import PALETTE from './PALETTE'

// prepare colors
let semanticColors = null

/**
 * Retrieves the semantic color for the specified hex string.
 *
 * @param {String} hex
 * @return {Object}
 */
export function hexToSemanticColor (hex) {
  if (!semanticColors) {
    semanticColors = {}
    PALETTE.colorGroups.forEach(function (colorGroup) {
      Object.keys(colorGroup.shades).forEach(function (shade) {
        let key = '#' + colorGroup.shades[shade].toUpperCase()
        semanticColors[key] = {
          displayName: colorGroup.name + '' + shade,
          groupName: colorGroup.name,
          colorName: shade
        }
      })
    })
  }

  return semanticColors[hex]
}

/**
 * Converts MSColor instance to a hex string.
 *
 * @param {MSColor} color
 * @return {String}
 */
export function colorToHex (color) {
  return rgbToHex(Math.round(color.red() * 255), Math.round(color.green() * 255), Math.round(color.blue() * 255))
}

/**
 * Converts a hex string to an instance of MSColor.
 *
 * @param {String} hex
 * @return {MSColor}
 */
export function hexToColor (hex) {
  let color = hexToRgb(hex)
  return MSColor.colorWithRed_green_blue_alpha(color.r / 255, color.g / 255, color.b / 255, 1.0)
}

/**
 * Converts a hex string to an object representing the color in terms of RGB components.
 *
 * @param {String} hex
 * @return {Object}
 */
export function hexToRgb (hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Converts RGB color components to a hex string.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {String}
 */
export function rgbToHex (r, g, b) {
  return ('#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)).toUpperCase()
}

/**
 * Returns the alpha component of an MSColor instance as a percentage.
 *
 * @param {MSColor} color
 * @return {Number}
 */
export function getAlpha (color) {
  return Math.round(color.alpha() * 100)
}
