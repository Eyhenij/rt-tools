// rt-kit v0.28.0 · checks/board-epic-link.github.mjs · c2387cf03326 · правится надстройкой, не здесь
/**
 * The declaration by which a task names its epic.
 *
 * A file of its own because three readers need it at once — the queue audit, the creating command
 * and the delivery guard — and each of them lies in its own layer. Read in two places, the same
 * declaration diverges silently: one side demands a shape the other does not see, and the task
 * then belongs to an epic for one reader and to none for the other.
 */
import { CONFIG } from './rt-kit-checks.config.mjs';

const TASK_KEY = CONFIG.board?.taskKey ?? '';

/**
 * The epic a task body declares itself under — or `undefined` where nothing is declared. With a
 * number given, it answers whether that very epic is declared.
 *
 * Belonging is declared by the word about the task standing right before the word about the epic —
 * the very shape the creating command writes. Read by a bare mention of the number, every task
 * that explains something about an epic got a false line: the number stands there in the
 * reasoning, in a quoted refusal, in the list of what the work does not do.
 *
 * The task state carries the answer as a field of its own: the delivery guard judges the base of a
 * branch by it, and it has no other road to the epic — the queue holds neither branches nor
 * kinship of cards.
 */
export function declaredEpicOf(body, number = null) {
    const named = String(body ?? '').match(new RegExp(`задач[аи]\\s+эпика?\\s+(?:#|${TASK_KEY}-)(\\d+)`, 'i'))?.[1];
    return number === null ? named : named !== undefined && Number(named) === number;
}
