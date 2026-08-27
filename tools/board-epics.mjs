// rt-kit v0.17.0 · checks/board-epics.github.mjs · 2cc0874905ee · правится надстройкой, не здесь
/**
 * Связь задачи с эпиком. Живёт своим файлом: сверка очереди работ и без неё стоит у предела
 * длины, а читают эти две проверки порознь.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * Метка карточки эпика. Не названа — связь не судится: отличить карточку эпика от обычной
 * задачи станет нечем.
 */
const EPIC_LABEL = CONFIG.board?.epicLabel ?? '';

/**
 * Строки линии работ — те, что стоят в таблице с колонкой «Задача».
 *
 * Замысел эпика держит и другие таблицы: источники находок, состав семей, счёт пунктов. Номера,
 * взятые из всего текста и даже из всех таблиц, делали бы задачей эпика всё, что он упомянул, —
 * прошлый эпик, из находок которого он вырос, разбор, задачу соседнего дерева.
 */
function planRows(plan) {
    const rows = [];
    let inside = false;
    for (const line of plan.split('\n')) {
        const isRow = line.trimStart().startsWith('|');
        if (!isRow) {
            inside = false;
            continue;
        }
        if (!inside) {
            // Граница слова здесь не годится: `\b` знает только латиницу, и с кириллицей она не
            // совпадает никогда — проверка молчала бы на любом замысле.
            inside = /\|[^|]*Задача/.test(line);
            continue;
        }
        rows.push(line);
    }
    return rows.join('\n');
}

/**
 * Связь задачи с эпиком, прочитанная в обе стороны.
 *
 * Задача, заведённая под эпик, называет его в теле, а замысел эпика называет её со своей
 * стороны. Односторонняя привязка выглядит целой ровно так же, как двусторонняя: читатель
 * приходит то от линии работ, то от карточки, и вторая сторона существует только для одного из
 * них. Держалась она подражанием — пока тело писали с образца соседней задачи того же эпика,
 * строка ехала вместе с формой, а задача, заведённая посреди работы находкой, писалась не с
 * образца.
 *
 * Путь к замыслу берётся из тела карточки эпика: называть его она обязана и так, а настройка
 * каталога завела бы второй источник правды. Путём считается написание с каталогом — голое имя
 * файла в теле встречается прозой и уводило бы проверку на первое же упоминание. Замысла нет на
 * диске — это своё расхождение: карточка ссылается в пустоту.
 *
 * Судится только открытое, как и вся остальная сверка: закрытая задача эпика — история, и
 * строку о ней нечем закрыть.
 */
export function checkEpicLinks(open, report) {
    // Метка не названа — карточку эпика отличить от обычной задачи нечем, и проверка молчит.
    // Молчит именно так, а не «эпиков нет»: дерево без эпиков и дерево, не назвавшее метки,
    // здесь неразличимы.
    if (!EPIC_LABEL) {
        return;
    }

    const byNumber = new Map(open.map((issue) => [issue.number, issue]));
    const epics = open.filter((issue) => (issue.labels ?? []).some((label) => label.name === EPIC_LABEL));
    const listedBy = new Map();
    // Эпики, состав которых прочитать не вышло. Их задачи обратной стороной не судятся: о
    // непрочитанном замысле уже сказано своей строкой, и четыре строки «задачи нет в замысле»
    // рядом с ней говорят о том же промахе ещё раз, называя виноватыми чужие задачи.
    const unreadable = new Set();

    for (const epic of epics) {
        const planPath = String(epic.body ?? '').match(/(?:^|[\s(`])([\w.-]+(?:\/[\w.-]+)+\.md)/)?.[1] ?? null;
        if (planPath === null) {
            report(`#${epic.number}: карточка эпика не называет путь к замыслу — состав эпика читать негде`);
            unreadable.add(epic.number);
            continue;
        }
        if (!existsSync(join(ROOT, planPath))) {
            report(`#${epic.number}: замысла эпика «${planPath}» нет на диске — карточка ссылается в пустоту`);
            unreadable.add(epic.number);
            continue;
        }

        const plan = readFileSync(join(ROOT, planPath), 'utf8');
        const numbers = new Set([...planRows(plan).matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'))].map((match) => Number(match[1])));
        for (const number of numbers) {
            if (number === epic.number || !byNumber.has(number)) {
                continue;
            }
            listedBy.set(number, epic.number);
            const body = String(byNumber.get(number).body ?? '');
            if (!new RegExp(`(?:#|${TASK_KEY}-)${epic.number}\\b`).test(body)) {
                report(
                    `#${number}: замысел эпика #${epic.number} задачу называет, а её тело эпика — нет. Допиши строку «Задача эпика #${epic.number}, замысел — ${planPath}»`
                );
            }
        }
    }

    // Обратная сторона: тело назвало эпик, а линия работ эпика этой задачи не знает. Читается
    // это как задача под эпиком, но «взять следующую» её не отдаст никогда.
    const epicNumbers = new Set(epics.map((issue) => issue.number));
    for (const issue of open) {
        if (epicNumbers.has(issue.number)) {
            continue;
        }
        const named = String(issue.body ?? '').match(new RegExp(`эпика?\\s+(?:#|${TASK_KEY}-)(\\d+)`, 'i'))?.[1];
        if (named === undefined || !epicNumbers.has(Number(named)) || unreadable.has(Number(named))) {
            continue;
        }
        if (listedBy.get(issue.number) !== Number(named)) {
            report(`#${issue.number}: тело называет эпик #${named}, а в его замысле задачи нет — «взять следующую» её не отдаст`);
        }
    }
}
