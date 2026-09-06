#!/usr/bin/env node
/**
 * Пересобирает ли конвейер публикации замок зависимостей после публикации и кладёт ли его заявкой.
 *
 * Зачем это есть. Конвейер публикации поднимает версию пакета и версии, которыми пакеты называют
 * друг друга, а замок оставлял прежним. Расхождение молчит до следующей публикации: она ставит
 * зависимости из замороженного замка, видит там прежние версии и падает — причём падает не тот
 * выпуск, который расхождение завёл. Целая череда выпусков встала так, и каждый разблокировали
 * замком, пересобранным руками.
 *
 * Где пересборка стоит, судится тоже. Поставленная до публикации, она просит у реестра версию,
 * которую подъём только что вписал зависимым пакетам, — а в реестре её ещё нет, и первый же
 * выпуск ядра встал на этом. Поэтому пересборка идёт после шага публикации, а за ней стоит свой
 * шаг заявки: без него пересобранный замок остаётся на раннере.
 *
 * Судятся сами файлы конвейеров, а не прогон: прогон бывает раз в несколько недель и только у
 * владельца, а конвейер заводят копией соседнего — и седьмой выпадет из починенных шести молча.
 *
 * Ненулевой код возврата и перечень конвейеров с расхождением.
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
const RESYNC = /^\s*pnpm install --lockfile-only\b/m;

/** Шаг публикации: команда упаковки пакета — единственное, что зовёт реестр на запись. */
const PUBLISHES = /^\s*run: pnpm run packagr[\w:-]*\s*$/m;

/** Шаг, который кладёт заявку. Ищется каждый: у конвейера их два — о версии и о замке. */
const COMMITS = /^\s*- uses: EndBug\/add-and-commit/gm;

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

    const publish = PUBLISHES.exec(text);

    if (publish && resync.index < publish.index) {
        problems.push(`${name}: замок пересобирается до публикации — версии, вписанной зависимым пакетам, в реестре ещё нет, и разрешить её нечем`);
        continue;
    }

    const commitsAfter = [...text.matchAll(COMMITS)].filter((match) => match.index > resync.index);

    if (commitsAfter.length === 0) {
        problems.push(`${name}: после пересборки замка нет шага, кладущего заявку, — пересобранный замок останется на раннере`);
    }
}

if (judged === 0) {
    console.error(`check-publish-lockfile: в «${DIR}» нет ни одного конвейера, поднимающего версию, — судить нечего`);
    process.exit(1);
}

if (problems.length === 0) {
    console.log(`check-publish-lockfile: конвейеров публикации ${judged}, все пересобирают замок после публикации и кладут его заявкой`);
    process.exit(0);
}

console.error(`check-publish-lockfile: конвейеров публикации ${judged}, с расхождением ${problems.length}\n`);
problems.forEach((line) => console.error(line));
process.exit(1);
