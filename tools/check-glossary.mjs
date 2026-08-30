#!/usr/bin/env node
// rt-kit v0.21.0 · checks/check-glossary.mjs · b1b956a264a4 · правится надстройкой, не здесь
/**
 * Слова, которых здесь не пишут: раздел «Так не пишем» словаря против дерева.
 *
 * Раздел лежал без единой проверки, и ровно поэтому расхождение росло годами: словарь звал
 * службу одним словом, дерево — другим, и обе стороны выглядели действующими. Правило прямо
 * велит брать слово из словаря или заводить его там же, а не краснело ничто — сверка адресов
 * читает пути, сверка спеков читает сценарии, а словарь не читает никто.
 *
 * Проверка едет пакетом, а не пишется деревом: раздел «Так не пишем» везёт он же, и дерево,
 * которое словарь получило, а проверки на него нет, живёт ровно с той дырой, ради которой она
 * заведена. Слова при этом принадлежат словарю: пакет их не перечисляет, а читает из раздела.
 * Общее для проверок — разбор списка известного и список пропускаемых каталогов — приезжает
 * модулем настройки проверок, а не пишется здесь заново.
 *
 * Ищется левая колонка пар «слева запретное — справа принятое», и не вся: слово со скобочным
 * уточнением («приём (о службе)») поиском не судится вовсе. Уточнение и означает, что запрещено
 * одно значение из двух, а различить их в строке машине нечем: «операция приёма» законна, а
 * «приём принимает груз» — нет, и обе строки для поиска одинаковы. Такое слово остаётся
 * требованием к читателю; проверка о нём говорит вслух, чтобы молчание не читалось как охват.
 *
 * Сам словарь из поиска выведен: в нём запретное слово стоит по делу — тем и живёт левая
 * колонка. Выведено и описание прошлого: оно по устройству называет то, чего в дереве уже нет.
 *
 * Ненулевой код возврата и перечень мест; накопленное к дню заведения проверки перечислено
 * поимённо, с причиной и номером задачи.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CONFIG, ROOT, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

const GLOSSARY = 'docs/GLOSSARY.md';
const SECTION = '## Так не пишем';
/** Пара словаря: `- **слева** — справа`. Слева бывает несколько слов через запятую. */
const PAIR = /^-\s+\*\*(.+?)\*\*\s+—/;
/** Скобочное уточнение при слове: запрещено одно значение из двух, и поиском их не развести. */
const HINT = /\([^)]*\)\s*$/;

/**
 * Что проверка не читает.
 *
 * Всякий словарь — здешний, его надстройка и источник в пакете — выведен по делу: левая колонка
 * тем и живёт, что называет запретное слово вслух. Описание прошлого и папки задач выведены по
 * устройству: первое перечисляет то, чего в дереве уже нет, вторая умирает со слиянием.
 */
const UNREAD = ['docs/archive/', 'docs/tasks/', 'CHANGELOG'];
const GLOSSARY_NAME = /(^|\/)GLOSSARY\.md$/;

/** Левая колонка раздела «Так не пишем»: слова, которых в дереве быть не должно. */
function forbiddenWords(text) {
    const lines = text.split('\n');
    const from = lines.findIndex((line) => line.trim() === SECTION);
    if (from < 0) {
        return { words: [], byReader: [] };
    }

    const words = [];
    const byReader = [];
    for (const line of lines.slice(from + 1)) {
        if (line.startsWith('## ')) {
            break;
        }
        const found = PAIR.exec(line);
        if (!found) {
            continue;
        }
        for (const part of found[1].split(',')) {
            const word = part.trim();
            if (!word) {
                continue;
            }
            if (HINT.test(word)) {
                byReader.push(word);
                continue;
            }
            words.push(word);
        }
    }

    return { words, byReader };
}

/** Файлы дерева, которые проверка читает. Список берётся у системы контроля версий. */
function readableFiles() {
    const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    if (listed.status !== 0) {
        return [];
    }

    const skip = CONFIG.skipDirs ?? [];

    return listed.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((file) => file.endsWith('.md'))
        .filter((file) => !GLOSSARY_NAME.test(file))
        .filter((file) => !UNREAD.some((where) => file === where || file.startsWith(where) || file.includes(`/${where}`)))
        .filter((file) => !skip.some((where) => file.includes(`/${where}/`) || file.startsWith(`${where}/`)));
}

function main() {
    let glossary;
    try {
        glossary = readFileSync(join(ROOT, GLOSSARY), 'utf8');
    } catch {
        console.log(`check-glossary: словаря нет по адресу ${GLOSSARY} — сверять нечем`);

        return Number(process.env.RT_SKIP_CODE ?? 7);
    }

    const { words, byReader } = forbiddenWords(glossary);
    if (!words.length && !byReader.length) {
        console.log('check-glossary: раздела запретных слов в словаре нет — сверять нечем');

        return Number(process.env.RT_SKIP_CODE ?? 7);
    }

    const parsed = parseAllowlist('glossary');
    const found = [];
    for (const file of readableFiles()) {
        let text;
        try {
            text = readFileSync(join(ROOT, file), 'utf8');
        } catch {
            continue;
        }
        for (const [index, line] of text.split('\n').entries()) {
            for (const word of words) {
                if (!new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'iu').test(line)) {
                    continue;
                }
                found.push({ key: `${file}:${word}`, file, line: index + 1, word });
            }
        }
    }

    const fresh = baselineOf(
        found.map((one) => one.key),
        parsed,
    );
    const news = found.filter((one) => fresh.includes(one.key));

    if (news.length) {
        console.error(`check-glossary: расхождений ${news.length}`);
        for (const one of news) {
            console.error(`  ${one.file}:${one.line} — «${one.word}»: слово стоит в разделе «Так не пишем» словаря`);
        }
        console.error('  либо слово меняется на принятое здесь, либо словарь перестаёт его запрещать');

        return 1;
    }

    console.log(`check-glossary: запретных слов ${words.length}, читано документов ${readableFiles().length}, расхождений нет`);
    if (byReader.length) {
        // Молчание о невыполнимом поиске читалось бы как охват: эти слова не судит ничто.
        console.log(`  поиском не судятся, остаются требованием к читателю: ${byReader.join(', ')}`);
    }

    return 0;
}

process.exit(main());
