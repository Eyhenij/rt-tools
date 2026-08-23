// rt-kit v0.12.0 · checks/board-runs.github.mjs · 5652347173ea · правится надстройкой, не здесь
/**
 * Состояние прогонов и выкатки у хостинга: что встало на вершине, чем кончилось и на сколько
 * прод отстал от главной ветки.
 *
 * Отдельным файлом, а не внутри работы с очередью: у очереди свой предмет — задачи, колонки и
 * заявки, — а здесь спрашивают конвейер. Вместе они переросли предел длины файла, и делить их
 * по предмету дешевле, чем по числу строк: правку прогонов и правку очереди делают разные
 * работы.
 *
 * Нет сети или нет токена — вызовы бросают `OfflineError`, как и остальная работа с хостингом:
 * невозможность спросить расхождением не считается.
 */
import { OWNER, REPO, gh } from './board.mjs';

/**
 * Сколько прогонов завелось на этой вершине.
 *
 * Спрашивается вершина, а не ветка: прогон промежуточного коммита о состоянии вершины не
 * говорит ничего, а список прогонов ветки отдаёт их вперемешку.
 */
export function runsOnHead(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=1`, '--jq', '.total_count'], options);
    return Number(String(answer).trim());
}

/**
 * Коммит последней успешной выкатки и то, на сколько от него ушла главная ветка.
 *
 * Спрашивается сама выкатка, а не последний прогон главной ветки. Там, где выкатку запускают
 * рукой, слияние прода не двигает вовсе, и прогон главной о нём не говорит ничего: прод
 * отставал на 476 коммитов, а сверка молчала. Судится только завершённая успехом выкатка —
 * идущая ещё может кончиться чем угодно.
 *
 * Возвращает `null`, если выкаток не было ни одной: это не расхождение, а нечего сравнивать.
 */
export function deployLag(workflow, mainBranch, options) {
    const runs = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(workflow)}/runs` + '?status=success&per_page=1',
            '--jq',
            '[.workflow_runs[] | {sha: .head_sha, at: .created_at}] | first // empty',
        ],
        options
    );
    const last = String(runs).trim();
    if (!last) {
        return null;
    }

    const run = JSON.parse(last);
    const behind = gh(
        ['api', `repos/${OWNER}/${REPO}/compare/${run.sha}...${encodeURIComponent(mainBranch)}`, '--jq', '.ahead_by'],
        options
    );
    return { sha: run.sha, at: run.at, behind: Number(String(behind).trim()) };
}

/**
 * Чем кончились прогоны на этой вершине: `success`, если все завершились успехом, `running`,
 * если хоть один ещё идёт, `failure` — если хоть один упал. Прогонов нет вовсе — `none`.
 *
 * Цвет спрашивается отдельно от факта: факт отвечает на вопрос «событие дошло», цвет — на
 * вопрос «работу можно отдавать». Второй вопрос задаётся там, где готовое стоит черновиком.
 */
export function verdictOnHead(sha, options) {
    const answer = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=20`,
            '--jq',
            '[.workflow_runs[] | {status, conclusion}] | if length == 0 then "none"' +
                ' elif any(.status != "completed") then "running"' +
                ' elif any(.conclusion != "success") then "failure"' +
                ' else "success" end',
        ],
        options
    );
    return String(answer).trim();
}

/** Когда вершина легла в ветку — по времени коммита у хостинга, а не по местным часам ветки. */
export function headCommittedAt(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/commits/${sha}`, '--jq', '.commit.committer.date'], options);
    return Date.parse(String(answer).trim());
}
