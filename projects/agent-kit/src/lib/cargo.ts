/**
 * Форма груза: то, что уезжает с дерева в приём.
 *
 * Место объявления одно на обе стороны — правило договорённости приёма. Объявляет его
 * отправляющая сторона: пакет уходит в реестр, и импорт внутренней либы приёма уехал бы в
 * описания его типов и сломал бы установку. Приём берёт форму отсюда, а своей копии не заводит:
 * из двух копий компилируется только одна, а расходятся они молча.
 *
 * Файл держится без единого импорта намеренно: его читает и приём, и всякий, кто ставит пакет,
 * — а всё остальное в пакете написано под запуск из строки запуска.
 */

/** Версия формата запроса приёма. Меняется, когда меняется состав полей самого груза. */
export const CARGO_SCHEMA_VERSION: string = '1';

/** Заголовок, которым дерево представляется приёму. */
export const TREE_TOKEN_HEADER: string = 'x-tree-token';

/** Род правки надстройки: дерево замещает раздел пакета, дописывает свой или снимает пакетный. */
export type TOverrideKind = 'replace' | 'append' | 'drop';

/** Сколько раз что-то встретилось за отрезок сводки. */
export interface ICargoCount {
    readonly name: string;
    readonly count: number;
}

/**
 * Одна правка надстройки. У замещения и снятия заголовок раздела пакетный и общий у всех, потому
 * называется; у своего раздела заголовок придумало дерево — он не уезжает вовсе.
 */
export interface ICargoOverride {
    readonly resource: string;
    readonly section: string | null;
    readonly kind: TOverrideKind;
}

/** Общее у всякого груза: чем разбирать и от какого дерева приехало. */
export interface ICargoHead {
    readonly schema: string;
    readonly tree: string;
}

/** Сводка наблюдений дерева за отрезок дней вместе со снимком надстроек. */
export interface ISummaryCargo extends ICargoHead {
    readonly days: number;
    readonly sessions: number;
    readonly loads: readonly ICargoCount[];
    readonly denials: readonly ICargoCount[];
    readonly kinds: readonly ICargoCount[];
    readonly guards: readonly ICargoCount[];
    /** Ресурсы, разложенные в дерево и не загруженные за отрезок ни разу. */
    readonly unused: readonly string[];
    /** Ресурсы пакета, которых дерево не разложило вовсе. */
    readonly unpicked: readonly string[];
    readonly overrides: readonly ICargoOverride[];
    /** Версии схемы строк наблюдения, встреченные за отрезок. Приём их не судит. */
    readonly versions: readonly string[];
    readonly total: number;
}

/** Одно предложение по слою правил. */
export interface IProposalItem {
    readonly text: string;
    readonly address: string;
    readonly resource: string;
}

export interface IProposalsCargo extends ICargoHead {
    readonly items: readonly IProposalItem[];
}

/** Один разбор происшествия: имя файла на дереве и текст целиком. */
export interface IPostmortemItem {
    readonly file: string;
    readonly text: string;
}

export interface IPostmortemsCargo extends ICargoHead {
    readonly items: readonly IPostmortemItem[];
}

/** Ответ приёма на принятый груз: дерево и месяц печатаются владельцу отправляющей стороной. */
export interface IIntakeAccepted {
    readonly tree: string;
    /** Месяц записи в форме `2026-08`, по всемирному времени приёма. */
    readonly month: string;
    /** Запись месяца заведена этим запросом, а не обновлена. */
    readonly created: boolean;
}
