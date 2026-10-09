// rt-kit v0.30.0 · checks/task-new-queue.github.mjs · b4ac3c8e8924 · правится надстройкой, не здесь
/**
 * The fifth step of creating a task: creation is confirmed by the answer of the work queue, not by
 * the output of the command.
 *
 * All four steps before it answer for their own calls and stay silent about whether the task is
 * visible to whoever comes for it. Sixteen creations in a row printed the number with a link that
 * way, and not one of them landed in the queue: the account was limited by the hosting, and the
 * calls gave no refusal at that.
 */
import { OfflineError, describeTaskState, taskState } from './board.mjs';

/**
 * The window of waiting: the pauses between readings, in milliseconds, growing, about thirty seconds
 * in all. The queue hands a new card back after seconds, and the delay sometimes outlasts a window
 * of twelve seconds: one creation in six printed «NO» for a card that stood on the board with its
 * assignee. A false refusal here costs more than a delay — it pushes to create the card a second
 * time, and only an administrator can take it off the board. The list of pauses can be set by
 * `RT_TASK_NEW_PAUSES_MS` — a suite does not wait half a minute for it.
 */
export const QUEUE_PAUSES_MS = (process.env.RT_TASK_NEW_PAUSES_MS || '1000,2000,4000,8000,15000')
    .split(',')
    .map((pause) => Number(pause))
    .filter((pause) => Number.isFinite(pause) && pause >= 0);

const WAITED_SECONDS = Number((QUEUE_PAUSES_MS.reduce((sum, pause) => sum + pause, 0) / 1000).toFixed(1));

/**
 * One reading of the queue. `unreachable` — there was nothing to ask with: there is nothing to
 * repeat, the answer is not late, there will be none at all.
 */
function askQueue(number, token, waitedSeconds) {
    try {
        return { answer: describeTaskState(number, taskState(number, { token }), waitedSeconds), unreachable: false };
    } catch (error) {
        const reason = error instanceof OfflineError ? error.message : String(error.message ?? error);
        return { answer: describeTaskState(number, { offline: reason }), unreachable: true };
    }
}

/**
 * The queue's answer about the created task. «NO» is printed only after the whole window: until then
 * it is the queue's delay, not an answer.
 */
export function confirmInQueue(number, token) {
    let reading = askQueue(number, token, 0);
    for (let attempt = 0; !reading.answer.ok && !reading.unreachable && attempt < QUEUE_PAUSES_MS.length; attempt += 1) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, QUEUE_PAUSES_MS[attempt]);
        reading = askQueue(number, token, WAITED_SECONDS);
    }
    return reading.answer;
}
