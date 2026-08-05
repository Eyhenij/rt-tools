/**
 * Подстановка значений проекта в текст пакета.
 *
 * Пакет не знает ни префикса компонентов, ни имени главной ветки, ни портов стендов, но говорить
 * о них обязан: правило без этих имён перестаёт быть указанием и превращается в пожелание.
 * Поэтому в тексте пакета стоят дырки `{{имя}}`, а значения приходят из конфига проекта.
 *
 * Неподставленная дырка — **отказ**, а не строка в тексте. Разложенный файл читает агент, и
 * `{{componentPrefix}}` посреди правила он прочтёт как имя: правило станет неверным молча, и
 * заметит это не проверка, а тот, кто будет разбирать последствия.
 */

/** Дырка в тексте пакета: `{{имя}}`, имя — латиница, цифры, дефис и точка. */
const PLACEHOLDER: RegExp = /\{\{([a-zA-Z][\w.-]*)\}\}/g;

export interface IRenderResult {
    readonly text: string;
    /** Имена дырок, которым не нашлось значения, в порядке первого появления. */
    readonly missing: readonly string[];
}

export function renderVars(text: string, vars: Readonly<Record<string, string>>): IRenderResult {
    const missing: string[] = [];

    const rendered: string = text.replace(PLACEHOLDER, (whole: string, name: string): string => {
        const value: string | undefined = vars[name];
        if (value === undefined) {
            if (!missing.includes(name)) {
                missing.push(name);
            }

            return whole;
        }

        return value;
    });

    return { text: rendered, missing };
}

/** Имена всех дырок текста — по ним `doctor` говорит, чего проекту не хватает. */
export function placeholdersOf(text: string): readonly string[] {
    const names: string[] = [];
    for (const [, name] of text.matchAll(PLACEHOLDER)) {
        if (!names.includes(name)) {
            names.push(name);
        }
    }

    return names;
}
