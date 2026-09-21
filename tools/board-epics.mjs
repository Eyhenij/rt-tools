// rt-kit v0.29.0 · checks/board-epics.github.mjs · 16be87e6de4d · правится надстройкой, не здесь
/**
 * The link between a task and an epic. Lives in a file of its own: the work queue audit stands at
 * the length limit even without it, and these two checks are read separately.
 */
import { declaredEpicOf } from './board-epic-link.mjs';
import { planPathOf, planRows } from './board-epic-plan.mjs';
import { ghJson, numberFromTitle, OfflineError, OWNER, REPO, TASK_KEY } from './board.mjs';
import { CONFIG } from './rt-kit-checks.config.mjs';

/**
 * The label of an epic card. Not named — the link is not judged: there would be nothing left to
 * tell an epic card from an ordinary task by.
 */
// Чтение объявления переехало в свой модуль, а звали его отсюда: имя оставлено на прежнем месте,
// чтобы соседям не пришлось знать о переезде. Тем же ходом переехал выбор документа замысла — его
// читает и команда заведения задачи.
export { declaredEpicOf, planPathOf, planRows };

const EPIC_LABEL = CONFIG.board?.epicLabel ?? '';

/** The labels of the cargo of the trees: those records are not tasks and are not judged as such. */
const CARGO_LABELS = CONFIG.board?.cargoLabels ?? [];

/**
 * The link between a task and an epic, read in both directions.
 *
 * A task created under an epic names it in its body, and the epic plan names the task from its own
 * side. A one-sided binding looks whole exactly as a two-sided one does: the reader comes now from
 * the epic plan, now from its card, and the second side exists only for one of them. It held by
 * imitation — while a body was written from the sample of a neighbouring task of the same epic, the
 * line travelled with the shape, and a task created in the middle of work out of a finding was not
 * written from a sample.
 *
 * The path to the plan is taken from the body of the epic card: it has to name it anyway, and a
 * directory setting would create a second source of truth. A path counts as a spelling with a
 * directory — a bare file name in the body occurs in prose and would lead the check to the very
 * first mention. A plan absent from disk is a discrepancy of its own: the card points into
 * emptiness.
 *
 * Only what is open is judged, as in the rest of the audit: a closed task of an epic is history,
 * and there is nothing to close a line about it with.
 */
export function checkEpicLinks(open, report) {
    // The label is not named — there is nothing to tell an epic card from an ordinary task by, and
    // the check stays silent. Silent exactly so, not "there are no epics": a tree without epics and
    // a tree that has not named the label are indistinguishable here.
    if (!EPIC_LABEL) {
        return;
    }

    const byNumber = new Map(open.map((issue) => [issue.number, issue]));
    const epics = open.filter((issue) => (issue.labels ?? []).some((label) => label.name === EPIC_LABEL));
    const listedBy = new Map();
    // Epics whose makeup could not be read. Their tasks are not judged from the other side: an
    // unread plan has already been reported by a line of its own, and four lines "the task is not in
    // the plan" beside it speak of the same miss again, naming other tasks as guilty.
    const unreadable = new Set();

    for (const epic of epics) {
        const found = planPathOf(epic.body, { epicNumber: epic.number });
        if (found.path === null) {
            report(`#${epic.number}: ${found.why}`);
            unreadable.add(epic.number);
            continue;
        }

        const planPath = found.path;
        const mentions = planRows(found.text).matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'));
        const numbers = new Set([...mentions].map((match) => Number(match[1])));
        for (const number of numbers) {
            if (number === epic.number || !byNumber.has(number)) {
                continue;
            }
            listedBy.set(number, epic.number);
            const body = String(byNumber.get(number).body ?? '');
            if (!declaredEpicOf(body, epic.number)) {
                report(
                    `#${number}: the plan of the epic #${epic.number} names the task, and its body does not name the epic. Add the line «Задача эпика #${epic.number}, замысел — ${planPath}»`
                );
            }
        }
    }

    // The other side: the body named the epic, and the epic plan does not know this task. It reads
    // as a task under an epic, but "take the next one" will never hand it out.
    const epicNumbers = new Set(epics.map((issue) => issue.number));
    for (const issue of open) {
        if (epicNumbers.has(issue.number)) {
            continue;
        }
        const named = declaredEpicOf(String(issue.body ?? ''));
        if (named === undefined || !epicNumbers.has(Number(named)) || unreadable.has(Number(named))) {
            continue;
        }
        if (listedBy.get(issue.number) !== Number(named)) {
            report(`#${issue.number}: the body names the epic #${named}, and its plan does not carry the task — «take the next one» will not give it out`);
        }
    }

    checkTasksOutsideEpics(open, epicNumbers, report);
}

