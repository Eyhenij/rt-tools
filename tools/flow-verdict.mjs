// rt-kit v0.37.0 · checks/flow-verdict.mjs · 69f924754fa4 · правится надстройкой, не здесь
/**
 * The verdict at the end of a turn — the engine command `verdict`, called by the hook on Stop.
 *
 * The turn is released by the first release case of the description whose condition is met, in the
 * order of the cases; otherwise it is held, and the refusal names one move: the next step of the
 * scenario. In the state where the stages go on, that move is the current step of the progress and
 * the command that measures it.
 *
 * When the next step belongs to the owner, or another check refused it twice for the same reason,
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
const MENU_CAUSES = { owner: 'measure.epic.ownerStep', forbidden: 'measure.session.forbidden' };

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
 * Why the next move is the owner's menu: { owner: true }, { by: '<guard>' }, or null. A measurer the
 * description does not declare, or the hosting could not answer, names no cause.
 */
export function menuCause(read) {
    const answer = (name) => {
        try {
            return read(name);
        } catch {
            return false;
        }
    };
    if (answer(MENU_CAUSES.owner)) return { owner: true };
    const by = answer(MENU_CAUSES.forbidden);
    return by ? { by: String(by) } : null;
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
    if (menu?.cause) {
        lines.push(
            menu.cause.owner
                ? 'The next step is the owner\'s: the row of the task in the plan of the epic names the owner\'s step.'
                : `The check \`${menu.cause.by}\` refused the same step twice for the same reason.`,
        );
        const options = menuOptions(model.words, menu.task);
        lines.push(`The one move is the owner's menu: ask through the question tool with exactly these options — ${options.map((o) => `«${o}»`).join(', ')}.`);
        lines.push('Then do what the owner chose: a deferral marks the task «отложено» in the plan of the epic and takes the next unblocked task; «сделаю сам» marks it «шаг владельца «сделаю сам»» and takes the next; «стоп» ends the turn.');
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
