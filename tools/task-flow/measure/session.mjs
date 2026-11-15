// rt-kit v0.37.0 · task-flow/measure/session.mjs · 6b8b24e64856 · правится надстройкой, не здесь
/**
 * The measurer «measure.session» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function wrote({ session }) {
    throw new Error('Not implemented: measure.session.wrote (session)');
}

export function role({ session }) {
    throw new Error('Not implemented: measure.session.role (session)');
}

export function menuLost({ session }) {
    throw new Error('Not implemented: measure.session.menuLost (session)');
}
