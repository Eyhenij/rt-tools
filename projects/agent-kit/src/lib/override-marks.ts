/**
 * Пометки на надстройках: какой раздел заведён ради отправленного наверх предложения и когда его
 * пора снять.
 *
 * Надстройку заводят в тот день, когда предложение уезжает, а снимают — когда правка приезжает
 * редакцией пакета. Между этими двумя днями лежит месяц, другой заход и другой повод: в минуту
 * обновления в руках у исполнителя разложенный ресурс и надстройка, а записей предложений он не
 * открывает — на них ничто не указывает. Так надстройка и остаётся замещать раздел, который пакет
 * давно везёт сам.
 *
 * Пометка эту связь держит на самой надстройке: имя ресурса пакета, статья, ради которой раздел
 * заведён, и день отправки. Формой взят комментарий разметки — он не виден в собранном тексте,
 * переживает слияние по заголовкам и читается машиной.
 *
 * Снимает раздел человек, а не команда: пометка называет статью, а раздел мог обрасти и другим —
 * снятое вслепую унесло бы то, чего эта пометка не касалась.
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
 * Разделители — те же, что у шапки раскладки: строка читается человеком, и второй знак разделения
 * в тех же файлах читался бы как другая пометка.
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

/** Один пробел вместо любой пробельной вереницы: статья в разметке перенесена по своей ширине. */
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
 * Надстройки, чья статья в приехавшей редакции пакета уже есть.
 *
 * `assetsDir` — каталог ресурсов той редакции, которая раскладывается сейчас: сравнение идёт с
 * ней, а не с тем, что уже лежит в дереве. Ресурса в редакции нет — пометка молчит: пакет мог его
 * переименовать, и звать надстройку лишней на этом основании значило бы советовать снять то, чему
 * замены не приехало.
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
