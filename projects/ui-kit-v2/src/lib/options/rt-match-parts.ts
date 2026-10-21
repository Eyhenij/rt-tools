import { rtSearchFold, rtSearchWords } from './rt-search-match';

/** Кусок подписи: текст и то, совпал ли он с запросом. */
export interface IRtMatchPart {
    text: string;
    matched: boolean;
}

function markWord(marks: boolean[], folded: string, word: string): void {
    for (let at: number = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + 1)) {
        marks.fill(true, at, at + word.length);
    }
}

/**
 * Подпись, разрезанная по словам запроса тем же правилом, что и отбор: совпавшие куски отмечены.
 *
 * Отмечаются все вхождения каждого слова, а пересёкшиеся совпадения сливаются в один кусок. Куски
 * режутся из оригинала — регистр остаётся тем, каким его написал потребитель. Подпись, длина
 * которой меняется от смены регистра, остаётся одним куском без отметки: места совпадений в ней не
 * совпали бы с местами в оригинале.
 */
export function rtMatchParts(name: string, query: string): IRtMatchPart[] {
    if (name === '') {
        return [];
    }

    const words: string[] = rtSearchWords(query);
    const folded: string = rtSearchFold(name);

    if (words.length === 0 || folded.length !== name.length) {
        return [{ text: name, matched: false }];
    }

    const marks: boolean[] = Array.from({ length: name.length }, (): boolean => false);
    words.forEach((word: string): void => markWord(marks, folded, word));

    const parts: IRtMatchPart[] = [];
    let from: number = 0;

    for (let at: number = 1; at <= name.length; at++) {
        if (at === name.length || marks[at] !== marks[from]) {
            parts.push({ text: name.slice(from, at), matched: marks[from] });
            from = at;
        }
    }

    return parts;
}
