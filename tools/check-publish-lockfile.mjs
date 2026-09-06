#!/usr/bin/env node
/**
 * Пересобирает ли конвейер публикации замок зависимостей вместе с поднятием версии.
 *
 * Зачем это есть. Конвейер публикации поднимает версию пакета и версии, которыми пакеты называют
 * друг друга, а замок оставляет прежним. Расхождение молчит до следующей публикации: она ставит
 * зависимости из замороженного замка, видит там прежние версии и падает — причём падает не тот
 * выпуск, который расхождение завёл. Целая череда выпусков встала так, и каждый разблокировали
 * замком, пересобранным руками.
 *
 * Судятся сами файлы конвейеров, а не прогон: прогон бывает раз в несколько недель и только у
 * владельца, а конвейер заводят копией соседнего — и седьмой выпадет из починенных шести молча.
 *
 * Ненулевой код возврата и перечень конвейеров, где пересборки нет.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Каталог конвейеров переопределяется переменной: набор проб судит дерево-фикстуру, а не своё. */
const DIR = process.env.RT_WORKFLOWS_DIR || join(ROOT, '.github/workflows');

/** Признак публикующего конвейера: он поднимает версию пакета своим скриптом. */
const RAISES_VERSION = /^\s*node update-version[\w-]*\.cjs /m;

/** Пересборка замка. Форма вызова у неё одна, и искать её по имени скрипта нечем. */
const RESYNC = /^\s*pnpm install --lockfile-only\s*$/m;

/** Шаг, который кладёт заявку: пересборка обязана стоять раньше него, иначе она уедет не с той. */
const COMMITS = /^\s*- uses: EndBug\/add-and-commit/m;

const problems = [];
const files = readdirSync(DIR)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort();

let judged = 0;

for (const name of files) {
    const text = readFileSync(join(DIR, name), 'utf8');

    if (!RAISES_VERSION.test(text)) {
        continue;
    }

    judged += 1;

    const resync = RESYNC.exec(text);

    if (!resync) {
        problems.push(`${name}: версию поднимает, а замок зависимостей не пересобирает — следующая публикация встанет на замороженной установке`);
        continue;
    }

    const commit = COMMITS.exec(text);

    if (commit && resync.index > commit.index) {
        problems.push(`${name}: замок пересобирается после шага, кладущего заявку, — в неё он уже не попадёт`);
    }
}

if (judged === 0) {
    console.error(`check-publish-lockfile: в «${DIR}» нет ни одного конвейера, поднимающего версию, — судить нечего`);
    process.exit(1);
}

if (problems.length === 0) {
    console.log(`check-publish-lockfile: конвейеров публикации ${judged}, все пересобирают замок вместе с версией`);
    process.exit(0);
}

console.error(`check-publish-lockfile: конвейеров публикации ${judged}, с расхождением ${problems.length}\n`);
problems.forEach((line) => console.error(line));
process.exit(1);
