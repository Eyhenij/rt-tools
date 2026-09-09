/**
 * Пометки на надстройках: какой раздел заведён ради отправленного предложения и когда его можно
 * снять.
 *
 * Надстройку заводят в день отправки предложения, а снимают, когда правка выходит в новой
 * редакции пакета. Между этими днями проходит месяц, другой заход и другой повод: в минуту
 * обновления у исполнителя в руках разложенный ресурс и надстройка, а записи предложений он не
 * открывает — на них ничто не указывает. Надстройка остаётся замещать раздел, который пакет
 * давно содержит сам.
 *
 * Пометка держит эту связь на самой надстройке: имя ресурса пакета, статья, ради которой раздел
 * заведён, и день отправки. Форма — комментарий разметки: он не виден в собранном тексте,
 * переживает слияние по заголовкам и читается машиной.
 *
 * Снимает раздел человек, а не команда: пометка называет одну статью, а в раздел могли дописать
 * и другое — снятие вслепую удалило бы то, чего пометка не касалась.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { OVERRIDES_DIR } from './config.js';
import { parseDocument, IDocument } from './sections.js';
import { byText } from './order.js';

/**
 * Пометка раздела надстройки:
 * `<!-- rt-proposed: rules/task-flow.md · «статья целиком» · 2026-09-03 -->`
 *
 * Разделители те же, что у шапки раскладки: строку читает человек, и второй знак разделения в
 * тех же файлах читался бы как другая пометка.
 */
const MARK: RegExp = /<!-- rt-proposed:\s?([^·]+)·\s?«([^»]*)»\s?·\s?([0-9-]+) -->/;

export interface IOverrideMark {
    /** Файл надстройки от корня дерева. */
    readonly file: string;
    /** Заголовок раздела, который пометка держит. */
    readonly heading: string;
    /** Ресурс пакета, ради статьи которого раздел заведён. */
    readonly resource: string;
    /** Статья: та самая цитата, которую называло предложение. */
    readonly article: string;
    /** День отправки, `ГГГГ-ММ-ДД`. */
    readonly day: string;
}

/** Один пробел вместо любой последовательности пробелов: статья в разметке перенесена по ширине строки. */
function flat(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/** Пометки одного файла надстройки. Раздел без пометки считается постоянным. */
export function marksOfOverride(text: string, file: string): readonly IOverrideMark[] {
    const document: IDocument = parseDocument(text);
    const found: IOverrideMark[] = [];

    for (const section of document.sections) {
        const match: RegExpExecArray | null = MARK.exec(section.body);

        if (match) {
            found.push({
                file,
                heading: section.heading.replace(/^#+\s*/, ''),
                resource: flat(match[1]),
                article: flat(match[2]),
                day: match[3].trim(),
            });
        }
    }

    return found;
}

/** Файлы каталога надстроек, путями от самого каталога. */
function overrideFiles(dir: string): readonly string[] {
    if (!existsSync(dir)) {
        return [];
    }

    const found: string[] = [];
    const walk: (at: string) => void = (at: string): void => {
        for (const name of readdirSync(at).sort(byText)) {
            const path: string = join(at, name);

            if (statSync(path).isDirectory()) {
                walk(path);
            } else {
                found.push(path);
            }
        }
    };

    walk(dir);

    return found;
}

/**
 * Все пометки надстроек дерева.
 *
 * Нужны команде судьбы: она сводит их с записями приёма, а «снимать сейчас или ждать редакции»
 * решает потом — по разложенному. Отдельный обход ради этого не заводится: список тот же.
 */
export function overrideMarks(root: string): readonly IOverrideMark[] {
    const dir: string = join(root, OVERRIDES_DIR);
    const found: IOverrideMark[] = [];

    for (const path of overrideFiles(dir)) {
        found.push(...marksOfOverride(readFileSync(path, 'utf8'), relative(root, path)));
    }

    return found;
}

/**
 * Надстройки, чья статья в новой редакции пакета уже есть.
 *
 * `assetsDir` — каталог ресурсов той редакции, которая раскладывается сейчас: сравнение идёт с
 * ней, а не с тем, что уже лежит в дереве. Ресурса в редакции нет — пометка молчит: пакет мог его
 * переименовать, и называть надстройку лишней на этом основании значило бы советовать снять то,
 * чему замена не пришла.
 */
export function staleOverrides(root: string, assetsDir: string): readonly IOverrideMark[] {
    const dir: string = join(root, OVERRIDES_DIR);
    const stale: IOverrideMark[] = [];

    for (const path of overrideFiles(dir)) {
        const marks: readonly IOverrideMark[] = marksOfOverride(readFileSync(path, 'utf8'), relative(root, path));

        for (const mark of marks) {
            const source: string = join(assetsDir, mark.resource);

            if (!mark.article || !existsSync(source)) {
                continue;
            }

            if (flat(readFileSync(source, 'utf8')).includes(mark.article)) {
                stale.push(mark);
            }
        }
    }

    return stale;
}
