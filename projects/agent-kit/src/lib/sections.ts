/**
 * Разбор документа на разделы `## ` и слияние надстройки проекта с текстом пакета.
 *
 * Пакет везёт общий текст, проект дописывает своё. Заменять файл целиком нельзя — тогда правка
 * пакета до проекта не доедет и этого никто не заметит; не заменять ничего тоже нельзя — общий
 * текст всегда чем-то расходится с местом, куда его положили.
 *
 * Отсюда единица слияния — раздел `## `: он крупнее строки, поэтому слияние не рвёт фразу
 * посередине, и мельче файла, поэтому правка пакета доезжает во все разделы, которых проект не
 * трогал.
 */

/** Раздел документа: заголовок `## …` и всё до следующего заголовка того же уровня. */
export interface ISection {
    /** Строка заголовка целиком, вместе с решётками. */
    readonly heading: string;
    /** Текст под заголовком без краевых пустых строк. */
    readonly body: string;
}

/** Документ: вступление до первого `## ` и разделы по порядку. */
export interface IDocument {
    readonly preamble: string;
    readonly sections: readonly ISection[];
}

const SECTION_HEADING: RegExp = /^##\s+\S/;
/** Ограда блока кода: заголовок внутри неё — часть примера, а не раздел документа. */
const FENCE: RegExp = /^\s*(```|~~~)/;

const trimEdges: (lines: readonly string[]) => string = (lines: readonly string[]): string =>
    lines.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');

export function parseDocument(text: string): IDocument {
    const preamble: string[] = [];
    const sections: ISection[] = [];
    let heading: string | null = null;
    let body: string[] = [];
    let fenced: boolean = false;

    const flush: () => void = (): void => {
        if (heading !== null) {
            sections.push({ heading, body: trimEdges(body) });
        }
    };

    for (const line of text.split('\n')) {
        if (FENCE.test(line)) {
            fenced = !fenced;
        }
        if (!fenced && SECTION_HEADING.test(line)) {
            flush();
            heading = line.trimEnd();
            body = [];
            continue;
        }
        if (heading === null) {
            preamble.push(line);
        } else {
            body.push(line);
        }
    }
    flush();

    return { preamble: trimEdges(preamble), sections };
}

export function renderDocument(document: IDocument): string {
    const parts: string[] = document.preamble ? [document.preamble] : [];
    for (const section of document.sections) {
        parts.push(section.body ? `${section.heading}\n\n${section.body}` : section.heading);
    }

    return `${parts.join('\n\n')}\n`;
}

/**
 * Текст пакета с наложенной надстройкой проекта.
 *
 * Три случая, и нужны все три: совпавший заголовок **замещает** раздел пакета, новый —
 * **дописывается** в конец, пустой — **снимает** раздел. Без снятия проект не мог бы отказаться
 * от общего раздела иначе, чем правкой разложенного файла, а такая правка теряется на следующем
 * же `sync`.
 *
 * Вступление надстройки замещает вступление пакета, только если оно не пустое: у надстройки,
 * правящей один раздел, вступления нет вовсе.
 */
export function mergeDocuments(base: IDocument, override: IDocument | null): IDocument {
    if (!override) {
        return base;
    }

    const byHeading: Map<string, ISection> = new Map();
    for (const section of override.sections) {
        byHeading.set(section.heading, section);
    }

    const taken: Set<string> = new Set();
    const sections: ISection[] = [];

    for (const section of base.sections) {
        const replacement: ISection | undefined = byHeading.get(section.heading);
        if (!replacement) {
            sections.push(section);
            continue;
        }
        taken.add(section.heading);
        if (replacement.body) {
            sections.push(replacement);
        }
    }

    for (const section of override.sections) {
        if (!taken.has(section.heading) && section.body) {
            sections.push(section);
        }
    }

    return { preamble: override.preamble || base.preamble, sections };
}
