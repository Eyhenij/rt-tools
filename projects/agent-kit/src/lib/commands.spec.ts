/* eslint-disable max-lines -- спека делится вслед за своим файлом, задача RT-849 */
/**
 * Сквозные сценарии команд на одноразовом дереве.
 *
 * Чистые модули проверены поштучно, но раскладку решает их порядок: подстановка после слияния,
 * отказ раньше первой записи, шапка поверх готового тела. Первый живой прогон нашёл ровно то,
 * чего поштучные спеки увидеть не могли, — путь до собственных ресурсов, который в собранном
 * пакете иной, чем в исходниках.
 */
import {
    accessSync,
    chmodSync,
    constants,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { adopt, doctor, IEnvironment, init, IOutcomeOfCommand, KEPT_SUFFIX, list, stats, sync } from './commands.js';
import { CONFIG_PATH, OVERRIDES_DIR } from './config.js';
import { DISPATCH_PATH } from './hooks-map.js';
import { OBSERVATIONS_DIR } from './observations.js';

const VERSION: string = '0.1.0';
/** Разложенный хук: право на запуск спрашивается у того, кого зовут командой. */
const HOOK: string = ['.claude', 'hooks', 'browser-device-id.sh'].join('/');
const LAW: string = 'docs/constitution/delivery.md';
const OTHER_LAW: string = 'docs/constitution/lists.md';
const TEMPLATE: string = '.claude/rt-kit/templates/rule.md';
const GLOSSARY: string = 'docs/GLOSSARY.md';
/** Закон с правилами при нём: им проверяется каскад — отказ от него уносит и правила, и паттерны. */
const VERIFIABILITY: string = 'laws/verifiability.md';
const TESTING: string = 'rules/testing.md';
const TESTING_SKILL: string = '.claude/skills/testing/SKILL.md';
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
/** Запускается ли файл. Спрашиваем систему, а не разбираем биты режима руками. */
const runnable: (path: string) => boolean = (path: string): boolean => {
    try {
        accessSync(path, constants.X_OK);

        return true;
    } catch {
        return false;
    }
};

/** Вид, объявленный пакетом. Без ответа по оси раскладка не начнётся — про это отдельный набор. */
const HOST: Readonly<Record<string, string>> = { host: 'github' };

/**
 * Значения дырок: порты стендов у каждого дерева свои, и пакет требует их назвать. Здесь они
 * выдуманные — набор проверяет раскладку, а не стенд.
 */
const PORTS: Readonly<Record<string, string>> = {
    sitePort: '4900',
    adminPort: '4901',
    apiPort: '3333',
    prodSitePort: '4930',
    prodApiPort: '3999',
    ssrPort: '4000',
    dockerSitePort: '8188',
    dockerAdminPort: '8189',
};

/** Заведение конфига так, как его заводит человек: с выбором законов, ответом по осям и значениями. */
const start: (only?: readonly string[]) => IOutcomeOfCommand = (only: readonly string[] = []): IOutcomeOfCommand => {
    const outcome: IOutcomeOfCommand = init(root, only, HOST);
    const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH));
    writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, vars: PORTS }, null, 4), 'utf8');

    return outcome;
};

/** Настройка человека плюс строки отказа: ими проверяется каскад на живом наборе. */
const startSkipping: (skip: readonly string[]) => void = (skip: readonly string[]): void => {
    start();
    const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH));
    writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, skip }, null, 4), 'utf8');
};

/** Заполнить черновики компаньонов так, как это делает проект: снять метки пустых мест. */
const fillCompanions: () => void = (): void => {
    const skills: string = join(root, '.claude/skills');
    for (const name of readdirSync(skills, { withFileTypes: true })) {
        const path: string = join(skills, name.name, 'implementation.md');
        if (existsSync(path)) {
            writeFileSync(path, `# ${name.name}\n\nВсё названо своими именами.\n`, 'utf8');
        }
    }
};

beforeEach((): void => {
    root = mkdtempSync(join(tmpdir(), 'agent-kit-'));
    env = { root, version: VERSION, assetsDir: ASSETS };
});

