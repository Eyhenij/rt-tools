// rt-kit v0.10.0 · checks/spec-contract.mjs · 73121c2c0a51 · правится надстройкой, не здесь
/**
 * Контракт спека против того, что объявлено в коде: таблица процедур — против декораторов,
 * коды отказов — против точек броска.
 */
import { BACKTICKED, PROCEDURE_ROOTS, bulletsOf, read, report, sectionOf, walk } from './spec-common.mjs';

// ── 2. Контракт против декораторов ────────────────────────────────────────────

/** Корни либ, чьи процедуры домен обслуживает; объявлены в шапке спека. */
function procedureRootsOf(text) {
    const line = text.split('\n').find((candidate) => PROCEDURE_ROOTS.test(candidate));
    if (!line) {
        return null;
    }
    const value = line.match(PROCEDURE_ROOTS)[1];
    if (/^\s*нет\s*$/i.test(value.replace(/[`.]/g, ''))) {
        return [];
    }

    return [...value.matchAll(BACKTICKED)].map(([, path]) => path);
}

/** Что объявлено в самих процедурах: метод контракта и право на него. */
function declaredProcedures(roots) {
    const found = new Map();
    for (const root of roots) {
        for (const file of walk(root, (name) => name.endsWith('.procedure.ts'))) {
            const text = read(file);
            const method = text.match(/\.method\.([A-Za-z_]\w*)/);
            if (!method) {
                continue;
            }
            const service = text.match(/typeof\s+(\w+)\.method\./);
            const required = text.match(/@RequiresPermission\(\s*'([^']+)'/);
            const isPublic = /@PublicProcedure\(/.test(text);
            found.set(method[1].toLowerCase(), {
                file,
                method: method[1],
                service: service ? service[1] : '',
                permission: required ? required[1] : isPublic ? 'публично' : '',
            });
        }
    }

    return found;
}

/** Строки таблицы «Контракта»: первая ячейка — процедура, вторая — право. */
function contractRows(text) {
    const rows = [];
    for (const [index, line] of sectionOf(text, '## Контракт').entries()) {
        if (!line.startsWith('|') || /^\|[\s:|-]+\|$/.test(line)) {
            continue;
        }
        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
        if (cells.length < 2) {
            continue;
        }
        const name = (cells[0].match(/`([^`]+)`/) || [])[1];
        if (!name) {
            continue;
        }
        const permission = (cells[1].match(/`([^`]+)`/) || [])[1] || cells[1];
        rows.push({ line: index, name, permission: permission.trim(), short: name.split('.').pop() });
    }

    return rows;
}

function checkContract(file, text, roots) {
    if (roots === null) {
        report(file, 'в шапке нет строки `**Процедуры:**` — нечем сверить таблицу «Контракта» с декораторами');

        return;
    }
    const declared = declaredProcedures(roots);
    const rows = contractRows(text);
    const described = new Set();

    for (const row of rows) {
        const found = declared.get(row.short.toLowerCase());
        if (!found) {
            report(file, `в «Контракте» есть \`${row.name}\`, но процедуры с таким методом в ${roots.join(', ')} нет`);
            continue;
        }
        described.add(row.short.toLowerCase());
        if (found.permission && row.permission !== found.permission) {
            report(
                file,
                `право у \`${row.name}\` разошлось: в спеке «${row.permission}», ` + `в \`${found.file}\` объявлено «${found.permission}»`
            );
        }
    }

    for (const [key, found] of declared) {
        if (!described.has(key)) {
            report(
                file,
                `процедура \`${found.service}.${found.method}\` (${found.file}) домену принадлежит, ` + 'но в таблице «Контракта» её нет'
            );
        }
    }
}

// ── 3. Коды отказов ───────────────────────────────────────────────────────────

function checkRefusalCodes(file, text, roots) {
    const section = sectionOf(text, '### Коды отказов');
    const bullets = bulletsOf(section);
    /**
     * «Не применимо» — законный ответ и здесь. Домен, у которого есть процедуры,
     * но нет ни одного `Code.X`, иначе не описывался вовсе: пустой раздел
     * проверка отвергает, а любой выписанный код отвергает тем более — бросать
     * его в домене некому. Так живёт проверка живости: отказ она подаёт кодом
     * ответа, а не отказом процедуры.
     */
    // Без `\b`: кириллица не входит в `\w`, и границы слова после «применимо» не возникает
    const notApplicable = section.some((line) => /^Не применимо/.test(line.trim()));
    if (!bullets.length) {
        if (!notApplicable) {
            report(file, 'в разделе `### Коды отказов` нет ни одного кода и нет ответа «Не применимо»');
        }

        return;
    }
    if (!roots || !roots.length) {
        return;
    }
    const sources = roots.flatMap((root) => walk(root, (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts')));
    const thrown = new Set();
    for (const source of sources) {
        for (const [, code] of read(source).matchAll(/\bCode\.([A-Za-z]\w*)/g)) {
            thrown.add(code);
        }
    }

    for (const bullet of bullets) {
        const code = (bullet.text.match(/`([A-Za-z]\w*)`/) || [])[1];
        if (!code) {
            report(file, `в «Кодах отказов» строка без кода в кавычках: «${bullet.text.slice(0, 60)}…»`);
            continue;
        }
        if (!thrown.has(code)) {
            report(file, `код отказа \`${code}\` в домене нигде не бросается — либо он не отсюда, либо путь его не даёт`);
        }
    }
}

export { checkContract, checkRefusalCodes, procedureRootsOf };
