/**
 * Карта хуков: чем разложенные гарды подключаются к агенту.
 *
 * Раскладка кладёт файлы, а зовёт их запись в настройке агента — чужом JSON, которым пакет не
 * владеет. Пока о ней молчали, свежее дерево получало два десятка гардов, ни один из которых не
 * срабатывал, и узнавало об этом, когда что-нибудь проходило мимо.
 *
 * Пакет не пишет в чужую настройку сам: файл держит проект, в нём лежит и то, о чём пакет не
 * знает вовсе, а слияние чужого JSON молча теряет несовпавшее. Вместо этого он собирает готовый
 * кусок и проверяет, что он вставлен. Это дешевле и честнее: правку в свою настройку делает тот,
 * кто за неё отвечает.
 *
 * Событие и образец вызова гард несёт сам — строкой `# rt-hook: <событие> <образец>` во второй
 * строке файла. Карта, выписанная отдельным списком, разошлась бы с набором гардов на первом же
 * добавленном, и заметить это было бы нечем: гард просто не звался бы.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Настройка агента, в которой живёт карта. Путь от корня дерева. */
export const SETTINGS_PATH: string = '.claude/settings.json';

const DECLARATION: RegExp = /^#\s*rt-hook:\s*(\S+)(?:[ \t]+(\S.*))?$/m;

export interface IHookBinding {
    /** Событие агента: `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`. */
    readonly event: string;
    /**
     * Образец, по которому событие достаётся этому гарду. Пустой у события, которое не про
     * инструмент: завершение хода приходит целиком, и выбирать в нём нечего.
     */
    readonly matcher: string;
    /** Путь разложенного гарда от корня дерева. */
    readonly path: string;
}

/** Что гард говорит о себе. Молчит — он не подключается к агенту вовсе. */
export function bindingOf(text: string, path: string): IHookBinding | null {
    const found: RegExpMatchArray | null = text.match(DECLARATION);

    return found ? { event: found[1], matcher: (found[2] ?? '').trim(), path } : null;
}

/**
 * Раздел `hooks` для настройки агента: событие → образец → команда.
 *
 * Гарды с одинаковым образцом внутри события собираются в одну запись — так же, как это пишут
 * руками, и так же, как читает агент.
 */
export function hooksSection(bindings: readonly IHookBinding[]): Record<string, unknown> {
    const events: Map<string, Map<string, string[]>> = new Map();

    for (const binding of bindings) {
        const byMatcher: Map<string, string[]> = events.get(binding.event) ?? new Map();
        byMatcher.set(binding.matcher, [...(byMatcher.get(binding.matcher) ?? []), binding.path]);
        events.set(binding.event, byMatcher);
    }

    const section: Record<string, unknown> = {};
    for (const [event, byMatcher] of [...events].sort()) {
        section[event] = [...byMatcher].sort().map(([matcher, paths]: [string, readonly string[]]): unknown => {
            const hooks: unknown[] = paths.map((path: string): unknown => ({
                type: 'command',
                command: `$CLAUDE_PROJECT_DIR/${path}`,
            }));

            // Запись без образца — не запись с пустым образцом: агент читает пустую строку как
            // образец, которому не соответствует ни один вызов, и гард молча не зовётся.
            return matcher ? { matcher, hooks } : { hooks };
        });
    }

    return section;
}

/** Пути гардов, названные в настройке агента этого дерева. Нет файла — ни одного. */
export function boundInSettings(root: string): readonly string[] {
    const path: string = join(root, SETTINGS_PATH);
    if (!existsSync(path)) {
        return [];
    }
    let text: string;
    try {
        text = readFileSync(path, 'utf8');
    } catch {
        return [];
    }

    // Настройка читается текстом, а не разбором: у неё нет объявленной формы, и дерево вправе
    // держать её так, как ему удобно, — вплоть до комментариев, которых JSON не разбирает. Ищется
    // одно: назван ли путь гарда хоть где-нибудь в ней.
    return [...text.matchAll(/[\w./$-]*\.claude\/hooks\/[\w.-]+\.sh/g)].map((found: RegExpMatchArray): string =>
        found[0].replace(/^.*?(\.claude\/)/, '$1')
    );
}

/** Разложенные гарды, которых в настройке агента нет: они лежат, но их никто не позовёт. */
export function unboundHooks(bindings: readonly IHookBinding[], root: string): readonly IHookBinding[] {
    const bound: ReadonlySet<string> = new Set(boundInSettings(root));

    return bindings.filter((binding: IHookBinding): boolean => !bound.has(binding.path));
}
