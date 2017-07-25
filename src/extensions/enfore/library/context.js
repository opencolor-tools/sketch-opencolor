/**
 * Context library
 *
 * Provides a convenient way to set and get the current command context.
 */

// store context
let context = null

/**
 * Set and get context via the same function.
 *
 * @param {Object} newContext
 * @return {Object}
 */
export default function (newContext) {
  // set new context
  if (newContext) {
    context = newContext
  }

  return context
}