afterEach((): void => {
    rmSync(root, { recursive: true, force: true });
});

describe('init', () => {
    it('заводит конфиг и каталог надстроек', () => {
        expect(init(root, [], HOST).code).toBe(0);
        expect(JSON.parse(get(CONFIG_PATH))).toMatchObject({ vars: {}, only: [], skip: [] });
    });

    it('без выбора берётся всё, что везёт пакет', () => {
        expect(said(start())).toContain('выбрано всё');
    });

    it('выбор уезжает в конфиг и называется числом', () => {
        expect(said(start(['laws/delivery.md', 'laws/lists.md']))).toContain('выбрано ресурсов: 2');
        expect(JSON.parse(get(CONFIG_PATH)).only).toEqual(['laws/delivery.md', 'laws/lists.md']);
    });

    it('заведённый конфиг не переписывает', () => {
        init(root, [], HOST);
        put(CONFIG_PATH, '{"vars":{"своё":"да"}}');

        expect(said(init(root, [], HOST))).toContain('уже есть');
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
        start();

        expect(sync(env, false).code).toBe(0);
        expect(get(LAW)).toContain(`rt-kit v${VERSION}`);
        expect(get(LAW)).toContain('## Articles');
    });

    it('повторный прогон ничего не переписывает', () => {
        start();
        sync(env, false);

        expect(said(sync(env, false))).toContain('всё уже разложено');
    });

    // Хук без права на запуск лежит на месте и не зовётся вовсе, а снаружи выглядит
    // установленным: раскладка отчиталась, файл цел, слой гардов молчит.
    it('SC-AK-887 — снятое право на запуск раскладка возвращает', () => {
        start(['hooks/browser-device-id.sh']);
        sync(env, false);
        const hook: string = join(root, HOOK);
        const before: string = readFileSync(hook, 'utf8');
        chmodSync(hook, 0o644);

        expect(said(sync(env, false))).toContain(HOOK);
        expect(runnable(hook)).toBe(true);
        // Тело не переписано: чинилось право, а не текст.
        expect(readFileSync(hook, 'utf8')).toBe(before);
    });

    it('SC-AK-888 — сверка о снятом праве не молчит', () => {
        start(['hooks/browser-device-id.sh']);
        sync(env, false);
        chmodSync(join(root, HOOK), 0o644);
        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain(HOOK);
    });

    it('дырка без значения отказывает и не пишет ни одного файла', () => {
        put(CONFIG_PATH, JSON.stringify({ variants: HOST, vars: {}, layout: { templates: 'шаблоны' } }));
        // Умолчания дают значение для `lawsDir`, поэтому дырка заводится своя.
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Статьи\n\nВетка {{mainBranch}}.\n');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('{{mainBranch}}');
        expect((): string => get(LAW)).toThrow();
    });

    // Строка долга считала статьи пакетной редакции против компаньона дерева, а дерево эти
    // разделы замещает надстройкой: в разложенном правиле таких статей нет, и привязывать
    // нечего — долг при этом рос при каждой раскладке.
    it('SC-AK-731 — статьи раздела, замещённого надстройкой, в долг не идут', () => {
        start([VERIFIABILITY]);
        sync(env, false);
        // Компаньон дерева пуст: черновик пакета несёт все статьи в таблице, и долга при нём нет
        // вовсе — а считается здесь именно долг.
        put('.claude/skills/testing/implementation.md', '# testing — что здесь своё\n\n## Где исполняются статьи\n');
        const packaged: string = said(sync(env, false));

        put(join(OVERRIDES_DIR, TESTING), '## How the law applies here\n\n- **Своя статья дерева.** Текст.\n');
        const merged: string = said(sync(env, false));

        expect(packaged).toContain('статей без адреса');
        expect(packaged).not.toContain('статей без адреса: 1 ');
        expect(merged).toContain('статей без адреса: 1 ');
    });

    // Надстройка, чьё имя не совпало с идентификатором ресурса, не применяется ни к чему, а
    // сверка на это слепа: она сравнивает разложенное с тем, что собирает сама.
    it('SC-AK-730 — надстройка, не подобранная ни к одному ресурсу, называется', () => {
        start();
        sync(env, false);
        put(join(OVERRIDES_DIR, 'rules/такого-правила-нет.md'), '## Свой раздел\n\nтекст\n');
        const said_: string = said(sync(env, true));

        expect(said_).toContain('надстроек, не подобранных ни к одному ресурсу: 1');
        expect(said_).toContain('rules/такого-правила-нет.md');
        expect(said_).toContain('применена не была');
    });

    // Рядом с надстройками законно лежит README каталога: звать его неприменённым значило бы
    // шуметь на каждой раскладке.
    it('SC-AK-730 — файл вне рода ресурсов надстройкой не считается', () => {
        start();
        sync(env, false);
        put(join(OVERRIDES_DIR, 'README.md'), '# Надстройки\n');

        expect(said(sync(env, true))).not.toContain('не подобранных');
    });

    it('правку руками не переписывает, а называет', () => {
        start();
        sync(env, false);
        writeFileSync(join(root, LAW), `${get(LAW)}\nдописано руками\n`, 'utf8');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('правлен руками');
        expect(get(LAW)).toContain('дописано руками');
    });

    it('чужой файл на своём пути не трогает', () => {
        start();
        put(LAW, 'своё, положено не пакетом\n');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(1);
        expect(get(LAW)).toBe('своё, положено не пакетом\n');
    });

    it('SC-AK-33 — словарь приезжает в дерево раскладкой', () => {
        start();
        sync(env, false);

        expect(get(GLOSSARY)).toContain(`rt-kit v${VERSION}`);
        expect(get(GLOSSARY)).toContain('## Rules layer');
    });

    it('SC-AK-34 — предметные разделы словаря дописываются надстройкой', () => {
        start();
        put(join(OVERRIDES_DIR, 'docs/GLOSSARY.md'), '## Своё слово\n\nЗначит вот это.\n');
        sync(env, false);

        expect(get(GLOSSARY)).toContain('## Rules layer');
        expect(get(GLOSSARY)).toContain('## Своё слово');
    });

    it('надстройка дописывает свой раздел и снимает пустой', () => {
        start();
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Решения\n\nРешили здесь.\n\n## Открытые вопросы\n');
        sync(env, false);

        expect(get(LAW)).toContain('## Решения');
        expect(get(LAW)).not.toContain('## Открытые вопросы');
    });

    it('ресурс из `skip` не раскладывается вовсе', () => {
        put(CONFIG_PATH, JSON.stringify({ variants: HOST, skip: ['laws/delivery.md'] }));
        sync(env, false);

        expect((): string => get(LAW)).toThrow();
    });

    it('невыбранный закон не раскладывается', () => {
        start(['laws/delivery.md']);
        sync(env, false);

        expect(get(LAW)).toContain('rt-kit');
        expect((): string => get(OTHER_LAW)).toThrow();
    });

    it('выбор законов шаблоны при себе оставляет', () => {
        start(['laws/delivery.md']);
        sync(env, false);

        expect(get(TEMPLATE)).toContain('rt-kit');
    });

    it('SC-AK-123 — предупреждение о лишней строке раскладку не отбивает', () => {
        startSkipping([VERIFIABILITY, TESTING]);
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('строк отказа, которые ничего не снимают');
        expect(said(outcome)).toContain(`${TESTING} — снято отказом от verifiability`);
    });

    it('SC-AK-134 — выбор, который после каскада ничего не берёт, называется вслух', () => {
        start(['laws/delivery.md', TESTING]);
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('названо выбором, но не приедет');
        expect(said(outcome)).toContain(`${TESTING} — снято вслед за verifiability`);
        expect((): string => get(TESTING_SKILL)).toThrow();
    });

    it('SC-AK-137 — ушедшее из набора называется по списку снятого', () => {
        start();
        sync(env, false);
        // Файл прошлой редакции: тело с шапкой пакета берётся у разложенного правила — снятого
        // ресурса в наборе нет, и положить его раскладкой уже нечем.
        put('.claude/skills/pricing/SKILL.md', get(TESTING_SKILL));
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(said(outcome)).toContain('которых в пакете больше нет');
        expect(said(outcome)).toContain('.claude/skills/pricing/SKILL.md — снят в v0.7.0');
    });

    it('SC-AK-138 — снятое каскадом на диске называется отдельно от брошенного', () => {
        start();
        sync(env, false);
        const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH));
        writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, skip: [VERIFIABILITY] }, null, 4), 'utf8');
        const outcome: IOutcomeOfCommand = sync(env, false);

        expect(said(outcome)).toContain('лежит от ресурсов, снятых вслед за родителем');
        expect(said(outcome)).toContain(`${TESTING_SKILL} — снят вслед за verifiability`);
        expect(said(outcome)).not.toContain(`лежит от ресурсов, которые больше не берутся: ${TESTING_SKILL}`);
    });

    it('`skip` вычитает из выбранного', () => {
        put(CONFIG_PATH, JSON.stringify({ variants: HOST, only: ['laws/delivery.md'], skip: ['laws/delivery.md'] }));
        sync(env, false);

        expect((): string => get(LAW)).toThrow();
    });
});

