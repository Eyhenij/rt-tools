/**
 * The measurer «measure.progress» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function mirrors({ git, tree }) {
    throw new Error('Not implemented: measure.progress.mirrors (git, tree)');
}

export function done({ tree, marks }) {
    throw new Error('Not implemented: measure.progress.done (tree, marks)');
}
