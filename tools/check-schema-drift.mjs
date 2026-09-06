#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-schema-drift.mjs · 380eff42ceb4 · правится надстройкой, не здесь
/**
 * Проверка того, что миграции и `prisma/schema.prisma` описывают одну и ту же базу.
 *
 * Расхождение между ними не видит ни линт, ни сборка: оно живёт не в коде, а между
 * схемой и SQL. Так в главную ветку уехала миграция, создававшая два индекса,
 * которых схема не объявляла, — выкатка упала уже в конвейере.
 *
 * Меряются именно миграции, а не база того, кто запускает проверку. База
 * разработчика законно несёт след любой недоделанной ветки: одна такая держала
 * пуш чужой правки четырьмя таблицами и восемью колонками, которых в схеме
 * главной ветки нет, — при том что миграции со схемой сходились.
 *
 * Поэтому миграции накатываются на одноразовую теневую базу и сравнивается она.
 * Теневая база заводится на каждый прогон и сносится после: оставленная между
 * прогонами, она сама накопит след ветки с миграцией, и проверка снова начнёт
 * судить о состоянии машины вместо репозитория.
 *
 * Ненулевой код возврата и объяснение расхождения.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** Суффикс теневой базы: по нему видно, что сносится именно она, а не чья-то рабочая */
const SHADOW_SUFFIX = '_gate_shadow';

/**
 * Признаки боевой базы — те же, что у `sql-guard`. Схема на проде меняется только
 * выкаткой, и проверка туда не ходит ни читать, ни писать.
 */
const PRODUCTION_MARKS = CONFIG.productionMarks ?? [];

/** Сервер жив, но базы нет; сервера нет вовсе — оба означают «проверять негде» */
const SERVER_DOWN_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT'];

function databaseUrl() {
    if (process.env['DATABASE_URL']) {
        return process.env['DATABASE_URL'];
    }

    const envFile = join(ROOT, '.env');
    if (!existsSync(envFile)) {
        return '';
    }

    const line = readFileSync(envFile, 'utf8')
        .split('\n')
        .find((row) => row.startsWith('DATABASE_URL='));

    return line
        ? line
              .slice('DATABASE_URL='.length)
              .trim()
              .replace(/^["']|["']$/g, '')
        : '';
}

/** Адрес теневой базы и адрес служебной, из которой она заводится и сносится */
function shadowAddresses(url) {
    const parsed = new URL(url);
    const name = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const shadowName = `${name}${SHADOW_SUFFIX}`;

    const shadow = new URL(url);
    shadow.pathname = `/${encodeURIComponent(shadowName)}`;

    // Завести и снести базу можно только из другой базы того же сервера; `postgres`
    // есть всегда, а рабочая для этого не годится — снос идёт при живых к ней
    // подключениях.
    const service = new URL(url);
    service.pathname = '/postgres';

    return { shadowName, shadowUrl: shadow.toString(), serviceUrl: service.toString() };
}

// Код, которым проверка объявляет, что смотреть было не на что. Прежде каждый такой выход был
// нулём: строка о пропуске уходила в вывод, а в сводке гейта пуша ноль стоял рядом с
// пройденными проверками и ничем от них не отличался — набор читался как проверенный целиком.
// Число знает и гард пуша: он называет пропущенное вслух, не отбивая пуш, потому что проверка,
// которой нечего смотреть, поломкой не является.
const SKIP = Number(process.env.RT_SKIP_CODE ?? 7);

/**
 * Тронула ли ветка хранилище — схему либо каталог миграций.
 *
 * Пропуск проверки законен ровно до этой черты. База на машине разработчика бывает погашена
 * буднично, и отбивать за это пуш документации не за что; но ветка, правившая миграции, без
 * прогона цепочки уезжает в главную вслепую — и падает не у неё, а на выкатке. Так и упал прод:
 * пять полей появились в схеме без миграций, часть страниц стала отвечать «не найдено», полчаса
 * недоступности, чинили откатом. Гейт при этом был зелёным: проверка вернула код пропуска.
 *
 * Смотрятся обе стороны — незакоммиченное в рабочем дереве и вклад ветки от главной. Одного
 * вклада мало: правка, ещё не попавшая в коммит, уходит тем же пушем следом.
 *
 * ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет git, нет главной ветки, вызов упал — считается, что не тронула.
 * Проверка, отбивающая пуш по своей слепоте, хуже пропуска: чинить в ней нечего.
 */
function touchedStorage() {
    const paths = [CONFIG.schemaFile, CONFIG.migrationsDir].filter(Boolean);
    if (!paths.length) {
        return false;
    }

    const git = (args) => {
        const out = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });

        return out.status === 0 ? (out.stdout ?? '') : '';
    };

    // Главная ветка берётся удалённой ссылкой: локальная — снимок последнего подтягивания, и
    // вклад, посчитанный от неё, врёт ровно в ту сторону, где проверка молчит.
    const main = CONFIG.mainBranch ?? 'main';
    const base = [`origin/${main}`, main].find((ref) => git(['rev-parse', '--verify', '--quiet', ref]).trim()) ?? '';

    const changed = [git(['status', '--porcelain']), base ? git(['diff', '--name-only', `${base}...HEAD`]) : ''].join('\n');

    return paths.some((one) => changed.split('\n').some((line) => line.includes(one)));
}

function prisma(args, url) {
    return spawnSync('npx', ['prisma', ...args], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: url },
    });
}

