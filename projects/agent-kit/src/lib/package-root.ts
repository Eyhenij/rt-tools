/**
 * Корень пакета — каталог, где лежат `package.json` и `assets/`.
 *
 * Считать его отступом от файла нельзя: в исходниках модуль лежит на `src/lib/`, а в собранном
 * пакете — на `lib/`, и один и тот же `../..` в первом случае приводит в корень пакета, а во
 * втором — на каталог выше. Прогон собранного CLI падал на чтении `package.json` ровно так.
 *
 * Поэтому корень ищется подъёмом до первого `package.json`. Откуда подниматься, говорит
 * вызывающий: `import.meta.url` живёт только в точке входа, которую не тянет в себя ни одна
 * спека, — трансформ тестов разбирает модули как CommonJS, и это выражение для него синтаксис.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function packageRootFrom(start: string): string {
    let dir: string = start;
    for (;;) {
        if (existsSync(join(dir, 'package.json'))) {
            return dir;
        }
        const parent: string = dirname(dir);
        if (parent === dir) {
            throw new Error(`не найден корень пакета: подъём от ${start} не встретил package.json`);
        }
        dir = parent;
    }
}
