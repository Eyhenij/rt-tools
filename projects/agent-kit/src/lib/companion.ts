/**
 * Файл-компаньон правила: чем названо в этом дереве то, о чём правило говорит приёмом.
 *
 * Правило пакета переносимо ровно потому, что не знает ни путей, ни имён: оно говорит, какой
 * приём здесь действует и что сломается без него. Но правило без имён дерева — это закон, и
 * агент по нему работать не может: ему нужно знать, как называется здесь то, о чём идёт речь,
 * и где оно лежит.
 *
 * Поэтому имена живут рядом с правилом, в отдельном файле, и пишет его проект. Пакет кладёт
 * черновик один раз и больше к нему не возвращается: сверять его нечем — своего текста у пакета
 * там нет, а перекладывать значило бы стирать написанное проектом.
 *
 * Отсюда и три состояния вместо двух. Черновик, который никто не заполнил, — не то же самое,
 * что заполненный компаньон, и не то же самое, что пропавший: он выглядит рабочим файлом, но
 * правило при нём остаётся указанием без адресата.
 */
import { IAsset } from './assets.js';
import { COMPANION_FILE } from './config.js';

/**
 * Метка незаполненного места. Стоит в каждой строке черновика, которую должен заменить проект,
 * и снимается вместе с ней: пока метка на месте, компаньон не заполнен.
 */
export const COMPANION_MARK: string = '<!-- заполняет проект -->';

export type TCompanionState =
    /** Файла нет: правило разложено, а имён дерева при нём не оказалось. */
    | 'missing'
    /** Черновик лежит, но остался как положен. */
    | 'draft'
    /** Проект его заполнил. */
    | 'filled';

export interface ICompanion {
    /** Правило, при котором стоит компаньон. */
    readonly rule: string;
    readonly path: string;
    readonly state: TCompanionState;
    /** Что записать; `null` — писать нечего, файл уже лежит. */
    readonly content: string | null;
}

/** Путь компаньона: рядом с самим правилом, в каталоге его имени. */
export const pathOf: (asset: IAsset) => string = (asset: IAsset): string => asset.target.replace(/[^/]+$/, COMPANION_FILE);

/**
 * Место имени правила в шаблоне. Угловые скобки, а не `{{дырка}}`: дырка без значения отказывает
 * раскладке, а шаблон компаньона пакет кладёт проекту и сам — на нём раскладка и споткнулась бы.
 */
export const RULE_SLOT: string = '<имя-правила>';

/** Строка таблицы «Где исполняются статьи»: статья дословно и пустое место под путь. */
const STATEMENT_ROW: string = '| <статья дословно> | `<путь>:<символ>` <!-- заполняет проект --> |';

/**
 * Статьи правила — жирные фразы, которыми начинается каждый пункт раздела о применении закона.
 * Раздел называется по-разному у правила пакета и у развёрнутого в дереве, поэтому берутся оба.
 */
function statementsOf(rule: string): readonly string[] {
    const section: RegExpMatchArray | null = rule.match(
        /^## (?:Как закон применяется здесь|Что здесь действует)$([\s\S]*?)(?=^## |$(?![\s\S]))/m
    );
    if (!section) {
        return [];
    }

    return [...section[1].matchAll(/^- \*\*(.+?)\*\*/gm)].map((found: RegExpMatchArray): string => found[1].trim());
}

/**
 * Черновик по шаблону пакета. Имя правила подставляется, чтобы заполняющий не гадал, к чему
 * файл относится, — открывают его обычно из гейта, а не из правила.
 *
 * Статьи правила переносятся в таблицу заранее: их текст — ключ связи, и переписанный руками он
 * расходится с правилом молча. Проекту остаётся вторая колонка, а не перепечатывание первой:
 * двадцать пять компаньонов на первой установке — это работа, и половина её механическая.
 */
export const draftOf: (template: string, rule: string, text?: string) => string = (
    template: string,
    rule: string,
    text: string = ''
): string => {
    const draft: string = template.split(RULE_SLOT).join(rule);
    const statements: readonly string[] = statementsOf(text);
    if (!statements.length) {
        return draft;
    }

    const rows: string = statements
        .map((statement: string): string => `| ${statement} | \`<путь>:<символ>\` ${COMPANION_MARK} |`)
        .join('\n');

    return draft.includes(STATEMENT_ROW) ? draft.replace(STATEMENT_ROW, rows) : draft;
};

export function planCompanion(asset: IAsset, existing: string | null, template: string): ICompanion {
    const path: string = pathOf(asset);
    if (existing === null) {
        return { rule: asset.name, path, state: 'missing', content: draftOf(template, asset.name, asset.text) };
    }

    return {
        rule: asset.name,
        path,
        state: existing.includes(COMPANION_MARK) ? 'draft' : 'filled',
        content: null,
    };
}

/** Что `sync --check` считает недоделанным: правило при пустом компаньоне не действует. */
export const isUnfilled: (companion: ICompanion) => boolean = (companion: ICompanion): boolean => companion.state !== 'filled';

/** Долг, добавленный обновлением: статьи правила, у которых в компаньоне дерева нет адреса. */
export interface IUnaddressed {
    /** Имя правила, чьи статьи считались. */
    readonly rule: string;
    /** Сколько статей у правила всего. */
    readonly total: number;
    /** Статьи, которых в компаньоне нет. */
    readonly missing: readonly string[];
    /** Компаньона рядом с правилом нет вовсе: долг здесь — все статьи разом. */
    readonly absent: boolean;
}

/**
 * Счёт статей без адреса. Отделён от записи файлов намеренно: раскладка кладёт их на диск, а
 * решение о том, что назвать добавленным долгом, к записи не привязано и проверяется без
 * файловой системы.
 *
 * Статья ищется в компаньоне дословно — её текст и есть ключ связи, тот же, которым сверяются
 * привязки. Переписанная руками, она расходится с правилом молча, и здесь это видно сразу:
 * такая статья считается ненайденной.
 */
export function unaddressedOf(rule: string, text: string, existing: string | null): IUnaddressed {
    const statements: readonly string[] = statementsOf(text);
    if (existing === null) {
        return { rule, total: statements.length, missing: statements, absent: true };
    }

    return {
        rule,
        total: statements.length,
        missing: statements.filter((statement: string): boolean => !existing.includes(statement)),
        absent: false,
    };
}

/**
 * Строка о добавленном долге для вывода раскладки. Молчит, когда долга нет: строка «статей без
 * адреса: 0» приходила бы при каждой раскладке и перестала бы читаться.
 *
 * Долг называется числом, а не списком: двадцать девять строк в выводе не читают, а сами статьи
 * стоят в компаньоне, куда за ними и идут.
 */
export function debtLine(found: readonly IUnaddressed[]): string | null {
    const withDebt: readonly IUnaddressed[] = found.filter((entry: IUnaddressed): boolean => entry.missing.length > 0);
    if (!withDebt.length) {
        return null;
    }

    const statements: number = withDebt.reduce((sum: number, entry: IUnaddressed): number => sum + entry.missing.length, 0);
    const absent: number = withDebt.filter((entry: IUnaddressed): boolean => entry.absent).length;
    const tail: string = absent ? `, из них ${absent} без компаньона вовсе` : '';

    return `статей без адреса: ${statements} в ${withDebt.length} компаньонах${tail}`;
}
