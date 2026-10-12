import { IRtDynamicSelector } from './rt-dynamic-selector.model';

/** Подпись пункта строкой: число приводится, всё прочее подписью не считается. */
export function dynamicSelectorLabel<T>(item: T, labelOf: (item: T) => unknown): string | null {
    const label: unknown = labelOf(item);

    return typeof label === 'string' || typeof label === 'number' ? String(label) : null;
}

/**
 * Совпадает ли подпись с запросом. Запрос режется по пробелам, и каждое слово обязано найтись в
 * подписи без учёта регистра: «отчёт март» находит «Март, отчёт по складу».
 */
export function dynamicSelectorMatches(label: string, query: string): boolean {
    const words: string[] = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const text: string = label.toLowerCase();

    return words.every((word: string): boolean => text.includes(word));
}

/**
 * Подпись, разрезанная по словам запроса: совпавшие куски помечены. Слова ищутся так же, как при
 * отборе, — без учёта регистра и везде, где встречаются; пересёкшиеся совпадения сливаются в один
 * кусок. Подпись, длина которой меняется от смены регистра, остаётся одним куском без отметки.
 */
export function dynamicMatchParts(label: string, query: string): IRtDynamicSelector.MatchPart[] {
    const words: string[] = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const text: string = label.toLowerCase();

    if (words.length === 0 || label === '' || text.length !== label.length) {
        return [{ text: label, matched: false }];
    }

    const marks: boolean[] = Array.from({ length: label.length }, (): boolean => false);

    for (const word of words) {
        let from: number = text.indexOf(word);

        while (from !== -1) {
            marks.fill(true, from, from + word.length);
            from = text.indexOf(word, from + 1);
        }
    }

    const parts: IRtDynamicSelector.MatchPart[] = [];
    let start: number = 0;

    for (let index: number = 1; index <= label.length; index++) {
        if (index === label.length || marks[index] !== marks[start]) {
            parts.push({ text: label.slice(start, index), matched: marks[start] });
            start = index;
        }
    }

    return parts;
}

/**
 * Пункты, которые можно выбрать: без уже выбранных, без пунктов без подписи и, если запрос есть,
 * только совпавшие. Порядок — функция сортировки приложения, а без неё — по алфавиту подписи.
 */
export function selectableDynamicItems<T, K>(
    items: ReadonlyArray<T>,
    chosenKeys: ReadonlyArray<K>,
    keyOf: (item: T) => K,
    labelOf: (item: T) => unknown,
    query: string,
    sortFn?: ((a: T, b: T) => number) | null
): T[] {
    const chosen: Set<K> = new Set<K>(chosenKeys);
    const found: T[] = items.filter((item: T): boolean => {
        const label: string | null = dynamicSelectorLabel(item, labelOf);

        return label !== null && !chosen.has(keyOf(item)) && dynamicSelectorMatches(label, query);
    });

    return found.sort(
        sortFn ?? ((a: T, b: T): number => (dynamicSelectorLabel(a, labelOf) ?? '').localeCompare(dynamicSelectorLabel(b, labelOf) ?? ''))
    );
}

/** Ключ добавлен или снят. Повторно добавленный ключ не удваивается. */
export function toggleDynamicKey<K>(keys: ReadonlyArray<K>, key: K, checked: boolean): K[] {
    if (checked) {
        return keys.includes(key) ? [...keys] : [...keys, key];
    }

    return keys.filter((item: K): boolean => item !== key);
}

/** Состояние флажка «Выбрать всё» по видимым пунктам. */
export function dynamicSelectAllState<K>(visibleKeys: ReadonlyArray<K>, pickedKeys: ReadonlyArray<K>): IRtDynamicSelector.SelectAllState {
    const picked: number = visibleKeys.filter((key: K): boolean => pickedKeys.includes(key)).length;

    if (picked === 0) {
        return 'none';
    }

    return picked === visibleKeys.length ? 'all' : 'some';
}

/**
 * «Выбрать всё» добавляет к отмеченному все видимые пункты, снятие — убирает видимые и оставляет
 * отмеченное вне запроса.
 */
export function selectAllDynamicKeys<K>(visibleKeys: ReadonlyArray<K>, pickedKeys: ReadonlyArray<K>, checked: boolean): K[] {
    if (!checked) {
        return pickedKeys.filter((key: K): boolean => !visibleKeys.includes(key));
    }

    return [...pickedKeys, ...visibleKeys.filter((key: K): boolean => !pickedKeys.includes(key))];
}

