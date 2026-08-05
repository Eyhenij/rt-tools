/**
 * Что пакет везёт — прочитанное с диска, до всякого выбора проекта.
 *
 * Каталог нужен отдельно от раскладки, потому что выбирать приходится раньше, чем раскладывать:
 * `init` спрашивает, какие законы взять, а `list` показывает и то, от чего проект отказался.
 * И там и там нужен полный набор, а `collectAssets` по устройству отдаёт уже отобранный.
 */
import { Dirent, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { KINDS, TKind } from './config.js';

export interface IEntryOfCatalog {
    /** Идентификатор: `laws/delivery.md`. Он же путь надстройки и ключ в `only` и `skip`. */
    readonly id: string;
    readonly kind: TKind;
    /** Имя без рода и расширения: `delivery`. Им ресурс называют в строке запуска. */
    readonly name: string;
    /** Заголовок первой строки файла; у файла без заголовка — его имя. */
    readonly title: string;
    readonly text: string;
}

const TITLE: RegExp = /^#\s+(\S.*)$/m;

/** Заголовок нужен человеку, который выбирает: имена законов ему ни о чём не говорят. */
export function titleOf(text: string, fallback: string): string {
    const found: RegExpMatchArray | null = text.match(TITLE);

    return found ? found[1].trim() : fallback;
}

function filesOf(dir: string): readonly string[] {
    try {
        return readdirSync(dir, { withFileTypes: true })
            .filter((entry: Dirent): boolean => entry.isFile())
            .map((entry: Dirent): string => entry.name)
            .sort();
    } catch {
        return [];
    }
}

/**
 * Всё, что лежит в ресурсах пакета. Список не выписан руками, а читается из каталога:
 * выписанный разошёлся бы с ним на первом же добавленном законе, и заметить это было бы
 * нечем — ресурс просто не приезжал бы к проекту.
 */
export function readCatalog(assetsDir: string): readonly IEntryOfCatalog[] {
    const entries: IEntryOfCatalog[] = [];
    for (const kind of KINDS) {
        for (const file of filesOf(join(assetsDir, kind))) {
            const text: string = readFileSync(join(assetsDir, kind, file), 'utf8');
            const name: string = file.replace(/\.[^.]+$/, '');
            entries.push({ id: `${kind}/${file}`, kind, name, title: titleOf(text, name), text });
        }
    }

    return entries;
}

/**
 * Взят ли ресурс при этом выборе.
 *
 * `only` ограничивает **только те роды, которые сам называет**. Проект, выбравший девять
 * законов из пятнадцати, шаблоны при этом не терял бы: перечисляя законы, он говорит о
 * законах, а не обо всём, что пакет везёт. Обратное правило читалось бы как «выбрал законы —
 * остался без шаблонов», и заметил бы это только тот, кто пошёл за шаблоном.
 *
 * `skip` вычитает из выбранного. Отказ от одного закона не должен требовать переписать
 * список из пятнадцати, а точечное исключение остаётся точечным.
 */
export function isChosen(entry: IEntryOfCatalog, only: readonly string[], skip: readonly string[]): boolean {
    if (skip.includes(entry.id)) {
        return false;
    }
    const restricted: boolean = only.some((id: string): boolean => id.startsWith(`${entry.kind}/`));

    return !restricted || only.includes(entry.id);
}

/**
 * Идентификатор по тому, как ресурс назвали в строке запуска. Принимаются все три формы,
 * которыми его называют вслух: `access`, `access.md` и `laws/access.md`.
 */
export function idOf(spoken: string, kind: TKind, catalog: readonly IEntryOfCatalog[]): string | null {
    const wanted: string = spoken.trim();
    const found: IEntryOfCatalog | undefined = catalog.find(
        (entry: IEntryOfCatalog): boolean =>
            entry.kind === kind && (entry.id === wanted || entry.name === wanted || entry.id.endsWith(`/${wanted}`))
    );

    return found ? found.id : null;
}

export interface IResolvedSelection {
    readonly ids: readonly string[];
    /** Имена, которым в каталоге ничего не отвечает: промах в строке запуска, а не выбор. */
    readonly unknown: readonly string[];
}

/** Разбор `--laws access,delivery`: имя без ответа — промах, и молчать о нём нельзя. */
export function resolveSelection(spoken: readonly string[], kind: TKind, catalog: readonly IEntryOfCatalog[]): IResolvedSelection {
    const ids: string[] = [];
    const unknown: string[] = [];

    for (const name of spoken) {
        const id: string | null = idOf(name, kind, catalog);
        if (id === null) {
            unknown.push(name.trim());
        } else if (!ids.includes(id)) {
            ids.push(id);
        }
    }

    return { ids, unknown };
}
