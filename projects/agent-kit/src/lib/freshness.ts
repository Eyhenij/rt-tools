/**
 * Свежесть собранного пакета относительно его исходников.
 *
 * Строка запуска читает собранное, а правка ресурса идёт в исходники. Между ними стоит сборка,
 * и пока её не прогнали, `sync` отвечает «всё уже разложено» — притом что в дереве лежит
 * прежняя редакция ресурса. Неправда эта дороже отказа: её замечают, когда правленое правило не
 * действует, и ищут причину в раскладке, а не в том, что её не собрали.
 *
 * Исходники ищутся только там, где они есть: у того, кто пакет разрабатывает. У потребителя
 * рядом с установленным пакетом нет ни рабочего пространства, ни каталога проектов, и проверка
 * молчит — сверять не с чем и нечего.
 */
import { existsSync, readdirSync, readFileSync, statSync, Stats } from 'node:fs';
import { dirname, join } from 'node:path';

/** Признаки корня рабочего пространства: по ним ищется дерево, в котором пакет разрабатывают. */
const WORKSPACE_MARKS: readonly string[] = ['nx.json', 'pnpm-workspace.yaml', 'lerna.json'];

/** Каталоги, в которых рабочее пространство держит проекты. */
const PROJECT_DIRS: readonly string[] = ['projects', 'packages', 'libs', 'apps'];

export interface IStaleBuild {
    /** Каталог ресурсов в исходниках. */
    readonly source: string;
    /** Файл ресурса, правленный позже сборки, — по нему видно, чего именно не хватает в дереве. */
    readonly newest: string;
}

interface INewest {
    readonly at: number;
    readonly path: string;
}

/** Самое позднее время правки в поддереве и файл, которому оно принадлежит. */
function newestIn(dir: string): INewest | null {
    let found: INewest | null = null;

    const walk: (current: string) => void = (current: string): void => {
        let entries: readonly string[];
        try {
            entries = readdirSync(current);
        } catch {
            return;
        }
        for (const name of entries) {
            const path: string = join(current, name);
            let stats: Stats;
            try {
                stats = statSync(path);
            } catch {
                continue;
            }
            if (stats.isDirectory()) {
                walk(path);
            } else if (!found || stats.mtimeMs > found.at) {
                found = { at: stats.mtimeMs, path };
            } else {
                // Файл старше уже найденного: самым свежим он не станет
            }
        }
    };
    walk(dir);

    return found;
}

/**
 * Корень рабочего пространства над этим каталогом.
 *
 * Подъём заканчивается на корне файловой системы, а не на отсчитанном числе шагов: глубина, на
 * которой лежит установленный пакет, у каждого дерева своя, и отсчитанный предел молчал бы ровно
 * там, где вложенность оказалась глубже придуманной.
 */
function workspaceOf(start: string): string | null {
    let dir: string = start;
    for (;;) {
        if (WORKSPACE_MARKS.some((mark: string): boolean => existsSync(join(dir, mark)))) {
            return dir;
        }
        const parent: string = dirname(dir);
        if (parent === dir) {
            return null;
        }
        dir = parent;
    }
}

/** Имя пакета из его описания. Описания нет или оно не разбирается — имени нет. */
function namedPackage(dir: string): string | null {
    try {
        return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name ?? null;
    } catch {
        return null;
    }
}

/** Каталог исходников пакета с этим именем внутри рабочего пространства. */
function sourceInGroup(dir: string, name: string): string | null {
    let entries: readonly string[];

    try {
        entries = readdirSync(dir);
    } catch {
        return null;
    }

    for (const entry of entries) {
        const candidate: string = join(dir, entry);

        if (namedPackage(candidate) === name) {
            return candidate;
        }
    }

    return null;
}

function sourceOf(workspace: string, name: string): string | null {
    for (const group of PROJECT_DIRS) {
        const found: string | null = sourceInGroup(join(workspace, group), name);

        if (found !== null) {
            return found;
        }
    }

    return null;
}

/**
 * Правлены ли ресурсы позже, чем собран пакет, из которого идёт раскладка.
 *
 * `null` значит «сверять не с чем или сверка сошлась»: у потребителя исходников нет вовсе, а у
 * того, кто запускает пакет прямо из исходников, собранное и исходное — один и тот же каталог.
 */
export function staleBuild(packageRoot: string, name: string): IStaleBuild | null {
    const workspace: string | null = workspaceOf(packageRoot);
    if (workspace === null) {
        return null;
    }
    const source: string | null = sourceOf(workspace, name);
    if (source === null || source === packageRoot) {
        return null;
    }

    const built: INewest | null = newestIn(join(packageRoot, 'assets'));
    const written: INewest | null = newestIn(join(source, 'assets'));
    if (!built || !written || written.at <= built.at) {
        return null;
    }

    return { source: join(source, 'assets'), newest: written.path };
}