/** «Очистить» оставляет только ключи только для чтения, в их прежнем порядке. */
export function clearDynamicKeys<K>(keys: ReadonlyArray<K>, readonlyKeys: ReadonlyArray<K>): K[] {
    return keys.filter((key: K): boolean => readonlyKeys.includes(key));
}

/** Строка перетащена на новое место. Индексы вне списка приводятся к его краям. */
export function moveDynamicKey<K>(keys: ReadonlyArray<K>, from: number, to: number): K[] {
    const list: K[] = [...keys];
    const last: number = list.length - 1;

    if (from < 0 || from > last) {
        return list;
    }

    const moved: K[] = list.splice(from, 1);

    list.splice(Math.min(Math.max(to, 0), last), 0, ...moved);

    return list;
}

/** Совпадают ли два набора ключей с учётом порядка: так «Сбросить» узнаёт, что сбрасывать нечего. */
export function sameDynamicKeys<K>(a: ReadonlyArray<K>, b: ReadonlyArray<K>): boolean {
    return a.length === b.length && a.every((key: K, index: number): boolean => key === b[index]);
}

/** Совпадают ли два набора ключей без учёта порядка: так «Очистить» узнаёт, что чистить нечего. */
export function sameDynamicKeySet<K>(a: ReadonlyArray<K>, b: ReadonlyArray<K>): boolean {
    const set: Set<K> = new Set<K>(b);

    return a.length === set.size && a.every((key: K): boolean => set.has(key));
}

/** Строка поля списка строк: пустая и повторная не добавляются, пробелы по краям срезаются. */
export function addDynamicText(values: ReadonlyArray<string>, raw: string | null | undefined): string[] {
    const text: string = (raw ?? '').trim();

    return text === '' || values.includes(text) ? [...values] : [...values, text];
}

/**
 * Строка поля списка строк исправлена на месте. Пустая правка и правка в уже существующую строку
 * список не меняют: иначе строка пропала бы или удвоилась.
 */
export function renameDynamicText(values: ReadonlyArray<string>, previous: string, next: string | null | undefined): string[] {
    const text: string = (next ?? '').trim();

    if (text === '' || text === previous || values.includes(text)) {
        return [...values];
    }

    return values.map((value: string): string => (value === previous ? text : value));
}

/** Ключ последней видимой закреплённой строки: под ней стоит разделитель. Порядок строк не меняется. */
export function lastPinnedDynamicKey<T, K>(rows: ReadonlyArray<T>, pinnedKeys: ReadonlyArray<K>, keyOf: (item: T) => K): K | null {
    for (let index: number = rows.length - 1; index >= 0; index -= 1) {
        const key: K = keyOf(rows[index]);

        if (pinnedKeys.includes(key)) {
            return key;
        }
    }

    return null;
}

/**
 * Строки всплывающего выбора во время поиска: отмеченные раньше стоят над найденными и не пропадают
 * оттого, что запрос перестал с ними совпадать. Без запроса отмеченные остаются на своих местах.
 */
export function dynamicPopupRows<T, K>(
    offered: ReadonlyArray<T>,
    found: ReadonlyArray<T>,
    ticked: ReadonlyArray<K>,
    keyOf: (item: T) => K,
    query: string
): IRtDynamicSelector.PopupRows<T> {
    if (query.trim() === '') {
        return { ticked: [], found: [...found] };
    }

    const tickedRows: T[] = ticked
        .map((key: K): T | undefined => offered.find((item: T): boolean => keyOf(item) === key))
        .filter((item: T | undefined): item is T => item !== undefined);

    return { ticked: tickedRows, found: found.filter((item: T): boolean => !ticked.includes(keyOf(item))) };
}

/**
 * Подпись в заданном регистре. «title» ставит заглавную в начало каждого слова, а остальные буквы
 * слова строчными: «SUBMIT FORM» и «submit form» обе становятся «Submit Form».
 */
export function dynamicLabelCase(label: string, labelCase: IRtDynamicSelector.LabelCase): string {
    if (labelCase === 'upper') {
        return label.toLocaleUpperCase();
    }

    if (labelCase === 'title') {
        return label.replace(/\S+/g, (word: string): string => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase());
    }

    return label;
}
