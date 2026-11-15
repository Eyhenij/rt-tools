/**
 * The source «source.session» of the task flow description. A factory named by a
 * capability takes its ports and returns the reader; until the step that writes it, the factory
 * throws, so an unmeasured exit is never read as met.
 */

export function open() {
    throw new Error('Not implemented: source.session.open');
}