describe('sync — расхождение редакций', () => {
    /** Дерево объявляет пакет своей зависимостью — тем именем, каким он зовётся сам. */
    const declares: (asked: string, where?: string) => void = (asked: string, where: string = 'devDependencies'): void => {
        put('package.json', JSON.stringify({ name: 'дерево', [where]: { '@rt-tools/probe-kit': asked } }));
    };

    it('SC-AK-798 — раскладка отказывает и называет обе редакции', () => {
        start();
        declares('0.9.0');
        const outcome: IOutcomeOfCommand = sync({ ...env, name: '@rt-tools/probe-kit' }, false);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('объявлено деревом: 0.9.0');
        expect(said(outcome)).toContain(`установлено:       ${VERSION}`);
    });

    it('SC-AK-798 — сверка отказывает тем же', () => {
        start();
        declares('0.9.0');

        expect(sync({ ...env, name: '@rt-tools/probe-kit' }, true).code).toBe(1);
    });

    it('SC-AK-798 — совпавшая редакция раскладку пропускает', () => {
        start();
        declares(VERSION);

        expect(sync({ ...env, name: '@rt-tools/probe-kit' }, false).code).toBe(0);
    });

    it('SC-AK-798 — редакция из обычных зависимостей судится так же', () => {
        start();
        declares('0.9.0', 'dependencies');

        expect(sync({ ...env, name: '@rt-tools/probe-kit' }, false).code).toBe(1);
    });

    it('SC-AK-799 — диапазон отказа не даёт', () => {
        start();
        declares('^0.9.0');

        expect(sync({ ...env, name: '@rt-tools/probe-kit' }, false).code).toBe(0);
    });

    it('SC-AK-799 — дерево, не объявившее пакет, раскладку получает', () => {
        start();
        put('package.json', JSON.stringify({ name: 'дерево' }));

        expect(sync({ ...env, name: '@rt-tools/probe-kit' }, false).code).toBe(0);
    });

    it('SC-AK-799 — пакет, не назвавший себя, не судится вовсе', () => {
        start();
        declares('0.9.0');

        expect(sync(env, false).code).toBe(0);
    });
});

