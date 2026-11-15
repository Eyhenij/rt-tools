// rt-kit v0.37.0 · task-flow/measure/owner.mjs · 0077748a72d3 · правится надстройкой, не здесь
/**
 * The measurer «measure.owner» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function saidStop({ owner }) {
    throw new Error('Not implemented: measure.owner.saidStop (owner)');
}

export function nudged({ owner }) {
    throw new Error('Not implemented: measure.owner.nudged (owner)');
}
