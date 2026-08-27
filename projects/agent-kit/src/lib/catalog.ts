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
import { answersRequirement, requirementOf, withoutRequirement } from './traits.js';
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
    /**
     * Свойство дерева, без которого этот ресурс дереву не нужен: `observability.needs-db.md`.
     *
     * От вида отличается вопросом. Вид спрашивает «какой из трёх» и выбирается один; требование
     * спрашивает «есть ли», и у дерева таких свойств сразу несколько. Ресурс без требования —
     * `null`: он верен всякому дереву.
     */
    readonly needs: string | null;
    readonly text: string;
    /**
     * Запускается ли файл сам по себе. Гард зовут по пути, а не через оболочку, и файл без
     * права на запуск отвечает отказом доступа — то есть ненулевым кодом, который читается как
     * «правка отбита». Признак берётся с файла в пакете и переносится на разложенный.
     */
    readonly executable: boolean;
    /**
     * Ресурсы, без которых этот неисполним, — их идентификаторы.
     *
     * Читается из шапки самого ресурса, а не из отдельного списка при пакете: список разошёлся
     * бы с ресурсами молча, ровно тем же молчанием, ради которого требование и заведено. Паттерн
     * возвращения к работе начинается словами «хук запуска сессии отдал замысел и ход работы» —
     * без хука он неисполним, и до этой строки узнать об этом было нечем.
     */
    readonly requires: readonly string[];
}

const TITLE: RegExp = /^#\s+(\S.*)$/m;

/** Что объявила шапка ресурса. Пустое поле и отсутствующее здесь одно и то же. */
export interface IFrontMatter {
    readonly name: string;
    readonly kind: string;
    /** Закон, под которым стоит правило. */
    readonly law: string;
    /** Правило, при котором стоит паттерн. */
    readonly rule: string;
}

const FIELD: RegExp = /^([a-z]+):(.*)$/;

/**
 * Вступление между `---` в начале файла; его нет — вернётся пустая шапка.
 *
 * Живёт при каталоге, потому что связь родителя с потомком читают двое: сверка связности пакета
 * и каскад отказа. Объявление у одного из них заводило бы круговой импорт между ними.
 */
function rememberField(found: Record<string, string>, line: string): void {
    const match: RegExpExecArray | null = FIELD.exec(line);
    const value: string = match ? match[2].trim() : '';

    if (match && value) {
        found[match[1]] = value;
    }
}

export function frontMatterOf(text: string): IFrontMatter {
    const lines: readonly string[] = text.split('\n');
    const found: Record<string, string> = {};

    if (lines[0]?.trim() === '---') {
        for (const line of lines.slice(1)) {
            if (line.trim() === '---') {
                break;
            }
            rememberField(found, line);
        }
    }

    return { name: found['name'] ?? '', kind: found['kind'] ?? '', law: found['law'] ?? '', rule: found['rule'] ?? '' };
}

/**
 * Строка требования в шапке ресурса. Двух видов, потому что ресурсы двух родов: у разметки
 * `**Требует:**`, у исполняемого файла — комментарий `# Требует:`.
 */
