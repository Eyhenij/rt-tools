// rt-kit v0.41.0 · task-flow/measure/host.mjs · 2baf51034736 · правится надстройкой, не здесь
/**
 * The measurer «measure.host» — the hosting did not answer: a read failed twice in this measurement.
 * The engine reads it after the states, so it says whether the measured state stands on the silence.
 */

export function silent({ host }) {
    return () => host.silent();
}
