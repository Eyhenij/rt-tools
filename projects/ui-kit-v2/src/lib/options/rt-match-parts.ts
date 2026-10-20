/** Кусок подписи: текст и то, совпал ли он с запросом. */
export interface IRtMatchPart {
    text: string;
    matched: boolean;
}

/**
 * Резка подписи на совпавшие и несовпавшие куски.
 *
 * Отмечаются все вхождения: отмеченное одно первое читается как «второго нет». Сравнение без учёта
 * регистра, а куски режутся из оригинала — приведение к нижнему регистру переписало бы названия.
 */
export function rtMatchParts(name: string, query: string): IRtMatchPart[] {
    if (name === '') {
        return [];
    }

    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [{ text: name, matched: false }];
    }

    const haystack: string = name.toLowerCase();
    const parts: IRtMatchPart[] = [];
    let from: number = 0;

    for (let at: number = haystack.indexOf(needle, from); at !== -1; at = haystack.indexOf(needle, from)) {
        if (at > from) {
            parts.push({ text: name.slice(from, at), matched: false });
        }

        parts.push({ text: name.slice(at, at + needle.length), matched: true });
        from = at + needle.length;
    }

    if (from < name.length) {
        parts.push({ text: name.slice(from), matched: false });
    }

    return parts;
}

/**
 * Резка подписи по каждому слову запроса. Приложение делит поиск по пробелам и ищет каждое слово
 * отдельно, поэтому и отмечено каждое. Слово внутри уже отмеченного куска не режет его второй раз.
 */
export function rtMatchPartsByWords(name: string, query: string): IRtMatchPart[] {
    const words: string[] = query.split(/\s+/).filter((word: string): boolean => word !== '');
    return words.reduce(
        (parts: IRtMatchPart[], word: string): IRtMatchPart[] =>
            parts.flatMap((part: IRtMatchPart): IRtMatchPart[] => (part.matched ? [part] : rtMatchParts(part.text, word))),
        rtMatchParts(name, '')
    );
}