describe('sync --check', () => {
    it('на разложенном и заполненном молчит и пропускает', () => {
        start();
        sync(env, false);
        // Разложенного мало: у каждого правила рядом встаёт черновик компаньона, и до
        // заполнения проектом он сам по себе расхождение — набор про это ниже.
        fillCompanions();

        expect(sync(env, true).code).toBe(0);
    });

    // Расхождение говорит, что разложенное разошлось с редакцией; дырка без значения — что
    // дерево ещё не описало своего. Один код возврата на оба состояния ставит дерево перед
    // выбором между красным гейтом пуша и выдуманными числами в настройке.
    it('SC-AK-854 — незаполненная дырка расхождением не считается и названа отдельно', () => {
        start();
        sync(env, false);
        fillCompanions();
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Статьи\n\nВетка {{mainBranch}}.\n');

        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('дерево ещё не описало своего');
        expect(said(outcome)).toContain('{{mainBranch}}');
    });

    it('SC-AK-05 — разложенный гард доезжает до настройки агента', () => {
        start();
        const laid: IOutcomeOfCommand = sync(env, false);
        fillCompanions();

        // Запись кладёт сама раскладка: гард, которого не зовёт никто, снаружи неотличим от
        // работающего, и прежде она печатала кусок и просила вставить его рукой.
        expect(said(laid)).toContain('.claude/settings.json');
        expect(get('.claude/settings.json')).toContain(`${DISPATCH_PATH} PreToolUse`);
        expect(sync(env, true).code).toBe(0);
    });

    it('ничего не пишет и отказывает, пока не разложено', () => {
        start();
        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(1);
        expect((): string => get(LAW)).toThrow();
    });

    it('SC-AK-08 — расхождение тела при совпавшей шапке видно `doctor`', () => {
        start();
        sync(env, false);
        writeFileSync(join(root, LAW), `${get(LAW)}\nдописано руками\n`, 'utf8');

        expect(said(sync(env, true))).toContain('правлен руками');
    });

    it('видит новую версию пакета', () => {
        start();
        sync(env, false);

        expect(sync({ ...env, version: '0.2.0' }, true).code).toBe(1);
    });
});

