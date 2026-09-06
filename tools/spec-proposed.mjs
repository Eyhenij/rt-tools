// rt-kit v0.25.0 · checks/spec-proposed.mjs · dcb83f20e6ab · правится надстройкой, не здесь
/**
 * Договорённости, ждущие переезда в спек домена.
 *
 * Договорённость, по которой код уже написан, вливается в спек домена, а её директория
 * удаляется. Оставленная в главной ветке, она читается как предложенное и не выкаченное — то
 * есть как ложь о работающем месяц приложении.
 *
 * Второй вопрос к ней — возраст. Привязка в договорённости стареет молча: объявление, на которое
 * она показывает, переезжает вместе с соседней работой, а сверять договорённость с кодом никто
 * не станет, пока она не вольётся. Три такие пролежали месяц, и промах нашёлся ровно при
 * вливании — то есть в тот час, когда чинить его дороже всего.
 *
 * Ни то, ни другое падением не делается: на середине работы часть тестов уже есть, а сама работа
 * законно идёт неделями — красная сверка отбивала бы пуш каждой ветки, включая ту, которая
 * договорённость и дописывает.
 */
import { execFileSync } from 'node:child_process';

import { ROOT } from './rt-kit-checks.config.mjs';
import { SPECS_DIR } from './spec-common.mjs';

/** За сколько суток без правок договорённость считается залежавшейся. */
const STALE_PROPOSED_DAYS = 30;

/** Сутки в миллисекундах — считать возраст удобнее в них. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Каталоги договорённостей со счётом их сценариев.
 *
 * Готовой считается та, у которой все сценарии закрыты тестами: пока хоть один помечен «Не
 * покрыто», фича не дописана.
 */
export function proposedGroups(scenarios, references) {
    const proposed = new Map();

    for (const scenario of scenarios) {
        const at = scenario.file.indexOf('/proposed/');

        if (at === -1) {
            continue;
        }

        const dir = scenario.file.slice(0, scenario.file.indexOf('/', at + '/proposed/'.length));
        const group = proposed.get(dir) ?? { total: 0, ready: 0 };
        group.total += 1;

        if (references.has(scenario.id) && !scenario.uncovered && !scenario.partial) {
            group.ready += 1;
        }

        proposed.set(dir, group);
    }

    return proposed;
}

/**
 * Дата последнего коммита у каждого каталога договорённости.
 *
 * Один проход по истории вместо вызова на каталог: лог идёт новыми вперёд, поэтому первая
 * встреченная дата каталога и есть последняя. Каталог, которого в истории ещё нет, приехал этой
 * же веткой и старым быть не может.
 *
 * Возраст меряется историей, а не временем файла на диске: свежий чекаут делает все каталоги
 * одновременными, а дня в тексте договорённости нет вовсе. Тот же довод стоит у возраста записей
 * описания прошлого.
 */
function lastCommits(dirs) {
    if (dirs.length === 0) {
        return new Map();
    }

    let log;

    try {
        log = execFileSync('git', ['log', '--format=%cI', '--name-only', '--', SPECS_DIR], {
            cwd: ROOT,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
        });
    } catch {
        return new Map();
    }

    const dates = new Map();
    let current = null;

    for (const line of log.split('\n')) {
        if (line === '') {
            continue;
        }

        const dir = dirs.find((candidate) => line.startsWith(`${candidate}/`));

        if (dir === undefined) {
            current = line.includes('/') ? current : line;
            continue;
        }

        if (current !== null && !dates.has(dir)) {
            dates.set(dir, current);
        }
    }

    return dates;
}

/** Договорённости, лежащие без правок дольше срока: путь и возраст в сутках, старые впереди. */
export function staleProposed(dirs, now = Date.now()) {
    const dates = lastCommits(dirs);

    return dirs
        .map((dir) => {
            const committed = dates.get(dir);
            const ageDays = committed === undefined ? 0 : (now - new Date(committed).getTime()) / DAY_MS;

            return { dir, ageDays };
        })
        .filter((record) => record.ageDays > STALE_PROPOSED_DAYS)
        .sort((one, other) => other.ageDays - one.ageDays);
}
