/**
 * It matches the input tables on the overview pages of `@rt-tools/ui-kit-v2` against the components
 * themselves.
 *
 * The tables are written by hand — `compodoc` was rejected by the decision ADR 0002. The price of that
 * decision is that a second copy of the same list appears next to the code, and the copies diverge
 * silently: neither the build nor the lint reads the table, and an input renamed in the component goes
 * on standing in the document under its former name.
 *
 * The check works by the sources rather than by the built package: the overview pages do not travel
 * into the package, and a divergence must be caught where it is fixed.
 */
const fs = require('fs');
const path = require('path');

const componentsDir = path.resolve(__dirname, '../projects/ui-kit-v2/src/lib/components');
const baseSource = path.join(componentsDir, 'form-control/rt-form-control.base.ts');
/** The heading of the section describing the inputs a field got from the base. */
const BASE_SECTION = 'Входы от основы полей';
const failures = [];

/**
 * The names of the inputs declared in the component: `input(...)` and `input.required(...)`.
 *
 * The declaration is looked for within one line (`[^;\n]`): without that boundary a field without
 * an assignment — abstract or declared by a type — would stick to the input following it, take its
 * `= input` for itself, and the input itself would stay unfound.
 */
function declaredInputs(source) {
    const names = new Set();
    const pattern = /(?:public\s+)?readonly\s+([A-Za-z_$][\w$]*)\s*:[^;\n]*?=\s*input\b/g;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        names.add(match[1]);
    }

    return names;
}

/**
 * The names of the inputs listed on the overview page in the section with the given heading:
 * the table's first column, in backticks.
 *
 * What is read is bounded by the section because on the same page stand the tables of the axes, the
 * states and the outputs, and their first column also sometimes holds a name in backticks. Without
 * the boundary the axis value `primary` would count as an input the component does not hold, and the
 * guard would fall on a sound document. There is no section — there is nothing to read, and every
 * input will be reported as undescribed.
 */
function documentedInputs(source, heading) {
    const section = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, 'm').exec(source);
    const names = new Set();

    if (section === null) {
        return names;
    }

    const pattern = /^\|\s*`([A-Za-z_$][\w$]*)`\s*\|/gm;
    let match;

    while ((match = pattern.exec(section[1])) !== null) {
        names.add(match[1]);
    }

    return names;
}

/** It matches one list of names against one table and gathers the divergences of both sides. */
function compare(declared, documented, { relative, section, subject }) {
    // A documented input is not in the code — renamed or thrown out, and the document does not know it.
    for (const name of documented) {
        if (!declared.has(name)) {
            failures.push(`${relative}: the section «${section}» holds \`${name}\`, and ${subject} does not hold it`);
        }
    }

    // The input is there and the row is not — «all the inputs are described» holds by the author's memory.
    for (const name of declared) {
        if (!documented.has(name)) {
            failures.push(`${relative}: the input \`${name}\` is not described in the section «${section}»`);
        }
    }
}

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return entry.name === 'stories' ? [] : walk(full);
        }
        return [full];
    });
}

const files = walk(componentsDir);
const overviews = files.filter((file) => file.endsWith('.mdx'));

for (const overview of overviews) {
    const dir = path.dirname(overview);
    const sources = files.filter(
        (file) =>
            path.dirname(file) === dir && (file.endsWith('.component.ts') || file.endsWith('.directive.ts')) && !file.endsWith('.spec.ts')
    );

    if (sources.length === 0) {
        failures.push(
            `${path.relative(componentsDir, overview)}: there is no component next to it — there is nothing to match the table against`
        );
        continue;
    }

    const declared = new Set();
    let extendsBase = false;
    for (const source of sources) {
        const text = fs.readFileSync(source, 'utf8');
        for (const name of declaredInputs(text)) {
            declared.add(name);
        }
        extendsBase = extendsBase || text.includes('extends RtFormControlBase');
    }

    const page = fs.readFileSync(overview, 'utf8');
    const relative = path.relative(componentsDir, overview);

    compare(declared, documentedInputs(page, 'Входы'), {
        relative,
        section: 'Входы',
        subject: "the component's inputs",
    });

    // Half a field's inputs are declared not in its file but in the base it inherits from. The list
    // from there is described by a separate table: merged with its own inputs it would look declared
    // here, and would diverge silently — an edit in the base changes all the heirs' pages at once,
    // and not one of them learns about it.
    if (extendsBase) {
        compare(declaredInputs(fs.readFileSync(baseSource, 'utf8')), documentedInputs(page, BASE_SECTION), {
            relative,
            section: BASE_SECTION,
            subject: "the fields base's inputs",
        });
    }
}

if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`The input tables diverged from the components:\n${failures.map((line) => `  - ${line}`).join('\n')}`);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(
    overviews.length === 0
        ? 'There are no overview pages yet — there is nothing to match.'
        : `Overview pages matched: ${overviews.length}, no divergences with the components' inputs.`
);