describe('правило и его компаньон', () => {
    const RULE: string = '.claude/skills/testing/SKILL.md';
    const COMPANION: string = '.claude/skills/testing/implementation.md';
    const FILLED: string = '# testing\n\nВсё названо своими именами.\n';

    it('правило ложится каталогом по имени: другого имени скил не находит', () => {
        start(['rules/testing.md']);
        sync(env, false);

        expect(get(RULE)).toContain('name: testing');
    });

    it('шапка встаёт после вступления, иначе скил теряет имя и описание', () => {
        start(['rules/testing.md']);
        sync(env, false);
        const lines: readonly string[] = get(RULE).split('\n');

        expect(lines[0]).toBe('---');
        expect(lines.findIndex((line: string): boolean => line.includes('rt-kit v'))).toBeGreaterThan(1);
    });

    it('черновик компаньона кладётся рядом с правилом', () => {
        start(['rules/testing.md']);
        sync(env, false);

        expect(get(COMPANION)).toContain('заполняет проект');
    });

    it('заполненного компаньона раскладка не трогает', () => {
        start(['rules/testing.md']);
        sync(env, false);
        writeFileSync(join(root, COMPANION), FILLED, 'utf8');
        sync(env, false);

        expect(get(COMPANION)).toBe(FILLED);
    });

    it('пока компаньон черновик, гейт отказывает: правилу нечего назвать', () => {
        start(['rules/testing.md']);
        sync(env, false);
        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('остался черновиком');
    });

    it('пропавшего компаньона гейт называет отдельно от черновика', () => {
        start(['rules/testing.md']);
        sync(env, false);
        rmSync(join(root, COMPANION));

        expect(said(sync(env, true))).toContain('пропал');
    });

    it('с заполненным компаньоном гейт проходит', () => {
        start(['rules/testing.md']);
        sync(env, false);
        writeFileSync(join(root, COMPANION), FILLED, 'utf8');

        expect(sync(env, true).code).toBe(0);
    });
});

