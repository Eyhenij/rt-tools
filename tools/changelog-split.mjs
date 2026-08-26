#!/usr/bin/env node
/**
 * Деление журнала выпусков, когда он перерос предел длины.
 *
 * Журнал растёт известным движением — выпуском, — а длину его меряли на пуше: журнал приехал
 * вливанием главной ветки с 530 строками при пределе 500, и из дерева перестала пушиться любая
 * ветка. Причина лежала в чужой работе, а чинил тот, кто подвернулся.
 *
 * Команда зовётся выпуском сразу после дописи журнала и до коммита редакции: делит тем же
 * движением, которое растит. Прогоняется и на месте — на любом журнале, без выпуска.
 *
 * Старые выпуски уезжают в отдельный файл, названный диапазоном версий. Свежие остаются: их
 * читают, а генератор дописывает новый выпуск в начало и до старых строк не доходит.
 *
 * Без правки выходит нулём и говорит, что делить нечего. Ненулевой код — только отказ самой
 * команды.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const FILE = process.argv[2] ?? 'projects/agent-kit/CHANGELOG.md';
const LIMIT = CONFIG.fileSizeLimit;
/**
 * Сколько строк оставить в свежей части. Половина предела, а не «предел минус чуть-чуть»:
 * делённый впритык, журнал упирается в предел через два выпуска, и делить приходится снова.
 */
const KEEP = Math.floor(LIMIT / 2);
/** Заголовок выпуска: генератор пишет крупный для минорных и мелкий для патчей. */
const RELEASE = /^#{1,2} \[([0-9]+\.[0-9]+\.[0-9]+)\]/;

/** Разделы журнала: шапка до первого выпуска и по разделу на выпуск, свежие сверху. */
function split(lines) {
    const head = [];
    const sections = [];
    for (const line of lines) {
        const match = RELEASE.exec(line);
        if (match) {
            sections.push({ version: match[1], lines: [line] });
            continue;
        }
        if (sections.length === 0) {
            head.push(line);
            continue;
        }
        sections.at(-1).lines.push(line);
    }

    return { head, sections };
}

function main() {
    const path = join(ROOT, FILE);
    const lines = readFileSync(path, 'utf8').split('\n');
    if (lines.length <= LIMIT) {
        console.log(`changelog-split: ${FILE} — ${lines.length} строк при пределе ${LIMIT}, делить нечего`);

        return 0;
    }

    const { head, sections } = split(lines);
    if (sections.length < 2) {
        console.error(`changelog-split: в ${FILE} меньше двух выпусков — делить нечего, а длина взялась не отсюда`);

        return 1;
    }

    // Свежие набираются сверху, пока влезают в половину предела; первый выпуск остаётся всегда,
    // даже если он один длиннее её: журнал без последнего выпуска бессмыслен.
    const keep = [];
    let count = head.length;
    for (const section of sections) {
        if (keep.length > 0 && count + section.lines.length > KEEP) {
            break;
        }
        keep.push(section);
        count += section.lines.length;
    }

    const moved = sections.slice(keep.length);
    if (moved.length === 0) {
        console.error(`changelog-split: ${FILE} длиннее предела, но весь его объём в свежих выпусках — делить нечего`);

        return 1;
    }

    const oldest = moved.at(-1).version;
    const newest = moved[0].version;
    const name = `${basename(FILE, '.md')}-${oldest}-${newest}.md`;
    const target = join(dirname(path), name);
    const title = `# Журнал изменений — выпуски ${oldest} … ${newest}\n
Старая часть журнала, вынесенная из \`${FILE}\`: тот перерос предел длины документа, а генератор
дописывает новый выпуск только в начало и до этих строк не доходит. Свежие выпуски — там, здесь
только описание прошлого; оно не правится.\n`;

    writeFileSync(target, `${title}\n${moved.flatMap((section) => section.lines).join('\n')}`.replace(/\n+$/, '\n'));
    writeFileSync(path, `${[...head, ...keep.flatMap((section) => section.lines)].join('\n')}`.replace(/\n+$/, '\n'));

    console.log(
        `changelog-split: ${FILE} был ${lines.length} строк при пределе ${LIMIT}\n` +
            `  осталось выпусков: ${keep.length} (${keep[0].version} … ${keep.at(-1).version})\n` +
            `  вынесено выпусков: ${moved.length} → ${join(dirname(FILE), name)}`
    );

    return 0;
}

process.exit(main());
