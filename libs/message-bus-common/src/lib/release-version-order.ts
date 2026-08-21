/**
 * Порядок версий выпуска — номерами частей, а не буквами строки.
 *
 * Живёт в общей либе, потому что нужен обеим сторонам: приёмник упорядочивает страницу списка,
 * админка теми же правилами показывает встретившиеся версии в отборе. Своя копия сравнения на
 * каждой стороне разошлась бы молча — обе выглядели бы исправными, а порядок в отборе и порядок
 * в списке называли бы соседние версии по-разному.
 *
 * Форму версии приёмник по-прежнему не навязывает: разбор идёт при чтении списка, а не при
 * приёме груза, и версия, не разобравшаяся числами, не отбивается — она уходит в конец порядка.
 */

/** Сколько частей версии сравнивается. Больше трёх не встречается, а хвост уходит в остаток. */
const PARTS: number = 3;

/** Версия, разобранная для сравнения: числовые части и остаток строки. */
interface IVersionKey {
    /** Разобралась ли версия числами вовсе. Нет — место такой версии в конце порядка. */
    readonly numeric: boolean;
    /** Части версии числами, слева направо. У неразобравшейся пусто. */
    readonly parts: readonly number[];
    /** Строка целиком: ею разводятся версии, у которых числовые части равны. */
    readonly text: string;
}

/**
 * Разбор версии для сравнения.
 *
 * Числом считается часть, состоящая из одних цифр: `0.10.0` разбирается тремя частями, а
 * `hotfix-3` не разбирается вовсе — цифра в нём есть, но первая часть числом не читается.
 * Недостающие части считаются нулями: `1.2` и `1.2.0` — одна и та же версия.
 */
export function releaseVersionKey(version: string): IVersionKey {
    const text: string = version.trim();
    const chunks: string[] = text.split('.', PARTS);
    const numeric: boolean = chunks.length > 0 && /^\d+$/.test(chunks[0]);

    if (!numeric) {
        return { numeric: false, parts: [], text };
    }

    const parts: number[] = [];

    for (let at: number = 0; at < PARTS; at += 1) {
        // Часть, которой в версии нет, читается нулём: `1.2` и `1.2.0` — одна и та же версия.
        const chunk: string = chunks[at] ?? '';

        parts.push(/^\d+$/.test(chunk) ? Number(chunk) : 0);
    }

    return { numeric: true, parts, text };
}

/**
 * Сравнение двух версий по возрастанию.
 *
 * Числовые идут первыми и между собой — номерами частей; неразобравшиеся стоят за ними и между
 * собой идут по алфавиту. Возвращает отрицательное, ноль или положительное — то, чего ждёт
 * сортировка массива.
 */
export function compareReleaseVersions(left: string, right: string): number {
    const first: IVersionKey = releaseVersionKey(left);
    const second: IVersionKey = releaseVersionKey(right);

    if (first.numeric !== second.numeric) {
        return first.numeric ? -1 : 1;
    }

    if (!first.numeric) {
        return first.text.localeCompare(second.text);
    }

    for (let at: number = 0; at < PARTS; at += 1) {
        const difference: number = first.parts[at] - second.parts[at];

        if (difference !== 0) {
            return difference;
        }
    }

    return first.text.localeCompare(second.text);
}

/**
 * Встретившиеся версии, упорядоченные по возрастанию.
 *
 * Пустые значения сюда не приходят: запись без версии — это отсутствие значения, а не версия, и
 * в отборе она стоит своим пунктом.
 */
export function orderedReleaseVersions(versions: readonly string[]): readonly string[] {
    return [...versions].sort(compareReleaseVersions);
}
