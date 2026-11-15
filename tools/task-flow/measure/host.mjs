// rt-kit v0.37.0 · task-flow/measure/host.mjs · d2a916e10f2c · правится надстройкой, не здесь
/**
 * The measurer «measure.host» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function silent({ host }) {
    throw new Error('Not implemented: measure.host.silent (host)');
}