describe('adopt', () => {
    // Пока команды не было, чужой файл на пути пакета снимался только руками, и один такой файл
    // останавливал раскладку целиком: установка в живое дерево сводилась к ручной работе.
    it('SC-AK-06 — чужой файл переходит в управление пакетом командой', () => {
        start();
        put(LAW, 'своё, положено не пакетом\n');

        expect(sync(env, false).code).toBe(1);
        expect(adopt(env, []).code).toBe(0);
        expect(get(`${LAW}${KEPT_SUFFIX}`)).toBe('своё, положено не пакетом\n');
        expect(sync(env, false).code).toBe(0);
        expect(get(LAW)).toContain(`rt-kit v${VERSION}`);
    });

    it('берёт названный файл, остальных не трогает', () => {
        start();
        put(LAW, 'своё\n');
        put(OTHER_LAW, 'тоже своё\n');
        adopt(env, ['delivery.md']);

        expect(existsSync(join(root, `${LAW}${KEPT_SUFFIX}`))).toBe(true);
        expect(get(OTHER_LAW)).toBe('тоже своё\n');
    });

    // Отложенное прежнее содержимое стирать нельзя: во второй раз в дереве больше нет ни того ни
    // другого, и разбирать станет нечего.
    it('второй раз поверх отложенного не пишет', () => {
        start();
        put(LAW, 'первое\n');
        adopt(env, []);
        sync(env, false);
        put(LAW, 'второе\n');
        const outcome: IOutcomeOfCommand = adopt(env, []);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('уже лежит');
        expect(get(`${LAW}${KEPT_SUFFIX}`)).toBe('первое\n');
    });

    it('чужих файлов нет — говорит это и ничего не делает', () => {
        start();

        expect(said(adopt(env, []))).toContain('чужих файлов на путях пакета нет');
    });

    it('имя, которому ничего не отвечает, — отказ со списком чужих', () => {
        start();
        put(LAW, 'своё\n');
        const outcome: IOutcomeOfCommand = adopt(env, ['такого-нет.md']);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain(LAW);
    });
});

