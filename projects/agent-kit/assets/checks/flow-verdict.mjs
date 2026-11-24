/**
 * The verdict at the end of a turn — the engine command `verdict`, called by the hook on Stop.
 *
 * The turn is released by the first release case of the description whose condition is met, in the
 * order of the cases; otherwise it is held, and the refusal names one move: the next step of the
 * scenario. In the state where the stages go on, that move is the current step of the progress and
 * the command that measures it.
 *
 * When another check refused the same step twice for the same reason, or the executor stopped again
 * with no call after a refusal of the engine itself,
 * the one move is the owner's menu: the options of `words.menu`, with the number of the task put in.
 * A stop again after refusals of other stop hooks only names those hooks and the move instead.
 * While the boundary of an autonomous session lies ahead, the default takes the place of that menu.
 *
 * The case of the silent hosting counts only when the measurement itself stopped on the silence: a
 * read that failed for a state passed over says nothing when a later local exit is unmet. Any other
 * case the hosting could not answer is not met.
 */
import { evaluateCondition } from './flow-condition.mjs';
import { stepsOfPlan, stepsOfProgress } from './work-steps-lib.mjs';

/** The measurer whose answer depends on where the measurement stopped. */
const SILENCE = 'measure.host.silent';

/** The measurers that name why the next move is the owner's menu. */
const MENU_CAUSES = { unread: 'measure.session.unread', hung: 'measure.session.hung', forbidden: 'measure.session.forbidden', idle: 'measure.session.idle' };

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
        `The one move is to read it: \`command gh run view ${run.id} --log-failed | tail -n 200\` — then fix what fell when it is this session's work, or name the run in the reply when another session already fixes it. No owner's menu is offered while the run is unread.`,
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
 * read it, and no menu is offered. A stop refused only by other hooks gives { foreign: ['<hook>', …] }:
 * the hold names those hooks and the move of the state, not the menu.
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
    // A task past the bound of the wait is hung: the move is to deal with it, not the owner's menu.
    // A step another check refused twice still goes to the owner's menu above.
    const hung = answer(MENU_CAUSES.hung);
    if (hung && typeof hung === 'object') return { hung };
    const idle = answer(MENU_CAUSES.idle);
    // A stop refused only by other hooks is no idle one: no menu, the refusal is named in one line.
    const foreign = idle && typeof idle === 'object' ? [idle.foreign ?? []].flat().filter(Boolean).map(String) : [];
    if (foreign.length > 0) return { foreign };
    return idle ? { idle: true } : null;
}

/** A moment as the local `ГГГГ-ММ-ДДTЧЧ:ММ`: boundaries compare as text, the way the other guards compare them. */
function localMoment(at) {
    const two = (n) => String(n).padStart(2, '0');
    return `${at.getFullYear()}-${two(at.getMonth() + 1)}-${two(at.getDate())}T${two(at.getHours())}:${two(at.getMinutes())}`;
}

/**
 * The boundary of an autonomous session, from the text of its morning list: `ГГГГ-ММ-ДДTЧЧ:ММ` of the
 * line `Автономно до:` in the head while it lies ahead of `now`, otherwise null. The head ends at the
 * first row of the table: a row that quotes the line is no boundary. A moment the clock does not have,
 * hour 25 say, is no boundary either.
 */
export function nightBoundary(list, now) {
    const head = (list ?? '').split(/^\|/m)[0];
    const until = head.match(/^Автономно до: *(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d)\s*$/m)?.[1] ?? null;
    return until && until > localMoment(now) ? until : null;
}