const REQUIRES: RegExp = /^(?:#[^\S\n]*Требует:|\*\*Требует:\*\*)([^\n]*)$/m;

/**
 * Текст без огороженных примеров. Строка требования, стоящая внутри примера, требованием не
 * является: паттерн, показывающий её образец, объявлял бы требование на `<гард>.sh` — имя,
 * которого в пакете нет и быть не может. Та же граница у разбора разделов надстройки, и по той
 * же причине.
 */
function outsideFences(text: string): string {
    let fenced: boolean = false;

    return text
        .split('\n')
        .map((line: string): string => {
            if (/^\s*(```|~~~)/.test(line)) {
                fenced = !fenced;

                return '';
            }

            return fenced ? '' : line;
        })
        .join('\n');
}

/**
 * Что ресурс о себе объявил. Имена читаются идентификаторами — `hooks/observe.sh`: короткая
 * форма совпала бы у закона и правила с одним именем, а требование, указавшее не туда, хуже
 * ненайденного.
 */
export function requiresOf(text: string): readonly string[] {
    const found: RegExpExecArray | null = REQUIRES.exec(outsideFences(text));
    if (!found) {
        return [];
    }

    return found[1]
        .split(',')
        .map((name: string): string => name.trim().replace(/^`|`$/g, '').trim())
        .filter((name: string): boolean => name.length > 0);
}

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
    const found: RegExpExecArray | null = TITLE.exec(text);

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
        } else {
            // Ни файл, ни каталог — связь или узел устройства: ресурсом пакета это не бывает
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
            const needs: string | null = requirementOf(withoutVariant(file, variant));
            const name: string = withoutRequirement(withoutVariant(file, variant), needs).replace(/\.[^./]+$/, '');
            const executable: boolean = isExecutable(path);
            entries.push({
                id: `${kind}/${file}`,
                title: titleOf(text, name),
                requires: requiresOf(text),
                kind,
                name,
                variant,
                text,
                needs,
                executable,
            });
        }
    }

    return entries;
}

/** Чем проект ограничил раскладку: выбором, отказом, видами и свойствами, которые он назвал. */
export interface ISelection {
    readonly only: readonly string[];
    readonly skip: readonly string[];
    readonly variants: Readonly<Record<string, string>>;
    /**
     * Свойства дерева: что у него есть. Пусто и не названо вовсе — одно и то же: дерево о себе
     * ничего не сказало и помеченного требованием не получает.
     */
    readonly has?: readonly string[];
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
 *
 * Требование к свойству дерева слабее выбора поимённо: дерево, назвавшее ресурс словом, знает
 * про своё дерево больше, чем пакет выводит по признаку. Молчаливым такое исключение не
 * остаётся — неотвеченное требование называет перечень раскладки.
 */
export function isChosen(entry: IEntryOfCatalog, selection: ISelection): boolean {
    if (!matchesVariant(entry.variant, selection.variants)) {
        return false;
    }
    if (selection.skip.includes(entry.id)) {
        return false;
    }
    const restricted: boolean = selection.only.some((id: string): boolean => id.startsWith(`${entry.kind}/`));
    if (restricted) {
        return selection.only.includes(entry.id);
    }

    return answersRequirement(entry.needs, selection.has ?? []);
}

/** Ресурс, у которого виды есть, но ни один не отвечает тому, что выбрало дерево. */
export interface IGapOfVariant {
    readonly kind: TKind;
    /** Имя без вида — под ним ресурс лёг бы в дерево. */
    readonly name: string;
    readonly axis: string;
    /** Что выбрало дерево по этой оси. */
    readonly chosen: string;
    /** Виды, которые у ресурса есть на самом деле. */
    readonly available: readonly string[];
    /** Идентификаторы этих видов: ими же пробел и снимается через `skip`. */
    readonly ids: readonly string[];
}

/**
 * Ресурсы, оставшиеся без вида под выбор дерева.
 *
 * Молчаливый пропуск такого ресурса — худший из исходов. Правило поставки едет тремя видами, а
 * команды заведения задачи и сверки очереди — одним: дерево, выбравшее чужой хостинг, получает
 * правило, которое зовёт три команды, и ни одного скрипта под ними. Отказа при этом не бывает —
 * ресурс просто не приезжает, и узнают об этом, когда команда из правила не находится.
 *
 * Отсюда правило: **ресурс с видами, ни один из которых не совпал, — отказ, а не пропуск.**
 * Снимается он двумя способами, и оба явные: завести недостающий вид в пакете либо назвать
 * существующие в `skip` — дерево тем самым говорит, что обходится без этого ресурса.
 */
/**
 * Закрыт ли ресурс выбором: подходящий вид взят, все виды отвергнуты либо род сужен мимо него.
 *
 * Отказ от ресурса — законный ответ, и повторять его отказом раскладки незачем: дерево уже
 * сказало, что обходится без него. Род, суженный через `only`, отбирает ресурсы поимённо: не
 * названный в нём ресурс не пропал — его не просили.
 */
function closedBySelection(entries: readonly IEntryOfCatalog[], selection: ISelection): boolean {
    if (entries.some((entry: IEntryOfCatalog): boolean => matchesVariant(entry.variant, selection.variants))) {
        return true;
    }

    if (entries.every((entry: IEntryOfCatalog): boolean => selection.skip.includes(entry.id))) {
        return true;
    }

    const restricted: boolean = selection.only.some((id: string): boolean => id.startsWith(`${entries[0].kind}/`));

    return restricted && !entries.some((entry: IEntryOfCatalog): boolean => selection.only.includes(entry.id));
}

export function variantGaps(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly IGapOfVariant[] {
    const groups: Map<string, IEntryOfCatalog[]> = new Map();
    for (const entry of catalog) {
        if (entry.variant === null) {
            continue;
        }
        const key: string = `${entry.kind}/${entry.name}`;
        groups.set(key, [...(groups.get(key) ?? []), entry]);
    }

    const gaps: IGapOfVariant[] = [];
    for (const entries of [...groups.values()].filter((one: IEntryOfCatalog[]): boolean => !closedBySelection(one, selection))) {
        const axis: string = entries[0].variant?.axis ?? '';
        gaps.push({
            axis,
            kind: entries[0].kind,
            name: entries[0].name,
            chosen: selection.variants[axis] ?? '',
            available: entries.map((entry: IEntryOfCatalog): string => entry.variant?.value ?? ''),
            ids: entries.map((entry: IEntryOfCatalog): string => entry.id),
        });
    }

    return gaps;
}

/** Выбранный ресурс, чьё требование в дерево не поехало. */
export interface IBrokenLink {
    /** Кто требует — идентификатор выбранного ресурса. */
    readonly id: string;
    /** Чего не хватает — идентификатор требования. */
    readonly requires: string;
    /** Требования нет в пакете вовсе: промах в шапке ресурса, а не выбор дерева. */
    readonly unknown: boolean;
}

/**
 * Связи, разорванные выбором дерева.
 *
 * Не отказ, а предупреждение — и это главное свойство. Дерево вправе закрыть требование своим
 * средством: паттерн исполним и с чужим хуком, если тот делает то же самое. Отказ здесь отбивал
 * бы законную раскладку, а молчание оставляет дерево исправным на вид — сверка зелена на любом
 * подмножестве, сколько бы связок ни было разорвано.
 */
export function brokenLinks(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly IBrokenLink[] {
    const known: ReadonlySet<string> = new Set(catalog.map((entry: IEntryOfCatalog): string => entry.id));
    const chosen: ReadonlySet<string> = new Set(
        catalog.filter((entry: IEntryOfCatalog): boolean => isChosen(entry, selection)).map((entry: IEntryOfCatalog): string => entry.id)
    );

    const broken: IBrokenLink[] = [];
    for (const entry of catalog) {
        if (!chosen.has(entry.id)) {
            continue;
        }
        for (const required of entry.requires) {
            if (chosen.has(required)) {
                continue;
            }
            broken.push({ id: entry.id, requires: required, unknown: !known.has(required) });
        }
    }

    return broken;
}

/**
 * Идентификатор по тому, как ресурс назвали в строке запуска. Принимаются все формы, которыми
 * его называют вслух: `money`, `application/money`, `money.md` и `laws/application/money.md`.
 */
export function idOf(spoken: string, kind: TKind, catalog: readonly IEntryOfCatalog[]): string | null {
    const wanted: string = spoken.trim();
    const named: (entry: IEntryOfCatalog) => boolean = (entry: IEntryOfCatalog): boolean => {
        const short: string = entry.name.split('/').pop() ?? entry.name;

        return entry.id === wanted || entry.name === wanted || short === wanted || entry.id.endsWith(`/${wanted}`);
    };
    const found: IEntryOfCatalog | undefined = catalog.find((entry: IEntryOfCatalog): boolean => entry.kind === kind && named(entry));

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
        } else {
            // Тот же ресурс назван дважды: повтор в списке ничего не меняет
        }
    }

    return { ids, unknown };
}