describe('doctor', () => {
    it('рассказывает о состоянии и не меняет дерева', () => {
        start();
        const outcome: IOutcomeOfCommand = doctor(env);

        expect(outcome.code).toBe(0);
        expect((): string => get(LAW)).toThrow();
    });

    it('SC-AK-821 — разбор состояния печатает итоговый набор перед пушем', () => {
        start();
        // Набор собирается из двух файлов, и прочитать сборку было нечем: дерево, пишущее
        // надстройку, не видело умолчания и дописывало в него повтор.
        put(
            '.claude/rt-kit/defaults/project.sh',
            'rt_push_checks_default() { printf "%s\\n" "npm run lint"; }\nrt_push_checks() { rt_push_checks_default "$@"; }\n'
        );

        const said_: string = said(doctor(env));

        expect(said_).toContain('набор перед пушем: 1');
        expect(said_).toContain('  npm run lint');
    });

    it('SC-AK-821 — что умолчание печатало, а в набор не попало, названо отдельно', () => {
        start();
        // Строка выглядела настройкой, а была снятием охраны — и со стороны это неотличимо от
        // проверки, которой в умолчании нет вовсе.
        put(
            '.claude/rt-kit/defaults/project.sh',
            'rt_push_checks_default() { printf "%s\\n" "npm run lint" "node tools/check-reuse.mjs"; }\nrt_push_checks() { rt_push_checks_default "$@"; }\n'
        );
        put('.claude/rt-kit/project.sh', 'rt_push_checks() { rt_push_checks_default "$@" | grep -v check-reuse; }\n');

        const said_: string = said(doctor(env));

        expect(said_).toContain('умолчание печатало, а в наборе нет: 1');
        expect(said_).toContain('  node tools/check-reuse.mjs');
    });

    it('SC-AK-821 — без профиля дерева раздел называет причину, а не молчит', () => {
        start();

        expect(said(doctor(env))).toContain('набор перед пушем: собрать не удалось');
    });

    it('о неразложенном говорит в настоящем времени: он ничего не писал', () => {
        start();
        const outcome: IOutcomeOfCommand = doctor(env);

        expect(said(outcome)).toContain('нет в дереве');
        expect(said(outcome)).not.toContain('положен:');
    });

    it('SC-AK-716 — разбор состояния называет разделы, замещённые надстройками', () => {
        start(['laws/delivery.md']);
        // Совпавший заголовок замещает раздел целиком: всё, что пакет допишет в него новой
        // версией, пропадёт молча, и других свидетелей у потери не бывает.
        put(join(OVERRIDES_DIR, 'laws/delivery.md'), '## Articles\n\nСвои статьи.\n');

        const said_: string = said(doctor(env));

        expect(said_).toContain('замещено надстройками разделов: 1');
        expect(said_).toContain('laws/delivery.md · ## Articles');
    });

    it('SC-AK-716 — дерево без надстроек о замещённом молчит', () => {
        start(['laws/delivery.md']);

        expect(said(doctor(env))).not.toContain('замещено надстройками разделов');
    });

    it('SC-AK-125 — разбор состояния называет снятое вместе с родителем', () => {
        startSkipping([VERIFIABILITY]);
        const said_: string = said(doctor(env));

        expect(said_).toContain(`снят каскадом: ${TESTING} — вслед за verifiability`);
        expect(said_).toContain('patterns/testing-unit.md — вслед за testing, отвергнут verifiability');
        expect(said_).not.toContain(`не выбран: ${TESTING}`);
    });

    it('считает невыбранное — все законы, кроме названного', () => {
        const laws: number = readCatalog(ASSETS).filter((entry: IEntryOfCatalog): boolean => entry.kind === 'laws').length;
        start(['laws/delivery.md']);

        expect(said(doctor(env))).toContain(`не выбрано: ${laws - 1}`);
    });

    // Разложенный хук с пустым местным значением лежит на месте, зовётся и выходит нулём:
    // сводка называла такое дерево настроенным, а проверять оно перестало.
    it('SC-AK-729 — сводка называет местное значение, которого в дереве нет', () => {
        start(['hooks/browser-device-id.sh']);
        const said_: string = said(doctor(env));

        expect(said_).toContain('местные значения, которых ждут взятые хуки: 1');
        expect(said_).toContain('нет значения .claude/rt-kit/browser-device-id');
        expect(said_).toContain('hooks/browser-device-id.sh');
    });

    it('SC-AK-729 — о лежащем значении сводка молчит', () => {
        start(['hooks/browser-device-id.sh']);
        put('.claude/rt-kit/browser-device-id', 'профиль\n');
        const said_: string = said(doctor(env));

        expect(said_).toContain('местные значения, которых ждут взятые хуки: 1');
        expect(said_).toContain('все на месте');
        expect(said_).not.toContain('нет значения');
    });

    // Ресурс чужого вида — не «не выбран»: проект от него не отказывался, его в этом дереве
    // не существует вовсе. Сосчитанный как невыбранный, он читался бы как забытый.
    it('ресурсы чужого вида считает отдельно', () => {
        const foreign: number = readCatalog(ASSETS).filter(
            (entry: IEntryOfCatalog): boolean => entry.variant !== null && entry.variant.value !== 'github'
        ).length;
        start();

        expect(said(doctor(env))).toContain(`другой вид: ${foreign}`);
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
        expect(said(list(env))).toContain('Delivery');
    });

    it('различает выбранное, невыбранное и пропущенное', () => {
        put(
            CONFIG_PATH,
            JSON.stringify({
                variants: HOST,
                only: ['laws/delivery.md', 'laws/lists.md'],
                skip: ['laws/lists.md'],
            })
        );
        const lines: readonly string[] = list(env).lines;
        const lineOf: (name: string) => string = (name: string): string =>
            lines.find((line: string): boolean => line.trim().startsWith(name)) ?? '';

        expect(lineOf('delivery')).toContain('нет в дереве');
        expect(lineOf('lists')).toContain('пропущен');
        expect(lineOf('verifiability')).toContain('не выбран');
    });

    it('после раскладки говорит, что файл на месте', () => {
        start();
        sync(env, false);

        expect(list(env).lines.find((line: string): boolean => line.trim().startsWith('delivery'))).toContain('на месте');
    });

    it('шаблоны показывает своим разделом', () => {
        expect(said(list(env))).toContain('ШАБЛОНЫ');
    });
});

