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

const DECLARATION: RegExp = /^#\s*rt-hook:\s*(\S+)(?:[ \t]+(\S.*))?$/gm;

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

/**
 * Что гард говорит о себе. Молчит — он не подключается к агенту вовсе.
 *
 * Объявлений бывает несколько: гард, который сперва напоминает, а потом отбивает, стоит на двух
 * событиях сразу. Разводить его по двум файлам значило бы держать два разбора одной записи и
 * два места, где правится один порог.
 */
export function bindingsOf(text: string, path: string): readonly IHookBinding[] {
    return [...text.matchAll(DECLARATION)].map((found: RegExpMatchArray): IHookBinding => ({
        event: found[1],
        matcher: (found[2] ?? '').trim(),
        path,
    }));
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

    // Сперва разбором: гард, стоящий на двух событиях, подключается к каждому отдельно, и по
    // одному имени файла этого не увидеть — подключённый к первому событию выглядел бы
    // подключённым и ко второму.
    const byEvent: string[] = [];
    try {
        const settings: unknown = JSON.parse(text);
        const hooks: unknown = (settings as Record<string, unknown> | null)?.['hooks'];
        for (const [event, records] of Object.entries((hooks ?? {}) as Record<string, unknown>)) {
            for (const record of Array.isArray(records) ? records : []) {
                const commands: unknown = (record as Record<string, unknown> | null)?.['hooks'];
                for (const command of Array.isArray(commands) ? commands : []) {
                    const line: unknown = (command as Record<string, unknown> | null)?.['command'];
                    if (typeof line === 'string') {
                        byEvent.push(`${event} ${line.replace(/^.*?(\.claude\/)/, '$1')}`);
                    }
                }
            }
        }

        return byEvent;
    } catch {
        // Настройку дерево вправе держать так, как ему удобно, — вплоть до комментариев, которых
        // JSON не разбирает. Тогда ищется одно: назван ли путь гарда хоть где-нибудь в ней.
        return [...text.matchAll(/[\w./$-]*\.claude\/hooks\/[\w.-]+\.sh/g)].map((found: RegExpMatchArray): string =>
            found[0].replace(/^.*?(\.claude\/)/, '$1')
        );
    }
}

/**
 * Разложенные гарды, которых в настройке агента нет: они лежат, но их никто не позовёт.
 *
 * Разбор настройки называет пару «событие и путь», а падение назад — один путь. Поэтому
 * подключённым считается и то, и другое: иначе дерево с настройкой, которую не разобрать,
 * получало бы список из всех гардов разом.
 */
export function unboundHooks(bindings: readonly IHookBinding[], root: string): readonly IHookBinding[] {
    const bound: ReadonlySet<string> = new Set(boundInSettings(root));

    return bindings.filter((binding: IHookBinding): boolean => !bound.has(`${binding.event} ${binding.path}`) && !bound.has(binding.path));
}

/**
 * Образцы, под которыми гарды стоят в настройке агента: ключ — «событие и путь».
 *
 * Настройку, которую не разобрать, читать здесь нечем: образец лежит полем объекта, и вынуть его
 * из текста поиском значило бы гадать. Тогда карта пуста, и расхождений не находится ни одного —
 * это честнее, чем назвать расхождением то, чего не прочитали.
 */
export function matchersInSettings(root: string): ReadonlyMap<string, string> {
    const path: string = join(root, SETTINGS_PATH);
    const found: Map<string, string> = new Map();
    if (!existsSync(path)) {
        return found;
    }

    try {
        const settings: unknown = JSON.parse(readFileSync(path, 'utf8'));
        const hooks: unknown = (settings as Record<string, unknown> | null)?.['hooks'];
        for (const [event, records] of Object.entries((hooks ?? {}) as Record<string, unknown>)) {
            for (const record of Array.isArray(records) ? records : []) {
                const matcher: unknown = (record as Record<string, unknown> | null)?.['matcher'];
                const commands: unknown = (record as Record<string, unknown> | null)?.['hooks'];
                for (const command of Array.isArray(commands) ? commands : []) {
                    const line: unknown = (command as Record<string, unknown> | null)?.['command'];
                    if (typeof line === 'string') {
                        found.set(`${event} ${line.replace(/^.*?(\.claude\/)/, '$1')}`, typeof matcher === 'string' ? matcher.trim() : '');
                    }
                }
            }
        }
    } catch {
        return new Map();
    }

    return found;
}

/** Гард, чьё объявление разошлось с образцом, под которым его зовут. */
export interface IMatcherDrift {
    readonly event: string;
    readonly path: string;
    /** Что гард объявляет о себе строкой `# rt-hook:`. */
    readonly declared: string;
    /** Под чем он на самом деле стоит в настройке агента. */
    readonly bound: string;
}

/**
 * Расхождения объявления гарда с образцом, под которым его зовут.
 *
 * Гард, подписанный не на то, что объявляет, хуже неподключённого: снаружи он выглядит
 * работающим — путь его в настройке назван, файл разложен, набор сценариев зелёный, — а вызов,
 * ради которого его тело и написано, до него не доходит никогда. Так гейт правил и разбирал
 * вызовы браузера веткой, которая не исполнялась ни разу: набор звал гард напрямую с
 * подставленным вводом и объявления не читал вовсе.
 *
 * Судятся только подключённые гарды: о неподключённых говорит своя строка, и назвать их дважды
 * значило бы спрятать настоящее расхождение среди повторов.
 */
export function driftedMatchers(bindings: readonly IHookBinding[], root: string): readonly IMatcherDrift[] {
    const bound: ReadonlyMap<string, string> = matchersInSettings(root);
    const drifts: IMatcherDrift[] = [];

    for (const binding of bindings) {
        const key: string = `${binding.event} ${binding.path}`;
        const inSettings: string | undefined = bound.get(key);
        if (inSettings === undefined || inSettings === binding.matcher) {
            continue;
        }
        drifts.push({ event: binding.event, path: binding.path, declared: binding.matcher, bound: inSettings });
    }

    return drifts;
}
