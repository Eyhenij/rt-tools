// rt-kit v0.24.0 · checks/board-runs.github.mjs · e2bff95ff156 · правится надстройкой, не здесь
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
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { OWNER, REPO, gh } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** Файл конвейера этого дерева; его нет — путей он не слушает вовсе. */
const PIPELINE = CONFIG.pushGate?.pipelineFile ?? '';
export const HAS_PIPELINE = PIPELINE !== '' && existsSync(join(ROOT, PIPELINE));

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
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(workflow)}/runs` +
                '?status=success&per_page=1',
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
 * Чем кончилась последняя выкатка: `success`, `failure`, `running` либо `none`, если её не
 * запускали ни разу.
 *
 * Спрашивается отдельно от отставания прода. Отставание считается по последней УСПЕШНОЙ выкатке,
 * и две разные беды выглядят через него одинаково: выкатку не запускали и выкатка упала. Ведут
 * они к разному — первую запускают, вторую читают журналом и чинят, — а четыре слияния подряд
 * уехали поверх поломки, которую принёс первый, и прод простоял почти два часа.
 *
 * Идущая выкатка расхождением не считается: она ещё может кончиться успехом.
 */
export function lastDeploy(workflow, options) {
    const runs = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=1`,
            '--jq',
            '[.workflow_runs[] | {status, conclusion, sha: .head_sha, at: .created_at, url: .html_url}] | first // empty',
        ],
        options
    );
    const last = String(runs).trim();
    if (!last) {
        return { verdict: 'none' };
    }

    const run = JSON.parse(last);
    if (run.status !== 'completed') {
        return { verdict: 'running', ...run };
    }

    return { verdict: run.conclusion === 'success' ? 'success' : 'failure', ...run };
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

/**
 * Прогоны вершины, вытесненные из очереди конвейера.
 *
 * Группа очереди бережёт идущий прогон и не бережёт ждущего: хостинг держит в группе один
 * ждущий, и следующий встающий вытесняет прежний. Вытесненный завершается отменой и в списке
 * неотличим от упавшего, хотя ветку не проверял ни строчкой.
 *
 * Отличает их число заданий. Отмена — общее слово для двух случаев: у прогона, остановленного
 * на ходу, задания есть и журналы у них читаются; у вытесненного из очереди их ноль, потому что
 * он не начинался. Замером по семи отменённым прогонам дерева: шесть с нулём заданий и один
 * остановленный на ходу с одним.
 *
 * Число заданий спрашивается отдельным вызовом и только у отменённых: спрошенное у каждого
 * прогона стоило бы вызова на прогон при каждой сверке.
 *
 * Зелёный прогон на той же вершине снимает ответ целиком — вытесненный за ним уже перезапущен,
 * и говорить о нём нечего.
 */
export function evictedOnHead(sha, options) {
    const answer = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=20`,
            '--jq',
            '[.workflow_runs[] | {id, status, conclusion}] | tojson',
        ],
        options
    );
    const runs = JSON.parse(String(answer).trim() || '[]');
    if (runs.some((run) => run.status === 'completed' && run.conclusion === 'success')) {
        return [];
    }

    return runs
        .filter((run) => run.status === 'completed' && run.conclusion === 'cancelled')
        .filter((run) => jobCount(run.id, options) === 0)
        .map((run) => run.id);
}

/** Сколько заданий завелось у прогона. Ноль означает, что он не начинался вовсе. */
function jobCount(id, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/actions/runs/${id}/jobs?per_page=1`, '--jq', '.total_count'], options);
    return Number(String(answer).trim());
}
