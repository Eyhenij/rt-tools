// rt-kit v0.25.0 · checks/board-titles.github.mjs · 10156d9cad8e · правится надстройкой, не здесь
/**
 * Открытые задачи, чьи заголовки сильно совпали.
 *
 * Отдельным файлом, а не внутри сверки очереди: у очереди свой предмет — задачи, колонки и
 * заявки, — а здесь сравнивают слова заголовков между собой. Вместе они переросли предел длины
 * файла, и делить их по предмету дешевле, чем по числу строк.
 */

function titleWords(title) {
    return [
        ...new Set(
            String(title)
                .replace(/^\s*\[[^\]]+\]\s*/, '')
                .toLowerCase()
                .split(/[^\p{L}\p{N}]+/u)
                .filter((word) => word.length > 3)
        ),
    ];
}

/** Доля общих слов, начиная с которой две задачи стоит посмотреть глазами. */
const TITLE_OVERLAP = 0.6;
/** Меньше трёх общих слов совпадением не считается: два длинных слова совпадают у любой пары. */
const TITLE_COMMON_MIN = 3;
/** Больше скольких задач в группе — это серия эпика, а не дубль. */
const TITLE_GROUP_MAX = 4;

/**
 * Открытые задачи, чьи заголовки сильно совпали.
 *
 * Печатается строкой сводки, а не отказом: серия однотипных задач эпика — законное состояние
 * очереди, и отказ отбивал бы работу на каждой такой серии. Дубль же по отдельности исправен —
 * у обеих задач номер, исполнитель и колонка, — и не находит его ничто: разошлись они словами
 * заголовка, а совпадают дефектом и признаком закрытия.
 */
export function similarTitles(open) {
    const words = new Map(open.map((issue) => [issue.number, titleWords(issue.title)]));
    // Задачи сводятся в группы, а не в пары: серия однотипных задач эпика — законное состояние
    // очереди, и парами она даёт по строке на каждое сочетание, то есть заглушает сама себя.
    const groups = [];

    for (const issue of open) {
        const mine = words.get(issue.number);
        const near = groups.find((group) =>
            group.some((other) => {
                const theirs = words.get(other.number);
                const common = mine.filter((word) => theirs.includes(word)).length;
                const smaller = Math.min(mine.length, theirs.length);

                return smaller > 0 && common >= TITLE_COMMON_MIN && common / smaller >= TITLE_OVERLAP;
            })
        );
        if (near) {
            near.push(issue);
            continue;
        }
        groups.push([issue]);
    }

    // Группа больше предела — это серия однотипных задач, а не дубль: у эпика их бывает
    // полтора десятка, и строка о них говорит только то, что эпик существует.
    for (const group of groups.filter((one) => one.length > 1 && one.length <= TITLE_GROUP_MAX)) {
        const numbers = group.map((issue) => `#${issue.number}`).join(', ');
        console.log(`check-board: ${numbers} — заголовки сильно совпадают, посмотри, не одна ли это работа: ` + `«${group[0].title}»`);
    }
}
