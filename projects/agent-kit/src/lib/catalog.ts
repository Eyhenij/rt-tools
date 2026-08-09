/**
 * Что пакет везёт — прочитанное с диска, до всякого выбора проекта.
 *
 * Каталог нужен отдельно от раскладки, потому что выбирать приходится раньше, чем раскладывать:
 * `init` спрашивает, какие законы взять, а `list` показывает и то, от чего проект отказался.
 * И там и там нужен полный набор, а `collectAssets` по устройству отдаёт уже отобранный.
 */
import { accessSync, constants, Dirent, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { KINDS, TKind } from './config.js';
import { IAxis, IVariant, matchesVariant, readAxes, variantOf, withoutVariant } from './variants.js';

export interface IEntryOfCatalog {
    /** Идентификатор: `laws/application/money.md`. Он же путь надстройки и ключ в `only` и `skip`. */
    readonly id: string;
    readonly kind: TKind;
    /**
     * Имя без рода, вида и расширения: `delivery`, `application/money`. Им ресурс называют в
     * строке запуска, и им же он ложится в дерево проекта.
     */
    readonly name: string;
    /** Заголовок первой строки файла; у файла без заголовка — его имя. */
    readonly title: string;
    /** Вид ресурса, если он лежит в пакете в нескольких: `git-workflow.github.md`. */
    readonly variant: IVariant | null;
    readonly text: string;
    /**
     * Запускается ли файл сам по себе. Гард зовут по пути, а не через оболочку, и файл без
     * права на запуск отвечает отказом доступа — то есть ненулевым кодом, который читается как
     * «правка отбита». Признак берётся с файла в пакете и переносится на разложенный.
     */
    readonly executable: boolean;
}

const TITLE: RegExp = /^#\s+(\S.*)$/m;

/** Запускается ли файл сам по себе. Спрашиваем систему, а не разбираем биты режима руками. */
function isExecutable(path: string): boolean {
    try {
        accessSync(path, constants.X_OK);

        return true;
    } catch {
        return false;
    }
}

/** Заголовок нужен человеку, который выбирает: имена законов ему ни о чём не говорят. */
export function titleOf(text: string, fallback: string): string {
    const found: RegExpMatchArray | null = text.match(TITLE);

    return found ? found[1].trim() : fallback;
}

/**
 * Файлы рода — вместе с теми, что лежат в подкаталогах.
 *
 * Обход рекурсивный потому, что у законов два слоя: общий закон верен любому приложению этого
 * класса, а закон приложения — только такому, где есть деньги, локали или владеющая сущность.
 * Слой отражён каталогом, и путь внутри рода едет в идентификатор целиком, чтобы разложенное
 * повторяло раскладку пакета.
 */
function filesOf(dir: string, prefix: string = ''): readonly string[] {
    let entries: readonly Dirent[];
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return [];
    }

    const files: string[] = [];
    for (const entry of [...entries].sort((one: Dirent, two: Dirent): number => one.name.localeCompare(two.name))) {
        if (entry.isFile()) {
            files.push(`${prefix}${entry.name}`);
        } else if (entry.isDirectory()) {
            files.push(...filesOf(join(dir, entry.name), `${prefix}${entry.name}/`));
        }
    }

    return files;
}

/**
 * Всё, что лежит в ресурсах пакета. Список не выписан руками, а читается из каталога:
 * выписанный разошёлся бы с ним на первом же добавленном законе, и заметить это было бы
 * нечем — ресурс просто не приезжал бы к проекту.
 */
export function readCatalog(assetsDir: string): readonly IEntryOfCatalog[] {
    const axes: readonly IAxis[] = readAxes(assetsDir);
    const entries: IEntryOfCatalog[] = [];

    for (const kind of KINDS) {
        for (const file of filesOf(join(assetsDir, kind))) {
            const path: string = join(assetsDir, kind, file);
            const text: string = readFileSync(path, 'utf8');
            const variant: IVariant | null = variantOf(file, axes);
            const name: string = withoutVariant(file, variant).replace(/\.[^./]+$/, '');
            const executable: boolean = isExecutable(path);
            entries.push({ id: `${kind}/${file}`, kind, name, title: titleOf(text, name), variant, text, executable });
        }
    }

    return entries;
}

/** Чем проект ограничил раскладку: выбором, отказом и видами, которые он назвал. */
export interface ISelection {
    readonly only: readonly string[];
    readonly skip: readonly string[];
    readonly variants: Readonly<Record<string, string>>;
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
 *
 * Вид отбирается раньше обоих: ресурс чужого хостинга не «не выбран» — его в этом дереве не
 * существует вовсе, и называть его в `skip` проекту незачем.
 */
export function isChosen(entry: IEntryOfCatalog, selection: ISelection): boolean {
    if (!matchesVariant(entry.variant, selection.variants)) {
        return false;
    }
    if (selection.skip.includes(entry.id)) {
        return false;
    }
    const restricted: boolean = selection.only.some((id: string): boolean => id.startsWith(`${entry.kind}/`));

    return !restricted || selection.only.includes(entry.id);
}

/**
 * Идентификатор по тому, как ресурс назвали в строке запуска. Принимаются все формы, которыми
 * его называют вслух: `money`, `application/money`, `money.md` и `laws/application/money.md`.
 */
export function idOf(spoken: string, kind: TKind, catalog: readonly IEntryOfCatalog[]): string | null {
    const wanted: string = spoken.trim();
    const shortOf: (entry: IEntryOfCatalog) => string = (entry: IEntryOfCatalog): string => entry.name.split('/').pop() ?? entry.name;
    const found: IEntryOfCatalog | undefined = catalog.find(
        (entry: IEntryOfCatalog): boolean =>
            entry.kind === kind &&
            (entry.id === wanted || entry.name === wanted || shortOf(entry) === wanted || entry.id.endsWith(`/${wanted}`))
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