async function withServiceClient(serviceUrl, run) {
    // Клиент базы подтягивается на месте, а не импортом сверху: дерево без хранилища этого
    // пакета в зависимостях не держит, и статический импорт ронял бы проверку до того, как она
    // успеет сказать, что сверять здесь нечего.
    const pg = (await import('pg')).default;
    const client = new pg.Client({ connectionString: serviceUrl });
    try {
        await client.connect();
    } catch (error) {
        // Погашенный докер — обычное состояние машины, а не повод не дать запушить
        // документацию.
        if (SERVER_DOWN_CODES.includes(error?.code)) {
            return unavailable('база недоступна');
        }
        throw error;
    }

    try {
        return await run(client);
    } finally {
        await client.end();
    }
}

/**
 * Ответ на «проверять негде»: пропуск либо отказ — смотря тронула ли ветка хранилище.
 *
 * Отказ называет, чем поднять базу. Сказанное только «негде» исполнитель читает как разрешение:
 * поднимать её он не обязан, а гейт зелёный.
 */
function unavailable(why) {
    if (!touchedStorage()) {
        console.log(`check-schema-drift: ${why} — сверять негде`);

        return SKIP;
    }

    console.error(`check-schema-drift: ${why}, а ветка правила схему или миграции — сверять негде, но было чем\n`);
    console.error(
        'Цепочка миграций на пустом хранилище — единственное место, где виден их настоящий порядок:\n' +
            'метку времени ставит момент создания, и миграция из ветки, начатой раньше, встаёт перед той,\n' +
            'от которой зависит. На развёрнутом хранилище разработчика она ложится, на чистом падает — и\n' +
            'видно это в первый раз на выкатке.\n\n' +
            'Подними базу и повтори; когда её под рукой нет, цепочка гоняется на одноразовом контейнере —\n' +
            'готовые команды в паттерне `git-workflow-migration`.'
    );

    return 1;
}

async function main() {
    // Незаданное имя спрашивается отдельно от несуществующего файла. Склеенное с корнем, пустое
    // имя даёт сам корень — а он есть всегда, и проверка шла дальше, будто схема на месте.
    // Дерево без хранилища так и говорит: имени нет, сверять нечего.
    if (!CONFIG.schemaFile) {
        console.log('check-schema-drift: имя файла схемы не задано — сверять нечего');

        return SKIP;
    }

    if (!existsSync(join(ROOT, CONFIG.schemaFile))) {
        console.log('check-schema-drift: схемы нет — сверять нечего');

        return SKIP;
    }

    const url = databaseUrl();
    if (!url) {
        return unavailable('адрес базы не задан');
    }

    if (PRODUCTION_MARKS.some((mark) => url.includes(mark))) {
        console.log('check-schema-drift: адрес боевой — проверка туда не ходит');

        return SKIP;
    }

    const { shadowName, shadowUrl, serviceUrl } = shadowAddresses(url);

    return withServiceClient(serviceUrl, async (client) => {
        // Идентификатор в кавычках: имя базы выведено из адреса, а не из текста запроса
        const quoted = `"${shadowName.replace(/"/g, '""')}"`;
        await client.query(`DROP DATABASE IF EXISTS ${quoted}`);

        try {
            // Базу заводит сам `migrate deploy`: своей команды создания не нужно
            const deploy = prisma(['migrate', 'deploy'], shadowUrl);
            if (deploy.status !== 0) {
                console.error('check-schema-drift: миграции не накатываются на чистую базу\n');
                console.error(`${deploy.stdout ?? ''}${deploy.stderr ?? ''}`);

                return 1;
            }

            // `--exit-code`: 0 — расхождений нет, 2 — есть, прочее — сбой самой команды
            const diff = prisma(
                ['migrate', 'diff', '--from-config-datasource', '--to-schema', CONFIG.schemaFile, '--exit-code'],
                shadowUrl
            );
            if (diff.status === 2) {
                console.error('check-schema-drift: миграции и схема описывают разные базы\n');
                console.error(`${diff.stdout ?? ''}${diff.stderr ?? ''}`);
                console.error(
                    '\nЛибо схема правлена без миграции, либо миграция создаёт то, чего схема не объявляет.\nКак писать миграцию — паттерн `git-workflow-migration`.'
                );

                return 1;
            }
            if (diff.status !== 0) {
                // Ни «сошлось», ни «разошлось» — сама команда сравнения не отработала. Пропуск
                // здесь неотличим от сошедшихся миграций, и именно им проверка молчала о пустом
                // имени схемы: с ним она звала сравнение без обязательного довода, а отказ
                // читался зелёным гейтом.
                console.error('check-schema-drift: сравнение не отработало\n');
                console.error(`${diff.stdout ?? ''}${diff.stderr ?? ''}`);

                return 1;
            }

            console.log('check-schema-drift: миграции и схема сошлись');

            return 0;
        } finally {
            await client.query(`DROP DATABASE IF EXISTS ${quoted}`);
        }
    });
}

main().then(
    (code) => process.exit(code),
    (error) => {
        // Сломанная обвязка — не пропуск, а отказ. «Проверять негде» проверка говорит сама и
        // раньше: нет схемы, нет адреса, адрес боевой, сервер не отвечает — всё это законные
        // выходы нулём, и каждый назван своей строкой. Сюда доходит то, чего она не предвидела,
        // и молчаливый ноль здесь означает «гейт зелен, потому что сверять не получилось».
        // Отличить его от «сверено и сошлось» нечем: за таким нулём проверка простояла
        // выключенной, пока её не позвали руками.
        console.error(`check-schema-drift: проверка не отработала — ${error?.message ?? error}\n`);
        console.error(
            'Это отказ самой проверки, а не расхождение схемы. Почини обвязку: недостающий пакет ставится в корень,\n' +
                'пустое имя схемы или каталога миграций задаётся в настройке проверок дерева.'
        );
        process.exit(1);
    }
);
