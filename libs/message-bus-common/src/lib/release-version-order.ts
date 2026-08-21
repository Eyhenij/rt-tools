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
import { IPageAsked, pageSkip } from './page';

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

/**
 * Запись, упорядочиваемая по версии: только то, чем решается её место.
 *
 * Признак нужен вторым ключом порядка — версия у записей одного выпуска одна и та же, и без него
 * одна и та же запись видна на двух страницах подряд, а соседняя не видна ни на одной.
 */
export interface IReleaseVersionKeyed {
    readonly id: string;
    /** Версия выпуска. Пусто — запись, которую никто не выпускал. */
    readonly releaseVersion: string | null;
}

/**
 * Сравнение записей по версии выпуска, по возрастанию.
 *
 * Записи без версии идут последними: пустота — не наименьшая версия, а её отсутствие. Убывание
 * переворачивает порядок целиком, вместе с ними, — и это то, чего человек ждёт от второго
 * нажатия на заголовок.
 */
function compareKeyed(left: IReleaseVersionKeyed, right: IReleaseVersionKeyed): number {
    if (left.releaseVersion === null || right.releaseVersion === null) {
        if (left.releaseVersion === right.releaseVersion) {
            return 0;
        }

        return left.releaseVersion === null ? 1 : -1;
    }

    return compareReleaseVersions(left.releaseVersion, right.releaseVersion);
}

/**
 * Признаки записей одной страницы, упорядоченных по версии выпуска.
 *
 * Порядок по версии хранилище не строит: колонка строковая, и `0.10.0` встало бы в ней перед
 * `0.9.0` — ровно тот сломанный список, ради которого работа и заведена. Правило сравнения при
 * этом остаётся одно, здесь: своя копия его в языке запросов разошлась бы с этой молча, и порядок
 * в списке разъехался бы с порядком версий в отборе.
 *
 * Отбор и счёт записей остаются за хранилищем — сюда приходит уже суженная выборка, и из неё
 * читаются два поля на запись. Прочие поля берёт второй запрос по отданным признакам: страница
 * несёт двадцать записей, а выборка — все, и тащить их целиком ради двадцати незачем.
 */
export function releaseVersionPageIds(keyed: readonly IReleaseVersionKeyed[], asked: IPageAsked): readonly string[] {
    const step: number = asked.dir === 'asc' ? 1 : -1;
    const sorted: IReleaseVersionKeyed[] = [...keyed].sort((left: IReleaseVersionKeyed, right: IReleaseVersionKeyed): number => {
        const decided: number = step * compareKeyed(left, right);

        return decided === 0 ? step * left.id.localeCompare(right.id) : decided;
    });
    const from: number = pageSkip(asked);

    return sorted.slice(from, from + asked.size).map((row: IReleaseVersionKeyed): string => row.id);
}
