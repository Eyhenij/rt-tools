#!/usr/bin/env node
/**
 * Настройки проверок: что считать исходниками, куда не ходить и где лежат списки долгов.
 *
 * Проверки везёт пакет, а корни и имена — своё у каждого дерева: где-то `apps` и `libs`,
 * где-то `projects`. Держать их в каждом скрипте отдельно значило бы править девять файлов
 * ради одного переименования, и девятый забывался бы молча.
 *
 * Умолчания здесь, надстройка — `.claude/rt-kit/checks.json` в дереве проекта. Нет файла —
 * действуют умолчания; есть — его ключи ложатся поверх, по одному, а не целиком: проект,
 * назвавший только корни, не теряет список пропускаемых каталогов.
 *
 * Слияние одноуровневое: вложенный объект замещается целиком. Дерево, назвавшее один ключ
 * борды, теряет остальные — и увидит это отказом «нет токена бота», то есть как неполадку
 * машины, а не как неполный конфиг. Вложенный раздел заполняется целиком либо не заводится.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Корень дерева: проверки лежат в его `tools/`, поэтому на уровень выше. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CONFIG_PATH = '.claude/rt-kit/checks.json';

const DEFAULTS = {
    /** Где лежит код, который проверки читают. */
    sourceRoots: ['apps', 'libs'],
    /** Куда не ходить никогда: сборка, зависимости, порождённое. */
    skippedDirs: ['node_modules', 'dist', '.git', '.nx', 'tmp', 'coverage', 'worktrees', 'gen', 'generated'],
    /** Где лежат тексты проекта. */
    docsDir: 'docs',
    /** Отложенное: про него проверки молчат — оно описывает прошлое, а не дерево. */
    archiveDir: 'docs/archive/',
    /** Где лежат спеки доменов; пусто — их в дереве нет, и сверка спеков не запускается. */
    specsDir: 'docs/specs',
    tasksDir: 'docs/tasks',
    /** Куда сложены списки принятых долгов. */
    allowlistDir: 'tools',
    /** Корни сквозных тестов; пусто — их в дереве нет. */
    e2eRoots: ['apps/site-e2e', 'apps/admin-e2e'],
    /** Корни бэкенда: у него нет ни компонентов, ни шаблонов, и часть признаков к нему не применяется. */
    backendRoots: ['libs/api/', 'apps/api/'],
    /** Схема хранилища и её миграции; пусто — хранилища в дереве нет. */
    schemaFile: 'prisma/schema.prisma',
    migrationsDir: 'prisma/migrations',
    /** Семьи фронтовых либ: `libs/<семья>/<домен>/<слой>`. */
    families: ['site', 'admin'],
    /** Область алиасов импорта: `@область/<семья>/<домен>/<слой>` в `tsconfig.base.json`. */
    importScope: '@app',
    /**
     * Признаки боевого хранилища: порт, адрес, имя домена. Проверки туда не ходят ни читать,
     * ни писать — схема на проде меняется выкаткой. Пусто — признаков нет, и адрес боевым
     * не считается никогда.
     */
    productionMarks: [],
    /** Очередь работ: владелец, репозиторий, борда и учётная запись машинной работы. */
    board: {
        owner: '',
        repo: '',
        projectId: '',
        /** Ключ задач: даёт ветку `<ключ>-<номер>-<slug>` и заголовок `[<ключ>-<номер>]`. */
        taskKey: '',
        bot: '',
        tokenPath: '',
        reviewer: '',
    },
};

function readOverrides() {
    const path = join(ROOT, CONFIG_PATH);
    if (!existsSync(path)) {
        return {};
    }
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        console.error(`${CONFIG_PATH} — не разбирается как JSON: ${error.message}`);
        process.exit(1);
    }
}

/** Настройки этого дерева: умолчания пакета, поверх них — то, что назвал проект. */
export const CONFIG = { ...DEFAULTS, ...readOverrides() };

/** Путь к списку принятых долгов по имени проверки: `dupes` → `tools/dupes-allowlist.json`. */
export const allowlistOf = (name) => join(CONFIG.allowlistDir, `${name}-allowlist.json`);

/**
 * Список долгов; нет файла — пустой. Заводить его руками не требуется: проверка, встреченная
 * впервые, покажет всё найденное как новое, и это честнее, чем молчать из-за отсутствия файла.
 */
export const readAllowlist = (name) => {
    const path = join(ROOT, allowlistOf(name));

    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
};

/** Есть ли в дереве то, без чего проверке нечего делать. Нет — она выходит с нулём и говорит это. */
export const skipUnless = (present, what) => {
    if (present) {
        return false;
    }
    console.log(`пропущено: в дереве нет ${what}`);
    process.exit(0);
};
