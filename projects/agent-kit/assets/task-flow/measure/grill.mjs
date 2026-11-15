/**
 * The measurer «measure.grill» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function written({ git, tree }) {
    throw new Error('Not implemented: measure.grill.written (git, tree)');
}
