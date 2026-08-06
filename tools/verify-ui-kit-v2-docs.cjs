/**
 * Сверяет таблицы входов на страницах-обзорах `@rt-tools/ui-kit-v2` с самими компонентами.
 *
 * Таблицы пишутся руками — `compodoc` отвергнут решением ADR 0002. Цена этого решения в том,
 * что рядом с кодом появляется вторая копия того же перечня, а расходятся копии молча: ни
 * сборка, ни линт таблицу не читают, и вход, переименованный в компоненте, продолжает
 * числиться в документе под старым именем.
 *
 * Проверка работает по исходникам, а не по собранному пакету: страницы-обзоры в пакет не
 * уезжают, а расхождение должно ловиться там, где его чинят.
 */
const fs = require('fs');
const path = require('path');

const componentsDir = path.resolve(__dirname, '../projects/ui-kit-v2/src/lib/components');
const failures = [];

/** Имена входов, объявленных в компоненте: `input(...)` и `input.required(...)`. */
function declaredInputs(source) {
    const names = new Set();
    const pattern = /(?:public\s+)?readonly\s+([A-Za-z_$][\w$]*)\s*:[^=]*=\s*input\b/g;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        names.add(match[1]);
    }

    return names;
}

/** Имена входов, перечисленные в таблице страницы-обзора: первая колонка в обратных кавычках. */
function documentedInputs(source) {
    const names = new Set();
    const pattern = /^\|\s*`([A-Za-z_$][\w$]*)`\s*\|/gm;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        names.add(match[1]);
    }

    return names;
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
        failures.push(`${path.relative(componentsDir, overview)}: рядом нет компонента — таблицу не с чем сверить`);
        continue;
    }

    const declared = new Set();
    for (const source of sources) {
        for (const name of declaredInputs(fs.readFileSync(source, 'utf8'))) {
            declared.add(name);
        }
    }

    const documented = documentedInputs(fs.readFileSync(overview, 'utf8'));
    const relative = path.relative(componentsDir, overview);

    // Задокументированного входа нет в коде — переименован или выкинут, а документ этого не знает.
    for (const name of documented) {
        if (!declared.has(name)) {
            failures.push(`${relative}: в таблице есть \`${name}\`, а среди входов компонента его нет`);
        }
    }

    // Вход есть, а строки нет — «все входы описаны» держится на памяти автора.
    for (const name of declared) {
        if (!documented.has(name)) {
            failures.push(`${relative}: вход \`${name}\` не описан в таблице`);
        }
    }
}

if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Таблицы входов разошлись с компонентами:\n${failures.map((line) => `  - ${line}`).join('\n')}`);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(
    overviews.length === 0
        ? 'Страниц-обзоров пока нет — сверять нечего.'
        : `Сверено страниц-обзоров: ${overviews.length}, расхождений с входами компонентов нет.`
);
