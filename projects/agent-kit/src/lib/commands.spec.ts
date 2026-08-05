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

import { doctor, IEnvironment, init, IOutcomeOfCommand, sync } from './commands.js';
import { CONFIG_PATH, OVERRIDES_DIR } from './config.js';

const VERSION: string = '0.1.0';
const LAW: string = 'docs/constitution/delivery.md';
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
        expect(JSON.parse(get(CONFIG_PATH))).toMatchObject({ vars: {}, skip: [] });
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
        expect(said(outcome)).toContain('положен');
        expect((): string => get(LAW)).toThrow();
    });
});