/** The lines of the default that takes the place of the owner's menu in an autonomous session. */
function nightLines({ until, list }) {
    return [
        `An autonomous session does not ask the owner before its boundary, ${until}: no menu is offered.`,
        'The one move is the default of the rule `autonomous-work`: do what the refusal named.',
        `Where that takes an outside step the line «Разрешено:» does not name, or a guard's window, the work waits: its line in the morning list \`${list}\` names the step, its card and its branch stay, and the next work of the chain is taken.`,
        `Where that takes the owner's word or a red run cannot be fixed, the work stops: its line in the list names the reason, its card goes back, and the next work is taken from the last green branch.`,
        'With no next work left, the list is completed and its last line says so.',
    ];
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
 * The step the stages wait for: the current one of the progress, else the first step of the plan that
 * the progress does not mark done or that has no matched mark. `{ number, name, left, done }`, or null;
 * `matched(number)` answers the mark of a step.
 */
export function pendingStep(progress, matched, plan = '') {
    const marked = stepsOfProgress(progress ?? '').steps;
    const planned = plan ? stepsOfPlan(plan).map((s) => ({ ...s, mark: marked.find((m) => m.number === s.number)?.mark ?? ' ' })) : marked;
    const open = planned.filter((s) => s.mark !== 'x' || !matched(s.number));
    const step = marked.find((s) => s.mark === '>') ?? open[0];
    return step ? { number: step.number, name: step.name, left: open.length, done: step.mark === 'x' } : null;
}

/**
 * The step of a running stage with no current step: from `text`, the progress on disk, or with no
 * folder from the last progress of the history, with the commit that took the folder apart. Null when
 * no progress is found.
 */
export function stageStep(git, marks, folder, branch, text = null) {
    const progress = text ?? git.lastVersion(`${folder}/progress.md`);
    const plan = git.lastVersion(`${folder}/plan.md`) ?? '';
    const pending = progress === null ? null : pendingStep(progress, (number) => marks.step(branch, number)?.matched === true, plan);
    return pending ? { ...pending, removedBy: text === null ? git.removedAt(folder) : null } : null;
}

/** The lines of the step the stages wait for; `removedBy` names the commit that took the folder apart. */
function stepLines(step) {
    const measure = `\`node tools/task-flow-script.mjs step ${step.number}\``;
    const back = step.removedBy ? `\`git revert --no-edit ${step.removedBy}\`` : null;
    if (!back) {
        // A step read with the marks: its count is not the one of `check-work-steps`, which reads the progress alone.
        const count = step.done === undefined ? 'are not done, counted by `node tools/check-work-steps.mjs`' : 'are not done or have no matched mark';
        return [`${step.left} steps of the plan ${count}.`, `The next move is step ${step.number} «${step.name}»: do it, then measure it — ${measure}.`];
    }
    const lines = [`${step.left} steps of the plan are not done or have no matched mark, read from the last progress of the history: the task folder is taken apart by ${step.removedBy.slice(0, 9)}.`];
    if (!step.done) {
        lines.push(`The next move is step ${step.number} «${step.name}»: the history does not mark it done, so bring the folder back — ${back} — then do the step and measure it — ${measure}.`);
    } else {
        lines.push(`The next move is step ${step.number} «${step.name}»: measure it — ${measure}; the command puts the folder back for the run.`);
        lines.push(`A step that does not match again is fixed where its check reads; a fix that lies in the folder — a check replaced in the progress — needs the folder back — ${back} — then take it apart again.`);
    }
    return lines;
}

/** The lines with the move of the state after them: the step when the stages go on, else the action. */
function withNextMove(lines, step, state) {
    if (step && state?.key === 'stage') {
        lines.push(...stepLines(step));
    } else {
        lines.push(`The next move is the action of this state: ${state?.action ?? ''} (pattern \`${state?.pattern ?? ''}\`).`);
    }
    lines.push('`node tools/task-flow-script.mjs measure` names the exits read.');
    return lines.join('\n');
}

/**
 * The reason of a held turn: the measured state, its action, and the step when the stages go on. With a
 * cause of the menu the one move is the owner's menu instead, or the default when `menu.night` carries
 * the boundary of an autonomous session and its list: `{ until, list }`.
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
    } else if (menu?.cause?.hung) {
        const { task, minutes, output } = menu.cause.hung;
        const where = output ? ` — its output is \`${output}\`` : '';
        lines.push(`The background task \`${task}\` runs ${minutes} minutes with no notice, past the bound of the wait: it is hung${where}.`);
        lines.push('The first move is to read its output, then stop it or start it again, and go on with the step. No owner\'s menu is offered while it hangs.');
    } else if (menu?.cause?.foreign) {
        const hooks = menu.cause.foreign.map((hook) => `\`${hook}\``).join(', ');
        lines.push(`The previous refusal came from ${hooks}, not from this check, and no owner's menu is offered for it. Do what it named; when it is not yours, say so in one line and make the move below in the same turn: a stop with no call after this refusal gives the menu.`);
    } else if (menu?.cause) {
        lines.push(
            menu.cause.idle
                ? 'The previous refusal named a move, and no call followed it.'
                : `The check \`${menu.cause.by}\` refused the same step twice for the same reason.`,
        );
        if (menu.night) {
            lines.push(...nightLines(menu.night));
            // An idle stop has a move of its own below; a step refused twice is the one the default replaces.
            return menu.cause.idle ? withNextMove(lines, step, state) : lines.join('\n');
        }
        const options = menuOptions(model.words, menu.task);
        lines.push(`The one move is the owner's menu: ask through the question tool with exactly these options — ${options.map((o) => `«${o}»`).join(', ')} — and say in the question that the way goes into its free field.`);
        lines.push('Then do what the owner chose: a deferral marks the task «отложено» in the plan of the epic and takes the next unblocked task; a way written by the owner is taken in the same step. A bare «подскажу путь» with no text is followed by one question with a free field only.');
        return lines.join('\n');
    }
    return withNextMove(lines, step, state);
}