/**
 * The word by which a task declares itself as work outside an epic. It is written by the creating
 * command from the word of the owner, and the audit reads exactly that shape: work outside an epic
 * is lawful, and only the owner names it as such.
 */
const OUTSIDE_EPIC = /работа\s+вне\s+эпика/i;

/**
 * A task belonging to no epic and carrying no word of the owner about work outside one.
 *
 * The delivery guard refuses such a task at the creating command, and only there: a card made
 * through the web goes past every guard, and one created before this order came in has neither
 * line. By the queue it reads as ordinary work, and that nothing stands behind it shows nowhere —
 * the audit is the only reader that comes for exactly this.
 *
 * The cargo of the trees is not judged: those records are not tasks at all — they have no title
 * with a number, no executor and no place on the board, and never will.
 */
function checkTasksOutsideEpics(open, epicNumbers, report) {
    for (const issue of open) {
        if (epicNumbers.has(issue.number)) {
            continue;
        }
        if ((issue.labels ?? []).some((label) => CARGO_LABELS.includes(label.name))) {
            continue;
        }
        const body = String(issue.body ?? '');
        if (declaredEpicOf(body) !== undefined || OUTSIDE_EPIC.test(body)) {
            continue;
        }
        report(
            `#${issue.number}: the task names no epic, and no word of the owner about work outside one. Add the line «Задача эпика #<номер>, замысел — <путь>» or «Работа вне эпика — <слово владельца>»`
        );
    }
}

/**
 * The tasks of an epic linked to its card as sub-issues.
 *
 * The plan of the epic holds the makeup, and the body of a task names the epic — but both are
 * text, and the board reads neither. On the board a task of an epic looks exactly like a task
 * outside one: the epic card shows no list of its tasks, no count of the done ones, and whoever
 * looks at the board assembles both by hand from the list of open cards.
 *
 * A sub-issue is the hosting's own link between two cards, and it fills all three at once: the
 * epic card gets the list, the task card gets the line about its parent, and the board card gets
 * the "done of total" bar.
 *
 * The list of the epic's tasks is taken from its plan, as everywhere in this audit — the plan is
 * the makeup. Closed tasks are judged too, unlike the rest of the audit: the bar counts them, and
 * an epic whose closed tasks are not linked shows a share lower than the true one.
 *
 * Arguments: the open cards, the reporting function, the call options of the hosting client.
 */
