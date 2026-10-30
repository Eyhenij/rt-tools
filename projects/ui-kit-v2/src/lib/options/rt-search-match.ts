/**
 * Правило совпадения поиска — одно на весь кит: каждое слово запроса должно найтись в тексте, в любом
 * порядке, без учёта регистра, а «ё» равна «е». По нему отбирают строки боковое меню, обход дерева,
 * динамический выбор и выбор из дерева, и по нему же подсветка режет подпись.
 */

/**
 * Текст в том виде, в каком его сравнивает поиск: нижний регистр и «е» на месте «ё». Замена буквы
 * длину не меняет, поэтому места совпадений в приведённом тексте — те же места в исходном.
 */
export function rtSearchFold(text: string): string {
    return text.toLowerCase().replace(/ё/g, 'е');
}

/** Слова запроса в приведённом виде, без пустых. Запрос из одних пробелов слов не даёт. */
export function rtSearchWords(query: string): string[] {
    return rtSearchFold(query)
        .split(/\s+/)
        .filter((word: string): boolean => word !== '');
}

/** Совпадает ли текст с запросом: каждое слово запроса стоит в тексте. Пустой запрос совпадает со всем. */
export function rtSearchMatches(text: string, query: string): boolean {
    const folded: string = rtSearchFold(text);

    return rtSearchWords(query).every((word: string): boolean => folded.includes(word));
}
