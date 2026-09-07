/**
 * The spec contract against what the code declares: the procedure table against the decorators,
 * the refusal codes against the throw points.
 */
import { BACKTICKED, PROCEDURE_ROOTS, bulletsOf, read, report, sectionOf, walk } from './spec-common.mjs';

// ── 2. The contract against the decorators ────────────────────────────────────

/** The lib roots whose procedures the domain serves; declared in the spec header. */
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

/** What the procedures themselves declare: the contract method and the right to it. */
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

/** Rows of the "Contract" table: the first cell is the procedure, the second is the right. */
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
        // A row with a refusal code in the second cell does not count as a procedure. The
        // "Contract" section holds two different tables: the list of procedures with rights and
        // the list of refusal codes with reasons — and by the shape of a row they are
        // indistinguishable, both carry a value in backticks in the first cell. While the parse
        // took any of them, a spec with declared procedures got its own table of codes read as a
        // list of procedures: every row of it became a procedure the domain does not have.
        if (/^\d{3}$/.test(permission.trim())) {
            continue;
        }
        rows.push({ line: index, name, permission: permission.trim(), short: name.split('.').pop() });
    }

    return rows;
}

function checkContract(file, text, roots) {
    if (roots === null) {
        report(file, 'the header carries no line `**Процедуры:**` — there is nothing to check the table of «Контракт» against the decorators with');

        return;
    }
    const declared = declaredProcedures(roots);
    const rows = contractRows(text);
    const described = new Set();

    for (const row of rows) {
        const found = declared.get(row.short.toLowerCase());
        if (!found) {
            report(file, `«Контракт» carries \`${row.name}\`, and there is no procedure with such a method in ${roots.join(', ')}`);
            continue;
        }
        described.add(row.short.toLowerCase());
        if (found.permission && row.permission !== found.permission) {
            report(
                file,
                `the permission of \`${row.name}\` diverged: in the spec «${row.permission}», ` + `in \`${found.file}\` it is declared «${found.permission}»`
            );
        }
    }

    for (const [key, found] of declared) {
        if (!described.has(key)) {
            report(
                file,
                `the procedure \`${found.service}.${found.method}\` (${found.file}) belongs to the domain, ` + 'and the table of «Контракт» does not carry it'
            );
        }
    }
}

// ── 3. Refusal codes ──────────────────────────────────────────────────────────

function checkRefusalCodes(file, text, roots) {
    const section = sectionOf(text, '### Коды отказов');
    const bullets = bulletsOf(section);
    /**
     * "Not applicable" is a lawful answer here too. A domain that has procedures but not a single
     * `Code.X` could not be described otherwise at all: the check rejects an empty section, and it
     * rejects any written-out code all the more — there is no one in the domain to throw it. This
     * is how the liveness check lives: it gives its refusal by an answer code, not by a procedure
     * refusal.
     */
    // Without `\b`: Cyrillic is not part of `\w`, so no word boundary arises after the word
    const notApplicable = section.some((line) => /^Не применимо/.test(line.trim()));
    if (!bullets.length) {
        if (!notApplicable) {
            report(file, 'the section `### Коды отказов` carries no code at all and no answer «Не применимо»');
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
            report(file, `«Коды отказов» carries a line without a code in quotes: «${bullet.text.slice(0, 60)}…»`);
            continue;
        }
        if (!thrown.has(code)) {
            report(file, `the refusal code \`${code}\` is thrown nowhere in the domain — either it is not from here, or the path does not give it`);
        }
    }
}

export { checkContract, checkRefusalCodes, procedureRootsOf };
