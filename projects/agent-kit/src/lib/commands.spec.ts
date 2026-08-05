/**
 * Сквозные сценарии команд на одноразовом дереве.
 *
 * Чистые модули проверены поштучно, но раскладку решает их порядок: подстановка после слияния,
 * отказ раньше первой записи, шапка поверх готового тела. Первый живой прогон нашёл ровно то,
 * чего поштучные спеки увидеть не могли, — путь до собственных ресурсов, который в собранном
 * пакете иной, чем в исходниках.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { doctor, IEnvironment, init, IOutcomeOfCommand, list, sync } from './commands.js';
import { CONFIG_PATH, OVERRIDES_DIR } from './config.js';

const VERSION: string = '0.1.0';
const LAW: string = 'docs/constitution/delivery.md';
const OTHER_LAW: string = 'docs/constitution/access.md';
const TEMPLATE: string = '.claude/rt-kit/templates/rule.md';
/** Ресурсы берутся из дерева пакета: спека проверяет раскладку, а не выдуманный набор. */
const ASSETS: string = join(__dirname, '..', '..', 'assets');

let root: string;
let env: IEnvironment;

const put: (path: string, text: string) => void = (path: string, text: string): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text, 'utf8');
};
const get: (path: string) => string = (path: string): string => readFileSync(join(root, path), 'utf8');
const said: (outcome: IOutcomeOfCommand) => string = (outcome: IOutcomeOfCommand): string => outcome.lines.join('\n');

beforeEach((): void => {
    root = mkdtempSync(join(tmpdir(), 'agent-kit-'));
    env = { root, version: VERSION, assetsDir: ASSETS };
});

afterEach((): void => {
    rmSync(root, { recursive: true, force: true });
});

describe('init', () => {
    it('заводит конфиг и каталог надстроек', () => {
        expect(init(root).code).toBe(0);
        expect(JSON.parse(get(CONFIG_PATH))).toMatchObject({ vars: {}, only: [], skip: [] });
    });

    it('без выбора берётся всё, что везёт пакет', () => {
        expect(said(init(root))).toContain('выбрано всё');
    });

    it('выбор уезжает в конфиг и называется числом', () => {
        expect(said(init(root, ['laws/delivery.md', 'laws/access.md']))).toContain('выбрано ресурсов: 2');
        expect(JSON.parse(get(CONFIG_PATH)).only).toEqual(['laws/delivery.md', 'laws/access.md']);
    });

    it('заведённый конфиг не переписывает', () => {
        init(root);
        put(CONFIG_PATH, '{"vars":{"своё":"да"}}');

        expect(said(init(root))).toContain('уже есть');
        expect(get(CONFIG_PATH)).toContain('своё');
    });
});

describe('sync', () => {
    it('без конфига не начинается и говорит, с чего начать', () => {
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('agent-kit init');
    });

    it('раскладывает законы и ставит шапку с версией', () => {
        init(root);

        expect(sync(env, false).code).toBe(0);
        expect(get(LAW)).toContain(`rt-kit v${VERSION}`);
        expect(get(LAW)).toContain('## Статьи');
    });

    it('повторный прогон ничего не переписывает', () => {
        init(root);
        sync(env, false);

        expect(said(sync(env, false))).toContain('всё уже разложено');
    });

    it('дырка без значения отказывает и не пишет ни одного файла', () => {
        put(CONFIG_PATH, JSON.stringify({ vars: {}, layout: { templates: 'шаблоны' } }));
        // Умолчания дают значение для `lawsDir`, поэтому дырка заводится своя.
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Статьи\n\nВетка {{mainBranch}}.\n');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('{{mainBranch}}');
        expect((): string => get(LAW)).toThrow();
    });

    it('правку руками не переписывает, а называет', () => {
        init(root);
        sync(env, false);
        writeFileSync(join(root, LAW), `${get(LAW)}\nдописано руками\n`, 'utf8');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('правлен руками');
        expect(get(LAW)).toContain('дописано руками');
    });

    it('чужой файл на своём пути не трогает', () => {
        init(root);
        put(LAW, 'своё, положено не пакетом\n');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(get(LAW)).toBe('своё, положено не пакетом\n');
    });

    it('надстройка дописывает свой раздел и снимает пустой', () => {
        init(root);
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Решения\n\nРешили здесь.\n\n## Открытые вопросы\n');
        sync(env, false);

        expect(get(LAW)).toContain('## Решения');
        expect(get(LAW)).not.toContain('## Открытые вопросы');
    });

    it('ресурс из `skip` не раскладывается вовсе', () => {
        put(CONFIG_PATH, JSON.stringify({ skip: ['laws/delivery.md'] }));
        sync(env, false);

        expect((): string => get(LAW)).toThrow();
    });

    it('невыбранный закон не раскладывается', () => {
        init(root, ['laws/delivery.md']);
        sync(env, false);

        expect(get(LAW)).toContain('rt-kit');
        expect((): string => get(OTHER_LAW)).toThrow();
    });

    it('выбор законов шаблоны при себе оставляет', () => {
        init(root, ['laws/delivery.md']);
        sync(env, false);

        expect(get(TEMPLATE)).toContain('rt-kit');
    });

    it('`skip` вычитает из выбранного', () => {
        put(CONFIG_PATH, JSON.stringify({ only: ['laws/delivery.md'], skip: ['laws/delivery.md'] }));
        sync(env, false);

        expect((): string => get(LAW)).toThrow();
    });
});

