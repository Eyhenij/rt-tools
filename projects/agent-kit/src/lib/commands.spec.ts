/**
 * Сквозные сценарии команд на одноразовом дереве.
 *
 * Чистые модули проверены поштучно, но раскладку решает их порядок: подстановка после слияния,
 * отказ раньше первой записи, шапка поверх готового тела. Первый живой прогон нашёл ровно то,
 * чего поштучные спеки увидеть не могли, — путь до собственных ресурсов, который в собранном
 * пакете иной, чем в исходниках.
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { adopt, doctor, IEnvironment, init, IOutcomeOfCommand, KEPT_SUFFIX, list, stats, sync } from './commands.js';
import { CONFIG_PATH, OVERRIDES_DIR } from './config.js';
import { bindingsOf, hooksSection, IHookBinding } from './hooks-map.js';
import { OBSERVATIONS_DIR } from './observations.js';

const VERSION: string = '0.1.0';
const LAW: string = 'docs/constitution/delivery.md';
const OTHER_LAW: string = 'docs/constitution/application/access.md';
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

/**
 * Подключить разложенные гарды к агенту так, как это делает проект: пакет в чужую настройку не
 * пишет, а гард, которого в ней нет, считается расхождением наравне с отставшим файлом.
 */
const bindHooks: () => void = (): void => {
    const dir: string = join(root, '.claude/hooks');
    if (!existsSync(dir)) {
        return;
    }
    // Гард подключается к тому событию, которое объявил сам, и гард с двумя объявлениями — к
    // обоим: настройка, где все они свалены под одно событие, половину из них не зовёт.
    //
    // Образец берётся у самого гарда, а не пишется звёздочкой: сверка судит и его, а настройка с
    // чужим образцом — это ровно то расхождение, ради которого сверку и завели. Собирается она
    // тем же куском, который пакет печатает дереву в подсказке.
    const bindings: IHookBinding[] = [];
    for (const name of readdirSync(dir).filter((file: string): boolean => file.endsWith('.sh'))) {
        const path: string = `.claude/hooks/${name}`;
        bindings.push(...bindingsOf(readFileSync(join(root, path), 'utf8'), path));
    }
    put('.claude/settings.json', JSON.stringify({ hooks: hooksSection(bindings) }, null, 4));
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
        expect(said(start(['laws/delivery.md', 'laws/application/access.md']))).toContain('выбрано ресурсов: 2');
        expect(JSON.parse(get(CONFIG_PATH)).only).toEqual(['laws/delivery.md', 'laws/application/access.md']);
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
        expect(get(LAW)).toContain('## Статьи');
    });

    it('повторный прогон ничего не переписывает', () => {
        start();
        sync(env, false);

        expect(said(sync(env, false))).toContain('всё уже разложено');
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
        expect(get(GLOSSARY)).toContain('## Слой правил');
    });

    it('SC-AK-34 — предметные разделы словаря дописываются надстройкой', () => {
        start();
        put(join(OVERRIDES_DIR, 'docs/GLOSSARY.md'), '## Своё слово\n\nЗначит вот это.\n');
        sync(env, false);

        expect(get(GLOSSARY)).toContain('## Слой правил');
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

describe('sync --check', () => {
    it('на разложенном и заполненном молчит и пропускает', () => {
        start();
        sync(env, false);
        // Разложенного мало: у каждого правила рядом встаёт черновик компаньона, и до
        // заполнения проектом он сам по себе расхождение — набор про это ниже.
        fillCompanions();
        bindHooks();

        expect(sync(env, true).code).toBe(0);
    });

    it('SC-AK-05 — разложенный гард доезжает до настройки агента', () => {
        start();
        sync(env, false);
        fillCompanions();
        const outcome: IOutcomeOfCommand = sync(env, true);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('.claude/settings.json');
        expect(said(outcome)).toContain('"PreToolUse"');
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
        bindHooks();

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

    it('о неразложенном говорит в настоящем времени: он ничего не писал', () => {
        start();
        const outcome: IOutcomeOfCommand = doctor(env);

        expect(said(outcome)).toContain('нет в дереве');
        expect(said(outcome)).not.toContain('положен:');
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
        expect(said(list(env))).toContain('Поставка');
    });

    it('различает выбранное, невыбранное и пропущенное', () => {
        put(
            CONFIG_PATH,
            JSON.stringify({
                variants: HOST,
                only: ['laws/delivery.md', 'laws/application/access.md'],
                skip: ['laws/application/access.md'],
            })
        );
        const lines: readonly string[] = list(env).lines;
        const lineOf: (name: string) => string = (name: string): string =>
            lines.find((line: string): boolean => line.trim().startsWith(name)) ?? '';

        expect(lineOf('delivery')).toContain('нет в дереве');
        // Закон приложения зовётся со слоем: путь внутри рода едет в имя, и перечень показывает
        // его целиком — иначе два закона с одинаковым коротким именем читались бы как один.
        expect(lineOf('application/access')).toContain('пропущен');
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
