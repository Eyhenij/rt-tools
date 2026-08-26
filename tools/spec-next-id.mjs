#!/usr/bin/env node
/**
 * Следующий свободный номер сценария — по всем веткам, а не по одной главной.
 *
 * Номер связывает сценарий с тестом, и отданный второй раз он оставляет старую ссылку
 * правильной на вид и ведущей не туда. Свободный номер смотрели в главной ветке, а соседняя
 * работа держала свои шесть на диске и в главную ещё не въехала: `SC-AK-415` … `SC-AK-420`
 * раздали дважды, и двигаться пришлось той работе, чья договорённость не влита.
 *
 * Команда читает заголовки сценариев во всех ветках дерева — своих и удалённых, — и печатает
 * первый свободный номер за наибольшим занятым. Занятым считается номер, стоящий хоть где-то:
 * ветка, которая его держит, рано или поздно въедет.
 *
 *   node tools/spec-next-id.mjs AK      # следующий свободный для префикса AK
 *   node tools/spec-next-id.mjs         # по префиксу на каждый, что встретился
 *
 * Ненулевой код — только отказ самой команды.
 */
import { execFileSync } from 'node:child_process';

const WANT = process.argv[2]?.toUpperCase().replace(/^SC-|-$/g, '') ?? '';
const HEADING = /\bSC-([A-Z]{2,4})-(\d{1,3})\b/g;

function git(args) {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** Ветки дерева: свои и удалённые. Ветка, держащая номер, рано или поздно въедет. */
function branches() {
    const names = git(['for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes'])
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((ref) => !ref.endsWith('/HEAD'));

    return [...new Set(names)];
}

function main() {
    const taken = new Map();
    for (const ref of branches()) {
        let text = '';
        try {
            text = git(['grep', '-h', '-oE', 'SC-[A-Z]{2,4}-[0-9]{1,3}', ref, '--', 'docs']);
        } catch {
            // Ветка без единого сценария — законный случай: `git grep` отдаёт ненулевой код.
            continue;
        }
        for (const match of text.matchAll(HEADING)) {
            const [, prefix, number] = match;
            const max = taken.get(prefix) ?? 0;
            taken.set(prefix, Math.max(max, Number(number)));
        }
    }

    if (taken.size === 0) {
        console.log('spec-next-id: сценариев не нашлось ни в одной ветке');

        return 0;
    }

    const rows = [...taken.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, max] of rows) {
        if (WANT && prefix !== WANT) {
            continue;
        }
        console.log(`SC-${prefix}: занято до ${max}, следующий свободный — SC-${prefix}-${max + 1}`);
    }

    if (WANT && !taken.has(WANT)) {
        console.log(`SC-${WANT}: ни одного номера не занято, следующий свободный — SC-${WANT}-1`);
    }

    return 0;
}

process.exit(main());
