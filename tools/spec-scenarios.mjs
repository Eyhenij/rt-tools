// rt-kit v0.21.0 · checks/spec-scenarios.mjs · e7c600e9aa78 · правится надстройкой, не здесь
/**
 * Сценарии домена и уровень их привязки: что сценарий обещает, каким тестом это покрыто и не
 * выключен ли тест переменной окружения.
 */
import {
    ACTOR,
    E2E_ROOTS,
    PARTIAL,
    PERCEIVES,
    PROMISE,
    SCENARIO_HEADING,
    SCENARIO_REFERENCE,
    TEST_ROOTS,
    UNCOVERED,
    read,
    walk,
} from './spec-common.mjs';

// ── 4. Сценарии и уровень привязки ────────────────────────────────────────────

function parseScenarios(file) {
    const lines = read(file).split('\n');
    const scenarios = [];
    let current = null;
    let inPromise = false;

    lines.forEach((line, index) => {
        const heading = SCENARIO_HEADING.exec(line);
        if (heading) {
            current = {
                id: heading[1],
                prefix: heading[2],
                title: heading[4],
                file,
                line: index + 1,
                uncovered: false,
                partial: false,
                promise: '',
            };
            inPromise = false;
            scenarios.push(current);

            return;
        }
        if (/^#{1,6}\s/.test(line)) {
            current = null;

            return;
        }
        if (!current) {
            return;
        }
        if (UNCOVERED.test(line)) {
            current.uncovered = true;
        }
        if (PARTIAL.test(line)) {
            current.partial = true;
        }
        // «Тогда» и его продолжения с отступом — то, что сценарий обещает
        if (PROMISE.test(line)) {
            inPromise = true;
            current.promise += ` ${line.trim()}`;

            return;
        }
        if (inPromise && /^\s+\S/.test(line)) {
            current.promise += ` ${line.trim()}`;

            return;
        }
        inPromise = false;
    });

    return scenarios;
}

/**
 * Обещан ли сценарием экран. Признак читается только из «Тогда»: «Дано» описывает
 * обстановку, «Когда» — повод, а обещание пользователю стоит именно здесь.
 *
 * Человек и глагол восприятия требуются вместе, потому что порознь оба ошибаются.
 * «Показывается» без человека стоит и там, где показывается запись в базе, а человек без
 * восприятия — в каждом втором сценарии приёма заявки. Признак нарочно молчалив: сценарий,
 * чьё «Тогда» человека не называет, под него не подпадает вовсе.
 */
function promisesScreen(promise) {
    return ACTOR.test(promise) && PERCEIVES.test(promise);
}

/**
 * Константы, собранные из окружения, вместе с теми, что собраны из них. Ими выключают
 * сквозной тест целиком: без `BASE_URL` или пары входа он не исполняется ни разу.
 * Цепочка раскрывается, пока есть что раскрывать: `HAS_ADMIN_SESSION` собран из двух
 * других констант, а не из `process.env` напрямую.
 */
function environmentSwitches(root) {
    // Объявление верхнего уровня: с отступом стоят локальные, и они гасят не тест, а случай
    const declaration = /^const\s+([A-Za-z_]\w*)\s*(?::[^=]+)?=\s*([^;]+);/gm;
    const assignments = [];
    for (const file of walk(root, (name) => name.endsWith('.ts'))) {
        for (const [, name, value] of read(file).matchAll(declaration)) {
            assignments.push({ name, value });
        }
    }

    const switches = new Set();
    for (let pass = 0; pass <= assignments.length; pass += 1) {
        const before = switches.size;
        for (const { name, value } of assignments) {
            if (value.includes('process.env') || [...switches].some((known) => new RegExp(`\\b${known}\\b`).test(value))) {
                switches.add(name);
            }
        }
        if (switches.size === before) {
            break;
        }
    }

    return switches;
}

/**
 * Упоминания сценария в тестах: где стоит, идёт ли тест путём пользователя и не выключен ли
 * он переменной окружения.
 *
 * Выключатель по состоянию стенда («у объекта меньше двух помещений») — это пропуск случая,
 * и покрытие он не отменяет. Выключатель по переменной отменяет: тест с ним в обычном
 * прогоне значится пропущенным, а сводка без этого читала бы его покрытием.
 */
function collectReferences() {
    const references = new Map();
    const remember = (id, place) => {
        if (!references.has(id)) {
            references.set(id, []);
        }
        references.get(id).push(place);
    };
    const switchesByRoot = new Map();

    for (const root of TEST_ROOTS) {
        for (const file of walk(root, (name) => name.endsWith('.spec.ts'))) {
            const e2eRoot = E2E_ROOTS.find((dir) => file.startsWith(`${dir}/`));
            if (e2eRoot && !switchesByRoot.has(e2eRoot)) {
                switchesByRoot.set(e2eRoot, environmentSwitches(e2eRoot));
            }
            const switches = switchesByRoot.get(e2eRoot) ?? new Set();
            const switched = (line) =>
                [...line.matchAll(/test\.skip\(([^,]*)/g)].some(
                    ([, condition]) =>
                        condition.includes('process.env') || [...switches].some((name) => new RegExp(`\\b${name}\\b`).test(condition))
                );

            const found = [];
            let test = null;
            let describeSwitched = false;

            read(file)
                .split('\n')
                .forEach((line, index) => {
                    if (/^\s*test\.describe[.(]/.test(line)) {
                        describeSwitched = false;
                        test = null;
                    } else if (/^\s*test\s*\(/.test(line)) {
                        test = { off: describeSwitched };
                    } else if (/test\.skip\(/.test(line)) {
                        if (test) {
                            test.off = test.off || switched(line);
                        } else {
                            describeSwitched = describeSwitched || switched(line);
                        }
                    }

                    for (const [id] of line.matchAll(SCENARIO_REFERENCE)) {
                        found.push({ id, test, place: `${file}:${index + 1}` });
                    }
                });

            // Выключатель стоит первой строкой тела, то есть ниже заголовка теста с
            // идентификатором: состояние теста читается, когда файл разобран целиком
            found.forEach(({ id, test: own, place }) => remember(id, { place, screen: Boolean(e2eRoot), off: Boolean(own?.off) }));
        }

        // Наборы сценариев на shell. Так проверяются исполняемые файлы — гарды, проверки,
        // умолчания: они не на TypeScript, и набор к ним пишут на том же языке, что и их
        // самих. Выключателей здесь нет: пропустить сценарий в таком наборе нечем, поэтому
        // достаточно найти идентификатор.
        for (const file of walk(root, (name) => name.endsWith('.test.sh'))) {
            read(file)
                .split('\n')
                .forEach((line, index) => {
                    for (const [id] of line.matchAll(SCENARIO_REFERENCE)) {
                        remember(id, { place: `${file}:${index + 1}`, screen: false, off: false });
                    }
                });
        }
    }

    return references;
}

export { collectReferences, parseScenarios, promisesScreen };