describe('sync --check', () => {
    it('на разложенном молчит и пропускает', () => {
        init(root);
        sync(env, false);

        expect(sync(env, true).code).toBe(0);
    });

    it('ничего не пишет и отказывает, пока не разложено', () => {
        init(root);
        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(1);
        expect((): string => get(LAW)).toThrow();
    });

    it('видит правку руками', () => {
        init(root);
        sync(env, false);
        writeFileSync(join(root, LAW), `${get(LAW)}\nдописано руками\n`, 'utf8');

        expect(said(sync(env, true))).toContain('правлен руками');
    });

    it('видит новую версию пакета', () => {
        init(root);
        sync(env, false);

        expect(sync({ ...env, version: '0.2.0' }, true).code).toBe(1);
    });
});

describe('doctor', () => {
    it('рассказывает о состоянии и не меняет дерева', () => {
        init(root);
        const outcome: IOutcomeOfCommand = doctor(env);

        expect(outcome.code).toBe(0);
        expect((): string => get(LAW)).toThrow();
    });

    it('о неразложенном говорит в настоящем времени: он ничего не писал', () => {
        init(root);
        const outcome: IOutcomeOfCommand = doctor(env);

        expect(said(outcome)).toContain('нет в дереве');
        expect(said(outcome)).not.toContain('положен:');
    });

    it('считает невыбранное', () => {
        init(root, ['laws/delivery.md']);

        expect(said(doctor(env))).toContain('не выбрано: 14');
    });
});

describe('list', () => {
    it('работает без конфига: выбирать надо раньше, чем он заведён', () => {
        const outcome: IOutcomeOfCommand = list(env);

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('ещё не заведён');
        expect(said(outcome)).toContain('ЗАКОНЫ');
        expect(said(outcome)).toContain('delivery');
    });

    it('называет заголовок закона: по именам выбирать нечем', () => {
        expect(said(list(env))).toContain('Поставка');
    });

    it('различает выбранное, невыбранное и пропущенное', () => {
        put(CONFIG_PATH, JSON.stringify({ only: ['laws/delivery.md', 'laws/access.md'], skip: ['laws/access.md'] }));
        const lines: readonly string[] = list(env).lines;
        const lineOf: (name: string) => string = (name: string): string =>
            lines.find((line: string): boolean => line.trim().startsWith(name)) ?? '';

        expect(lineOf('delivery')).toContain('нет в дереве');
        expect(lineOf('access')).toContain('пропущен');
        expect(lineOf('verifiability')).toContain('не выбран');
    });

    it('после раскладки говорит, что файл на месте', () => {
        init(root);
        sync(env, false);

        expect(list(env).lines.find((line: string): boolean => line.trim().startsWith('delivery'))).toContain('на месте');
    });

    it('шаблоны показывает своим разделом', () => {
        expect(said(list(env))).toContain('ШАБЛОНЫ');
    });
});
