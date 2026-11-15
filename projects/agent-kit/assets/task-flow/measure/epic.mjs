/**
 * The measurer «measure.epic» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function declared({ git, host }) {
    throw new Error('Not implemented: measure.epic.declared (git, host)');
}

export function nextTaken({ git, tree }) {
    throw new Error('Not implemented: measure.epic.nextTaken (git, tree)');
}

export function mergedMarked({ host, tree }) {
    throw new Error('Not implemented: measure.epic.mergedMarked (host, tree)');
}

export function finished({ git, host }) {
    throw new Error('Not implemented: measure.epic.finished (git, host)');
}
