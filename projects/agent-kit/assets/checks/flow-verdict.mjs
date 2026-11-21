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

/** The measurer of the CI hold, read before the release cases and before the cause of the menu. */
const CI_HOLD = 'measure.ci.hold';

/**
 * The CI hold: { kind, pr, run } of `measure.ci.hold`, or null. A description without the measurer
 * holds nothing; a hosting that did not answer holds nothing either — the release cases decide then.
 */
export function ciHold(model, read) {
    if (!(model.measures ?? []).some((m) => m.entry === 'ci' && m.caps?.hold)) return null;
    try {
        return read(CI_HOLD) || null;
    } catch (error) {
        if (error?.name === 'HostSilent') return null;
        throw error;
    }
}

/** The refusal of a CI hold: the run, the PR, and the one move with its ready command. */
export function ciHoldReason(hold) {
    const { pr, run } = hold;
    const where = `PR #${pr.number} (\`${pr.head}\` into \`${pr.base}\`)`;
    if (hold.kind === 'running') {
        return [
            `The CI run ${run.id} of ${where} is running, and no background task of this session watches it.`,
            `The one move is to watch it in the background: \`command gh run watch ${run.id} --exit-status --interval 30\` with run_in_background — its notice wakes the session when the run ends. The watch lifts this hold; the scenario decides the rest of the turn.`,
        ].join('\n');
    }
    if (hold.kind === 'fresh') {
        const sha = String(pr.headRefOid ?? '');
        const workflow = String(hold.file ?? '').split('/').pop();
        const list = `command gh run list --commit ${sha}${workflow ? ` --workflow ${workflow}` : ''} --json databaseId --jq '.[0].databaseId'`;
        return [
            `The head ${sha.slice(0, 7)} of ${where} was pushed less than two minutes ago, and the hosting shows no CI run on it yet.`,
            `The one move is a background watch of that head: \`for i in $(seq 30); do id=$(${list}); [ -n "$id" ] && break; sleep 10; done; [ -n "$id" ] && command gh run watch "$id" --exit-status --interval 30\` with run_in_background.`,
        ].join('\n');
    }
    return [
        `The CI run ${run.id} of ${where} ended «${run.conclusion}», and no call after its end has read it.`,
        `The one move is to read it: \`command gh run view ${run.id} --log-failed\` — then fix what fell. No owner's menu is offered while the run is unread.`,
    ].join('\n');
}

/**
 * The verdict on a measured branch: { block } of a CI hold first — the end of the scenario does not
 * pass it — then { release } of the first release case, or null when the turn is held by the
 * scenario.
 */
export function decide(model, read, result) {
    const hold = ciHold(model, read);
    if (hold) return { block: ciHoldReason(hold) };
    const released = releaseCase(model, read, result);
    return released ? { release: released.log ?? released.key } : null;
}

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
 * background task comes first, { unread: { task, output, agent } }: while it is unread the move is to
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
        const { task, output, agent } = menu.cause.unread;
        if (agent) {
            lines.push(`The background agent \`${task}\` ended after the last call, and its notice has not been read.`);
            lines.push('The first move is to take its report from the notice and act on it. No owner\'s menu is offered while it is unread.');
        } else {
            const where = output ? ` — its output is \`${output}\`` : '';
            lines.push(`The background task \`${task}\` ended after the last call, and its notice has not been read${where}.`);
            lines.push('The first move is to read that output and act on it: a red result is fixed now. No owner\'s menu is offered while the task is unread.');
        }
    } else if (menu?.cause) {
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
