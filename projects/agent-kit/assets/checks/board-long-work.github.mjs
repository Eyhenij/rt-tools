/**
 * Работа, которую одним заходом не закрыть: метка карточки против записи в линии работ.
 *
 * Своим файлом по той же причине, что и связь с эпиком: сверка очереди работ и без них стоит у
 * предела длины, а читают эти проверки порознь.
 *
 * Помечена такая работа в двух местах, и одна метка без другой лжёт молча: исполнитель открывает
 * карточку раньше, чем линию работ, а планирует по линии. Карточка без записи обещает
 * многозаходность, которой линия не знает; запись без метки оставляет карточку выглядеть работой
 * на один заход — и следующий заход берёт её, рассчитывая закрыть за раз.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * Метка многозаходной карточки и каталог линий работ. Не названо любое из двух — связь не
 * судится вовсе: отличить многозаходную карточку от обычной станет нечем, а каталог линий у
 * каждого дерева свой.
 */
const LONG_LABEL = CONFIG.longWork?.label ?? '';
const PLANS_DIR = CONFIG.longWork?.plansDir ?? '';

/** Строки линий работ, где стоит слово метки: только они считаются записью о многозаходности. */
function markedRows() {
    const dir = join(ROOT, PLANS_DIR);
    if (!existsSync(dir)) {
        return null;
    }

    const rows = [];
    for (const name of readdirSync(dir).filter((one) => one.endsWith('.md'))) {
        for (const line of readFileSync(join(dir, name), 'utf8').split('\n')) {
            if (line.includes(LONG_LABEL)) {
                rows.push({ file: name, line });
            }
        }
    }

    return rows;
}

/**
 * Связь метки с линией работ, прочитанная в обе стороны.
 *
 * Записью считается строка, где стоят и слово метки, и номер задачи. Голое упоминание номера не
 * годится: линия работ называет все свои задачи, и большинство из них однозаходные — обратная
 * сторона краснела бы на каждой.
 *
 * Судится только открытое, как и вся остальная сверка: закрытая задача — история, и строку о ней
 * нечем закрыть.
 */
export function checkLongWork(open, report) {
    if (!LONG_LABEL || !PLANS_DIR) {
        return;
    }

    const rows = markedRows();
    if (rows === null) {
        report(`каталога линий работ «${PLANS_DIR}» нет на диске — многозаходную работу сверять не с чем`);

        return;
    }

    // Номера, названные в помеченных строках. Ключ задачи и решётка читаются оба: линия пишется
    // человеком, и форма номера в ней от строки к строке разная.
    const written = new Set();
    const whereWritten = new Map();
    for (const row of rows) {
        for (const match of row.line.matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'))) {
            const number = Number(match[1]);
            written.add(number);
            if (!whereWritten.has(number)) {
                whereWritten.set(number, row.file);
            }
        }
    }

    const labelled = new Set(
        open.filter((issue) => (issue.labels ?? []).some((label) => label.name === LONG_LABEL)).map((issue) => issue.number)
    );

    for (const number of labelled) {
        if (!written.has(number)) {
            report(
                `#${number}: помечена как «${LONG_LABEL}», а в линиях работ «${PLANS_DIR}» такой строки нет — планируют по линии, а не по карточке`
            );
        }
    }

    // Обратная сторона: линия знает работу многозаходной, а карточка выглядит работой на один
    // заход — и следующий заход берёт её, рассчитывая закрыть за раз.
    const byNumber = new Set(open.map((issue) => issue.number));
    for (const number of written) {
        if (byNumber.has(number) && !labelled.has(number)) {
            report(`#${number}: линия работ «${whereWritten.get(number)}» знает её многозаходной, а метки «${LONG_LABEL}» на карточке нет`);
        }
    }
}
