/**
 * Разбор доводов командной строки.
 *
 * Команда, которая молча пропускает незнакомый довод, отвечает одинаково на «довод лишний» и на
 * «команда ничего не сделала». Там, где единственное действие обратимо, разница стоит повторного
 * запуска; там, где оно необратимо и уходит наружу, — стоит отправленного груза: вызов с
 * доводом справки, сделанный ради списка режимов, отправил в приём всё накопленное.
 */

/** Довод — то, что начинается с дефиса. Всё остальное команда читает как значение или путь. */
const FLAG: RegExp = /^-/;

/** Пометка довода, за которым идёт значение: `--root <>` против `--dry-run`. */
const TAKES_VALUE: string = ' <>';

/**
 * Доводы вызова, которых команда не знает.
 *
 * Значение, стоящее за доводом с параметром, доводом не считается: `--root /путь` — это один
 * довод и его значение, а не два незнакомых. Набор известных перечисляет и те доводы, что
 * значение принимают, и те, что нет: у пустого набора незнакомо всё, начинающееся с дефиса.
 */
export function unknownFlagsIn(argv: readonly string[], known: readonly string[]): readonly string[] {
    const withValue: ReadonlySet<string> = new Set(
        known
            .filter((flag: string): boolean => flag.endsWith(TAKES_VALUE))
            .map((flag: string): string => flag.slice(0, -TAKES_VALUE.length))
    );
    const names: ReadonlySet<string> = new Set(known.map((flag: string): string => flag.replace(TAKES_VALUE, '')));
    const unknown: string[] = [];

    for (let index: number = 0; index < argv.length; index += 1) {
        const spoken: string = argv[index];
        if (!FLAG.test(spoken)) {
            continue;
        }

        const name: string = spoken.split('=')[0];
        if (!names.has(name)) {
            unknown.push(name);
            continue;
        }

        // Значение через пробел пропускается вместе со своим доводом: без этого путь, начатый
        // с дефиса, читался бы как ещё один незнакомый довод.
        if (withValue.has(name) && !spoken.includes('=')) {
            index += 1;
        }
    }

    return unknown;
}
