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
const baseSource = path.join(componentsDir, 'form-control/rt-form-control.base.ts');
/** Заголовок раздела, в котором описываются входы, доставшиеся полю от основы. */
const BASE_SECTION = 'Входы от основы полей';
const failures = [];

/**
 * Имена входов, объявленных в компоненте: `input(...)` и `input.required(...)`.
 *
 * Объявление ищется в пределах одной строки (`[^;\n]`): без этой границы поле без
 * присваивания — абстрактное или объявленное типом — склеивалось бы со следующим за ним
 * входом, забирало его `= input` себе, а сам вход оставался бы ненайденным.
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
 * Имена входов, перечисленные на странице-обзоре в разделе с заданным заголовком:
 * первая колонка таблицы, в обратных кавычках.
 *
 * Разделом читаемое ограничено потому, что на той же странице стоят таблицы осей, состояний
 * и выходов, и в их первой колонке тоже бывает имя в кавычках. Без границы значение оси
 * `primary` числилось бы входом, которого в компоненте нет, и страж падал бы на исправном
 * документе. Раздела нет — читать нечего, и каждый вход отчитается неописанным.
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

/** Сверяет один перечень имён с одной таблицей и копит расхождения обеих сторон. */
function compare(declared, documented, { relative, section, subject }) {
    // Задокументированного входа нет в коде — переименован или выкинут, а документ этого не знает.
    for (const name of documented) {
        if (!declared.has(name)) {
            failures.push(`${relative}: в разделе «${section}» есть \`${name}\`, а ${subject} его нет`);
        }
    }

    // Вход есть, а строки нет — «все входы описаны» держится на памяти автора.
    for (const name of declared) {
        if (!documented.has(name)) {
            failures.push(`${relative}: вход \`${name}\` не описан в разделе «${section}»`);
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
        failures.push(`${path.relative(componentsDir, overview)}: рядом нет компонента — таблицу не с чем сверить`);
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
        subject: 'среди входов компонента',
    });

    // Половина входов поля объявлена не в его файле, а в основе, от которой оно наследуется.
    // Перечень оттуда описывается отдельной таблицей: слитый с собственными входами, он
    // выглядел бы как объявленный здесь, а разошёлся бы молча — правка в основе меняет разом
    // все страницы наследников, и ни одна из них об этом не узнает.
    if (extendsBase) {
        compare(declaredInputs(fs.readFileSync(baseSource, 'utf8')), documentedInputs(page, BASE_SECTION), {
            relative,
            section: BASE_SECTION,
            subject: 'среди входов основы полей',
        });
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
