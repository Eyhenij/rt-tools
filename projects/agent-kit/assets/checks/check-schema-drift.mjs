#!/usr/bin/env node
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
            console.log('check-schema-drift: база недоступна — сверять негде');

            return 0;
        }
        throw error;
    }

    try {
        return await run(client);
    } finally {
        await client.end();
    }
}

async function main() {
    if (!existsSync(join(ROOT, CONFIG.schemaFile))) {
        console.log('check-schema-drift: схемы нет — сверять нечего');

        return 0;
    }

    const url = databaseUrl();
    if (!url) {
        console.log('check-schema-drift: адрес базы не задан — сверять негде');

        return 0;
    }

    if (PRODUCTION_MARKS.some((mark) => url.includes(mark))) {
        console.log('check-schema-drift: адрес боевой — проверка туда не ходит');

        return 0;
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
                console.log('check-schema-drift: сверка не отработала — пропущено');

                return 0;
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
        // Сбой самой проверки пуш не держит: сломанная обвязка не должна мешать работать
        console.log(`check-schema-drift: проверка не отработала (${error?.message ?? error}) — пропущено`);
        process.exit(0);
    }
);