export function checkEpicSubIssues(open, report, options) {
    if (!EPIC_LABEL || !OWNER || !REPO) {
        return;
    }

    const epics = open.filter((issue) => (issue.labels ?? []).some((label) => label.name === EPIC_LABEL));
    for (const epic of epics) {
        const found = planPathOf(epic.body, { epicNumber: epic.number });
        if (found.path === null) {
            // The unread plan has already been reported by a line of its own in the link check.
            continue;
        }

        const rows = planRows(found.text);
        const named = new Set([...rows.matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'))].map((match) => Number(match[1])));
        named.delete(epic.number);
        if (named.size === 0) {
            continue;
        }

        let linked;
        try {
            // The list comes in pages, and an epic outgrows one page long before it is closed.
            // Read by the first page alone, the audit calls a linked task unlinked: the line
            // then stands in every run, the eye stops reading it, and a real divergence rides
            // past together with it.
            linked = new Set(
                ghJson(['api', '--paginate', `repos/${OWNER}/${REPO}/issues/${epic.number}/sub_issues`, '--jq', '[.[].number]'], options)
            );
        } catch (error) {
            if (error instanceof OfflineError) {
                throw error;
            }
            // The hosting has no such link at all, or the call is refused: this is not a
            // discrepancy of the tree, and a line about it would repeat every run.
            continue;
        }

        const missing = [...named].filter((number) => !linked.has(number)).sort((left, right) => left - right);
        if (missing.length > 0) {
            report(
                `#${epic.number}: the plan names tasks that are not sub-issues of the epic card — ${missing.map((number) => `#${number}`).join(', ')}. On the board the epic then shows neither its makeup nor how much of it is done`
            );
        }
    }
}

/**
 * The base of an open request about a task of an epic.
 *
 * The delivery guard judges this at the opening, and only there: a request opened by a person from
 * the hosting page goes past it, and one opened before this order came in carries the base it was
 * opened with. In the list of requests the base is not shown at all — the reader sees the title and
 * the branch, and a request going into the main branch past its epic looks like every other.
 *
 * The branch of the epic is recognised by its number in the name, not by a list of refs: the audit
 * reads the queue and does not go to the tree, and a base carrying the number of the epic is its
 * branch — a task and its epic never share a number.
 */
export function checkEpicPullBase(open, pulls, report) {
    if (!EPIC_LABEL) {
        return;
    }

    const epicOf = new Map();
    for (const issue of open) {
        const named = declaredEpicOf(String(issue.body ?? ''));
        if (named !== undefined) {
            epicOf.set(issue.number, Number(named));
        }
    }

    for (const pull of pulls) {
        const number = numberFromTitle(pull.title);
        if (number === null || !epicOf.has(number)) {
            continue;
        }
        const epic = epicOf.get(number);
        const base = String(pull.baseRefName ?? '');
        if (base.startsWith(`${TASK_KEY}-${epic}-`)) {
            continue;
        }
        report(
            `PR #${pull.number}: the task #${number} belongs to the epic #${epic}, and the base of the request is «${base}». A request past the epic takes the task out of it: the epic is handed in without it`
        );
    }
}

/**
 * Two states of an epic that nothing sees.
 *
 * **An epic without a branch.** Its branch is taken before the first of its tasks, and one that was
 * not taken leaves every task standing on the main branch: the epic is then merged piece by piece,
 * and there is nothing left to hand in whole. The card says nothing about a branch, and the list of
 * requests shows none while no request is open from it.
 *
 * **An epic whose tasks are over.** Its request into the main branch opens when the last folder is
 * taken apart, and until it opens the work of the whole epic lies outside the main branch while
 * looking finished: every task is closed, the board is empty, and only the epic card stays open.
 *
 * Both are read by the same two things: the open tasks of the epic and the open requests. The
 * branch of the epic is recognised by its number in the name — the audit reads the queue and does
 * not go to the tree.
 */
export function checkEpicState(open, pulls, report) {
    if (!EPIC_LABEL) {
        return;
    }

    const epics = open.filter((issue) => (issue.labels ?? []).some((label) => label.name === EPIC_LABEL));
    if (epics.length === 0) {
        return;
    }

    const claimed = new Map();
    for (const issue of open) {
        const named = declaredEpicOf(String(issue.body ?? ''));
        if (named !== undefined) {
            claimed.set(issue.number, Number(named));
        }
    }

    for (const epic of epics) {
        const prefix = `${TASK_KEY}-${epic.number}-`;
        const fromEpic = pulls.filter((pull) => String(pull.headRefName ?? '').startsWith(prefix));
        const intoEpic = pulls.filter((pull) => String(pull.baseRefName ?? '').startsWith(prefix));
        const tasksLeft = [...claimed.entries()].filter(([, number]) => number === epic.number);

        // A branch of the epic shows in a request either way: one from it, or one into it. Neither
        // — and there is nothing in the queue to say the branch exists at all.
        if (fromEpic.length === 0 && intoEpic.length === 0) {
            report(
                `#${epic.number}: the epic has no branch in the requests — neither one from it nor one into it. The branch of an epic is taken before its first task, and without it every task stands on the main branch`
            );
            continue;
        }

        if (tasksLeft.length === 0 && fromEpic.length === 0) {
            report(
                `#${epic.number}: the tasks of the epic are over, and no request from its branch is open. Until it opens, the work of the whole epic lies outside the main branch while looking finished`
            );
        }
    }
}