describe('stats', () => {
    const TODAY: string = '2026-08-12';

    /** Наблюдения так, как их пишет гард: строка на событие, файл на день. */
    const observed: (lines: readonly Readonly<Record<string, string>>[]) => void = (
        lines: readonly Readonly<Record<string, string>>[]
    ): void =>
        put(
            `${OBSERVATIONS_DIR}/${TODAY}.jsonl`,
            `${lines.map((fields: Readonly<Record<string, string>>): string => JSON.stringify({ t: `${TODAY}T09:00:00Z`, ...fields, v: VERSION })).join('\n')}\n`
        );

    const summed: (days?: number) => IOutcomeOfCommand = (days: number = 3): IOutcomeOfCommand =>
        stats(env, { days, today: TODAY, json: false });

    it('без конфига говорит про init', () => {
        expect(summed().code).toBe(1);
        expect(said(summed())).toContain('init');
    });

    it('SC-AK-75 — записи не велось: говорит причину, а не нули', () => {
        start();

        expect(said(summed())).toContain('записи не велось');
        expect(said(summed())).not.toContain('правил загружено: 0');
    });

    it('SC-AK-72 — выключенная запись названа выключенной', () => {
        start();
        const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH));
        put(CONFIG_PATH, JSON.stringify({ ...config, observe: false }, null, 4));
        observed([{ ev: 'skill-load', res: 'task-flow', sid: '1' }]);

        const said_: string = said(summed());

        expect(said_).toContain('выключена');
        // Наблюдения на диске есть, но сводки по ним нет: выключатель судится раньше чтения.
        expect(said_).not.toContain('task-flow');
    });

    it('считает загрузки, отбития и отказы', () => {
        start();
        observed([
            { ev: 'skill-load', res: 'task-flow', sid: '1' },
            { ev: 'gate-deny', res: 'styling-bem', kind: 'scss', sid: '1' },
            { ev: 'guard-deny', res: 'docs-guard', sid: '2' },
        ]);

        const lines: string = said(summed());

        expect(lines).toContain('заходов 2');
        expect(lines).toContain('правил загружено: 1');
        expect(lines).toContain('гейт отбивал: 1');
        expect(lines).toContain('гарды отказывали: 1');
    });

    it('SC-AK-74 — называет разложенное и ни разу не загруженное', () => {
        start();
        sync(env, false);
        observed([{ ev: 'skill-load', res: 'task-flow', sid: '1' }]);

        expect(said(summed())).toContain('не загружено ни разу');
        // Поимённо список проверяется машинным выводом: печатная сводка обрывает его вслух, и
        // искать в ней конкретное имя значило бы проверять длину дюжины, а не сам отбор.
        expect(JSON.parse(stats(env, { days: 3, today: TODAY, json: true }).lines[0]).unused).toContain('git-workflow');
    });

    it('SC-AK-809 — гард, не отбивший за отрезок ни разу, назван отдельной строкой', () => {
        start();
        sync(env, false);
        observed([{ ev: 'guard-deny', res: 'docs-guard', sid: '1' }]);

        const lines: string = said(summed());

        expect(lines).toContain('гарды не отбивали ни разу');
        // Отбивавший стоит в счётчиках отказов и в молчащие не попадает: иначе раздел говорил бы
        // о всех гардах дерева разом и не отвечал бы ни на один вопрос.
        expect(JSON.parse(stats(env, { days: 3, today: TODAY, json: true }).lines[0]).silentGuards).not.toContain('docs-guard');
        expect(JSON.parse(stats(env, { days: 3, today: TODAY, json: true }).lines[0]).silentGuards).toContain('git-guard-main');
    });

    it('длинный список незагруженного обрывается вслух', () => {
        start();
        sync(env, false);
        observed([{ ev: 'skill-load', res: 'task-flow', sid: '1' }]);

        expect(said(summed())).toContain('и ещё');
    });

    it('машинный вывод — одна строка разбираемого JSON', () => {
        start();
        observed([{ ev: 'skill-load', res: 'task-flow', sid: '1' }]);

        const outcome: IOutcomeOfCommand = stats(env, { days: 3, today: TODAY, json: true });

        expect(outcome.lines).toHaveLength(1);
        expect(JSON.parse(outcome.lines[0])).toMatchObject({ days: 3, sessions: 1, total: 1 });
    });

    it('SC-AK-76 — за отрезок наблюдений нет, а записи велись: зовёт взять отрезок длиннее', () => {
        start();
        put(
            `${OBSERVATIONS_DIR}/2026-08-01.jsonl`,
            `${JSON.stringify({ t: '2026-08-01T09:00:00Z', ev: 'skill-load', res: 'task-flow', sid: '1' })}\n`
        );

        expect(said(summed())).toContain('--days');
    });
});
