#!/usr/bin/env node
// rt-kit v0.18.0 · checks/check-hook-scope.mjs · 882cb7623e00 · правится надстройкой, не здесь
/**
 * Сверка объявления гарда с тем, что разбирает его тело.
 *
 * Гард несёт своё событие и образец вызова сам — строкой `# rt-hook:` во второй строке файла; по
 * ней его подписывают в настройке агента. Тело при этом умеет больше, чем объявлено: разбирает
 * имя инструмента, которого в образце нет, — и до этой ветки вызов не доходит никогда. Снаружи
 * гард выглядит работающим: путь назван, файл разложен, набор сценариев зелёный, потому что зовёт
 * гард напрямую с подставленным вводом и объявления не читает вовсе.
 *
 * Хуже того, расхождение читается как промах дерева. Дерево, подписавшее гард шире объявления,
 * получает отказ сверки раскладки и сужает подписку до объявления — вместе с расхождением снимая
 * работавшее покрытие. Чинится это в пакете, а платит за него дерево.
 *
 * Что сверяется: имена инструментов из веток `case` по имени инструмента против образца
 * объявления. Комментарии и тексты отказов не читаются: имя инструмента упоминают и там, а
 * судится то, на что гард ветвится.
 *
 * FAIL-OPEN: каталога хуков нет — сверять нечего, нулевой код.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const HOOKS = join(ROOT, '.claude/hooks');

/** Объявление гарда: событие и образец вызова. */
const DECLARATION = /^#\s*rt-hook:\s*(\S+)(?:[ \t]+(\S.*))?$/m;

/** Ветка `case` по имени инструмента: `Bash | mcp__webstorm__execute_tool)`. */
const TOOL_CASE = /^[ \t]*([A-Za-z_][\w-]*(?:__[\w-]+)*(?:[ \t]*\|[ \t]*[A-Za-z_][\w-]*(?:__[\w-]+)*)*)\)/;

/** Имена инструментов, на которые ветвится тело гарда. */
function branchedTools(text) {
    const lines = text.split('\n');
    const tools = new Set();
    let inside = false;

    for (const line of lines) {
        const code = line.replace(/^([^#]*)#.*$/, '$1');

        if (/case[ \t]+"?\$(\{)?(tool|RT_HOOK_TOOL)/.test(code) || /case[ \t]+"\$\(rt_hook_tool\)"/.test(code)) {
            inside = true;
            continue;
        }

        if (inside && /^[ \t]*esac\b/.test(code)) {
            inside = false;
            continue;
        }

        if (!inside) {
            continue;
        }

        const branch = code.match(TOOL_CASE);
        if (branch) {
            for (const name of branch[1].split('|')) {
                const tool = name.trim();
                // Звёздочка — ветка «всё остальное», именем инструмента она не является.
                if (tool && tool !== '*') {
                    tools.add(tool);
                }
            }
        }
    }

    return [...tools];
}

/** Покрывает ли образец объявления это имя инструмента. */
function covers(matcher, tool) {
    try {
        return new RegExp(`^(?:${matcher})$`).test(tool);
    } catch {
        // Образец, который не разобрать, — своё расхождение, и молчать о нём нельзя: имя
        // инструмента под ним не совпадёт ни с чем, а выглядит объявление написанным.
        return false;
    }
}

function main() {
    if (!existsSync(HOOKS)) {
        console.log('check-hook-scope: каталога хуков в дереве нет — сверять нечего');

        return 0;
    }

    const faults = [];

    for (const file of readdirSync(HOOKS).filter((one) => one.endsWith('.sh')).sort()) {
        const text = readFileSync(join(HOOKS, file), 'utf8');
        const declared = text.match(DECLARATION);
        if (!declared || !declared[2]) {
            continue;
        }

        const matcher = declared[2].trim();
        for (const tool of branchedTools(text)) {
            if (!covers(matcher, tool)) {
                faults.push(`${file}: тело ветвится на «${tool}», а объявление его не называет`);
            }
        }
    }

    if (faults.length > 0) {
        console.log(`check-hook-scope: расхождений ${faults.length}\n`);

        for (const fault of faults) {
            console.log(`  ${fault}`);
        }

        console.log('\nВетка тела, которой нет в объявлении, не исполняется ни разу: под этим именем гард');
        console.log('не зовут. Объявление правится в источнике пакета, а не в разложенной копии.');

        return 1;
    }

    console.log('check-hook-scope: объявления гардов покрывают то, на что ветвятся их тела — сошлось');

    return 0;
}

process.exit(main());
