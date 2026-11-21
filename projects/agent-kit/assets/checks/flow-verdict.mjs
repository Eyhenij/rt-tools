/**
 * The verdict at the end of a turn — the engine command `verdict`, called by the hook on Stop.
 *
 * The turn is released by the first release case of the description whose condition is met, in the
 * order of the cases; otherwise it is held, and the refusal names one move: the next step of the
 * scenario. In the state where the stages go on, that move is the current step of the progress and
 * the command that measures it.
 *
 * When another check refused the same step twice for the same reason, or the executor stopped again
 * with no call after the previous refusal,
 * the one move is the owner's menu: the options of `words.menu`, with the number of the task put in.
 *
 * The case of the silent hosting counts only when the measurement itself stopped on the silence: a
 * read that failed for a state passed over says nothing when a later local exit is unmet. Any other
 * case the hosting could not answer is not met.
 */
import { evaluateCondition } from './flow-condition.mjs';
import { stepsOfProgress } from './work-steps-lib.mjs';

/** The measurer whose answer depends on where the measurement stopped. */
const SILENCE = 'measure.host.silent';

/** The measurers that name why the next move is the owner's menu. */
const MENU_CAUSES = { unread: 'measure.session.unread', forbidden: 'measure.session.forbidden', idle: 'measure.session.idle' };

/** The first release case met, or null. `read` answers a measurer by its reference. */
export function releaseCase(model, read, result) {
    const stoppedOnSilence = result.state !== null && result.reason !== null;
    const answer = (name) => {
        try {
            return read(name);
        } catch (error) {
            // A case the hosting could not answer is not met: an unknown fact releases nothing.
            if (error?.name === 'HostSilent') return false;
            throw error;
        }
    };
    const reader = (name) => (name === SILENCE ? stoppedOnSilence && answer(name) : answer(name));
    return model.release.find((entry) => evaluateCondition(entry.when, reader)) ?? null;
}

/**
 * Why the next move is the owner's menu: { by: '<guard>' }, { idle: true }, or null. A measurer the
 * description does not declare, or the hosting could not answer, names no cause. An unread
 * background task comes first, { unread: { task, output, long } }: while it is unread the move is to
 * read it, and no menu is offered.
 */
export function menuCause(read) {
    const answer = (name) => {
        try {
            return read(name);
        } catch {
            return false;
        }
    };
    const unread = answer(MENU_CAUSES.unread);
    if (unread) return { unread };
    const by = answer(MENU_CAUSES.forbidden);
    if (by) return { by: String(by) };
    return answer(MENU_CAUSES.idle) ? { idle: true } : null;
}

/** The options of the owner's menu: `words.menu`, the number of the task put in place of N. */
export function menuOptions(words, task) {
    return (words.menu ?? []).map((option) => (task ? option.replace(/RT-N$/, `RT-${task}`) : option));
}

/** The current step of a progress text and the count of steps not done: { number, name, left }, or null. */
export function currentStep(progress) {
    const steps = stepsOfProgress(progress ?? '').steps;
    const step = steps.find((s) => s.mark === '>');
    return step ? { number: step.number, name: step.name, left: steps.filter((s) => s.mark !== 'x').length } : null;
}

/**
 * The reason of a held turn: the measured state, its action, and the step when the stages go on. With a
 * cause of the menu the one move is the owner's menu instead.
 */
export function holdReason(model, result, step, menu = null) {
    const total = model.states.length;
    const state = model.states[result.index - 1];
    const lines = [`The scenario is not over: the work stands in the state \`${result.state}\` (${result.index} of ${total}), whose exit is not met.`];
    if (menu?.cause?.unread) {
        const { task, output, long } = menu.cause.unread;
        const where = output ? ` — its output is \`${output}\`` : '';
        lines.push(
            long
                ? `The background task \`${task}\` runs longer than the bound and its output was not read${where}.`
                : `The background task \`${task}\` ended after the last call, and its output was not read${where}.`,
        );
        lines.push('The one move is to read that output and act on it: a red result is fixed now. No owner\'s menu is offered while the task is unread.');
        return lines.join('\n');
    }
    if (menu?.cause) {
        lines.push(
            menu.cause.idle
                ? 'The previous refusal named a move, and no call followed it.'
                : `The check \`${menu.cause.by}\` refused the same step twice for the same reason.`,
        );
        const options = menuOptions(model.words, menu.task);
        lines.push(`The one move is the owner's menu: ask through the question tool with exactly these options — ${options.map((o) => `«${o}»`).join(', ')}.`);
        lines.push('Then do what the owner chose: a deferral marks the task «отложено» in the plan of the epic and takes the next unblocked task; «стоп» ends the turn.');
        return lines.join('\n');
    }
    if (step && state?.key === 'stage') {
        lines.push(`${step.left} steps of the plan are not done, counted by \`node tools/check-work-steps.mjs\`.`);
        lines.push(`The next move is step ${step.number} «${step.name}»: do it, then measure it — \`node tools/task-flow-script.mjs step ${step.number}\`.`);
    } else {
        lines.push(`The next move is the action of this state: ${state?.action ?? ''} (pattern \`${state?.pattern ?? ''}\`).`);
    }
    lines.push('`node tools/task-flow-script.mjs measure` names the exits read.');
    return lines.join('\n');
}
