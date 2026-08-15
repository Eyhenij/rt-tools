/**
 * Отправка груза на одноразовом дереве.
 *
 * Сеть подменяется двойником: спека проверяет, что уезжает и в каком порядке, а не то, отвечает
 * ли приём. Ресурсы берутся из дерева пакета — снимок надстроек иначе снимался бы с выдуманного
 * набора, а вся его суть в том, что дерево правит настоящий текст.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/feedback-loop/`.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { ICargoOverride, IPostmortemsCargo, IProposalsCargo, ISummaryCargo } from './cargo.js';
import { IEnvironment, init, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH, OVERRIDES_DIR } from './config.js';
import { OBSERVATIONS_DIR } from './observations.js';
import { PROPOSALS_DIR } from './proposals.js';
import { IShipment, IShipped, TShip } from './ship.js';
import { leaksOfCargo, propose, readPostmortems, remoteMarkOf, treeSlugOf } from './shipment.js';
import { overridesOf } from './snapshot.js';

const VERSION: string = '0.1.0';
const TODAY: string = '2026-08-14';
/** Ресурсы берутся из дерева пакета: снимок надстроек снимается с настоящего текста. */
const ASSETS: string = join(__dirname, '..', '..', 'assets');
const INTAKE: string = 'https://intake.test';
const REMOTE: string = 'git@github.test:owner/tree.git';
const TOKEN_FILE: string = '.secret-token';
const TOKEN: string = 'токен-этого-дерева';
/** Ответ приёма о непринятом токене: им отвечает отозванный. */
const TOKEN_REFUSED: number = 401;

let root: string;
let env: IEnvironment;
/** Что уехало двойником — по запросу на строку, в том порядке, в каком уезжало. */
let sent: IShipment[];

const put: (path: string, text: string) => void = (path: string, text: string): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text, 'utf8');
};
const get: (path: string) => string = (path: string): string => readFileSync(join(root, path), 'utf8');
const said: (outcome: IOutcomeOfCommand) => string = (outcome: IOutcomeOfCommand): string => outcome.lines.join('\n');

/** Двойник приёма: отвечает принятым и называет месяц, как настоящий. */
const accepting: (created?: boolean) => TShip =
    (created: boolean = true): TShip =>
    async (intake: string, token: string, shipment: IShipment): Promise<IShipped> => {
        sent.push(shipment);

        return {
            ok: Boolean(intake && token),
            status: created ? 201 : 200,
            said: '',
            accepted: { tree: 'дерево', month: '2026-08', created },
        };
    };

/** Двойник приёма, который груз не принял: отозванный токен отвечает именно так. */
const refusing: (status: number, message: string) => TShip =
    (status: number, message: string): TShip =>
    async (_intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
        sent.push(shipment);

        return { ok: false, status, said: message, accepted: null };
    };

/** Настройка дерева: конфиг заводится командой, а ключи отправки дописываются поверх. */
const start: (patch?: Record<string, unknown>) => void = (patch: Record<string, unknown> = {}): void => {
    init(root, [], { host: 'github' });
    const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH)) as Record<string, unknown>;
    writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, intake: INTAKE, token: TOKEN_FILE, ...patch }, null, 4), 'utf8');
    put(TOKEN_FILE, `${TOKEN}\n`);
};

const shipping: (ship?: TShip, dryRun?: boolean) => Promise<IOutcomeOfCommand> = (
    ship: TShip = accepting(),
    dryRun: boolean = false
): Promise<IOutcomeOfCommand> => propose(env, { dryRun, ship, remote: REMOTE, today: TODAY, days: 3 });

/** Тело сводки, как оно уехало: сводка всегда первая — ею заводится запись месяца. */
const summarySent: () => ISummaryCargo = (): ISummaryCargo => sent[0].body as ISummaryCargo;

const forPackage: string = ['## пакет · rules/styling-bem.md', '', '- **повод:** правило молчит про токены', '', '> Текст правки.'].join(
    '\n'
);
const forTree: string = ['## дерево · .claude/rt-kit/gate-map.sh', '', '> Свой род файлов.'].join('\n');

const proposals: (blocks: readonly string[]) => void = (blocks: readonly string[]): void =>
    put(`${PROPOSALS_DIR}/2026-08-12-probe.md`, `# Предложения\n\n${blocks.join('\n\n')}\n`);

beforeEach((): void => {
    root = mkdtempSync(join(tmpdir(), 'agent-kit-ship-'));
    env = { root, version: VERSION, assetsDir: ASSETS };
    sent = [];
});

afterEach((): void => {
    rmSync(root, { recursive: true, force: true });
});

describe('признак дерева', () => {
    it('две формы адреса одного репозитория дают один признак', () => {
        const byShell: string = treeSlugOf('git@github.test:Owner/Tree.git', '');
        const byWeb: string = treeSlugOf('https://github.test/owner/tree', '');

        expect(byShell).toBe(byWeb);
        expect(byShell).toHaveLength(12);
    });

    it('по признаку адрес дерева не восстанавливается', () => {
        const slug: string = treeSlugOf(REMOTE, '');

        expect(remoteMarkOf(REMOTE)).toBe('github.test/owner/tree');
        expect(slug).not.toContain('tree');
        expect(slug).not.toContain('owner');
        expect(slug).not.toContain('github');
    });

    it('дерево без удалённого репозитория берёт признак из настройки', () => {
        expect(treeSlugOf('', 'своё-дерево')).toBe('своё-дерево');
    });
});

describe('снимок надстроек', () => {
    const packaged: string = ['# Правило', '', '## Первый', '', 'Пакетный текст.', '', '## Второй', '', 'И этот.'].join('\n');

    it('SC-AK-152 — замещённый раздел пакета назван в снимке по имени', () => {
        const found: readonly ICargoOverride[] = overridesOf('rules/probe.md', packaged, '## Первый\n\nСвой текст.');

        expect(found).toEqual([{ resource: 'rules/probe.md', section: '## Первый', kind: 'replace' }]);
    });

    it('SC-AK-153 — свой раздел уезжает родом правки, а его заголовок — нет', () => {
        const found: readonly ICargoOverride[] = overridesOf('rules/probe.md', packaged, '## Про свой домен\n\nСвой текст.');

        expect(found).toEqual([{ resource: 'rules/probe.md', section: null, kind: 'append' }]);
    });

    it('SC-AK-155 — содержимое надстройки в снимок не попадает', () => {
        const found: readonly ICargoOverride[] = overridesOf('rules/probe.md', packaged, '## Первый\n\nСекрет дерева.');

        expect(JSON.stringify(found)).not.toContain('Секрет');
    });

    it('SC-AK-152 — снятый раздел отличается от замещённого родом правки', () => {
        const found: readonly ICargoOverride[] = overridesOf('rules/probe.md', packaged, '## Второй\n');

        expect(found).toEqual([{ resource: 'rules/probe.md', section: '## Второй', kind: 'drop' }]);
    });

    it('пустой свой раздел правкой не считается: слияние его отбрасывает', () => {
        expect(overridesOf('rules/probe.md', packaged, '## Пустой свой\n')).toEqual([]);
    });
});

describe('разборы происшествий', () => {
    it('читаются целиком и по именам файлов', () => {
        root = mkdtempSync(join(tmpdir(), 'agent-kit-pm-'));
        put('docs/postmortems/2026-08-14-промах.md', '# Разбор\n\nМеханизм промаха.');
        put('docs/postmortems/README.txt', 'не разбор');
        put('docs/postmortems/README.md', '# Что здесь лежит\n\nОписание каталога, а не разбор.');

        expect(readPostmortems(root, 'docs/postmortems')).toEqual([
            { file: '2026-08-14-промах.md', text: '# Разбор\n\nМеханизм промаха.' },
        ]);
    });

    it('каталога нет вовсе — это не отказ', () => {
        expect(readPostmortems(root, 'docs/postmortems')).toEqual([]);
    });
});

describe('propose', () => {
    it('SC-AK-167 — выключенная запись наблюдений отправку не начинает', async () => {
        start({ observe: false });

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('`observe`');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-165 — без адреса приёма отправка отказывает и называет, где он объявляется', async () => {
        start({ intake: '' });

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('`intake`');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-166 — без токена дерева не уезжает ничего', async () => {
        start({ token: 'нет-такого-файла' });

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('токена дерева нет');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-166 — отозванный токен отбивает отправку, и отказ называет адрес и род груза', async () => {
        start();

        const outcome: IOutcomeOfCommand = await shipping(refusing(TOKEN_REFUSED, 'токен не принят'));

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain(INTAKE);
        expect(said(outcome)).toContain('сводка');
        expect(said(outcome)).toContain('не уехало ничего');
        expect(said(outcome)).toContain('выдай новый командой приёма');
    });

    it('SC-AK-162 — прогон без предложений отправляет груз и выходит нулём', async () => {
        start();

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(0);
        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual(['summary']);
        expect(summarySent().tree).toBe(treeSlugOf(REMOTE, ''));
    });

    it('SC-AK-154 — невыбранный ресурс виден в снимке отдельно от надстроенного', async () => {
        start({ skip: ['rules/testing.md'] });

        await shipping();

        expect(summarySent().unpicked).toContain('rules/testing.md');
        expect(summarySent().overrides).toEqual([]);
    });

    it('SC-AK-152 — надстройка дерева уезжает вместе со сводкой', async () => {
        start();
        put(`${OVERRIDES_DIR}/rules/testing.md`, '## Ловушки\n\nСвой текст про ловушки.');

        await shipping();

        expect(summarySent().overrides).toContainEqual({ resource: 'rules/testing.md', section: '## Ловушки', kind: 'replace' });
    });

    it('SC-AK-78 — наружу уезжает только адрес «пакет»', async () => {
        start();
        proposals([forPackage, forTree]);

        expect((await shipping()).code).toBe(0);

        const cargo: IProposalsCargo = sent[1].body as IProposalsCargo;
        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual(['summary', 'proposals']);
        expect(cargo.items).toHaveLength(1);
        expect(cargo.items[0].resource).toBe('rules/styling-bem.md');
    });

    it('SC-AK-79 — адрес дерева в тексте предложения отбивает отправку целиком', async () => {
        start();
        proposals([forPackage, ['## пакет · rules/testing.md', '', '> Правится в /Users/probe/tree/apps/site.'].join('\n')]);

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('абсолютный путь');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-163 — адрес дерева в сводке отбивает отправку целиком', () => {
        // Проверка зовётся на собранной сводке: пройти в неё адресу дерева сегодня неоткуда —
        // счётчики отобраны по именам пакета, — и подложенное значение показывает, что проверка
        // видит именно сводку, а не одни тексты предложений.
        const planted: ISummaryCargo = {
            schema: '1',
            tree: 'дерево',
            days: 3,
            sessions: 1,
            loads: [{ name: '/Users/probe/tree/.claude/skills/testing', count: 1 }],
            denials: [],
            kinds: [],
            guards: [],
            unused: [],
            unpicked: [],
            overrides: [],
            versions: [],
            total: 1,
        };

        expect(leaksOfCargo(planted, [], ['/Users/probe/tree'])).toHaveLength(1);
        expect(leaksOfCargo({ ...planted, loads: [{ name: 'testing', count: 1 }] }, [], ['/Users/probe/tree'])).toEqual([]);
    });

    it('имя правила самого дерева в сводку не попадает: пакет его не знает', async () => {
        start();
        put(
            `${OBSERVATIONS_DIR}/${TODAY}.jsonl`,
            [
                JSON.stringify({ ev: 'skill-load', res: 'testing', sid: '1' }),
                JSON.stringify({ ev: 'skill-load', res: 'своё-правило-дерева', sid: '1' }),
                '',
            ].join('\n')
        );

        await shipping();

        expect(summarySent().loads).toContainEqual({ name: 'testing', count: 1 });
        expect(summarySent().loads).not.toContainEqual({ name: 'своё-правило-дерева', count: 1 });
        // Наблюдения не выброшены — отброшены только имена: число событий остаётся полным.
        expect(summarySent().total).toBe(2);
    });

    it('SC-AK-164 — второй прогон месяца называет месяц и то, что запись дописана', async () => {
        start();

        const first: IOutcomeOfCommand = await shipping(accepting(true));
        const second: IOutcomeOfCommand = await shipping(accepting(false));

        expect(said(first)).toContain('запись заведена');
        expect(said(second)).toContain('запись дописана');
        expect(said(second)).toContain('2026-08');
        expect(said(second)).toContain(treeSlugOf(REMOTE, ''));
    });

    it('SC-MB-84 — отправитель печатает принятое и уже лежавшее', async () => {
        start();
        proposals([forPackage]);

        const counting: TShip = async (intake: string, token: string, shipment: IShipment): Promise<IShipped> => {
            sent.push(shipment);
            const counted: boolean = shipment.operation === 'proposals';

            return {
                ok: Boolean(intake && token),
                status: 200,
                said: '',
                accepted: {
                    tree: 'дерево',
                    month: '2026-08',
                    created: false,
                    ...(counted ? { added: 1, known: 2 } : {}),
                },
            };
        };

        const outcome: IOutcomeOfCommand = await shipping(counting);

        expect(said(outcome)).toContain('принято 1, уже лежало 2');
        // Сводке считать нечего: счёт есть только у предложений, и её строка остаётся прежней.
        expect(said(outcome)).toContain('сводка → 2026-08, запись дописана');
    });

    it('SC-AK-80 — отправленное помечается и второй раз не уезжает', async () => {
        start();
        proposals([forPackage]);

        expect((await shipping()).code).toBe(0);
        expect(get(`${PROPOSALS_DIR}/2026-08-12-probe.md`)).toContain('**отправлено:** приём:2026-08');

        sent = [];
        await shipping();

        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual(['summary']);
    });

    it('разборы происшествий уезжают своей операцией и текстом целиком', async () => {
        start();
        put('docs/postmortems/2026-08-14-промах.md', '# Разбор\n\nПромах случился в apps/site.');

        await shipping();

        const cargo: IPostmortemsCargo = sent[1].body as IPostmortemsCargo;
        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual(['summary', 'postmortems']);
        expect(cargo.items[0].text).toContain('Промах случился');
    });

    it('SC-AK-163 — проверка на адрес дерева разбор происшествия не накрывает', async () => {
        start();
        put('docs/postmortems/2026-08-14-промах.md', '# Разбор\n\nПромах в /Users/probe/tree/apps/site.');

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(0);
        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual(['summary', 'postmortems']);
    });

    it('SC-AK-81 — адрес приёма берётся из настройки дерева, а не из текстов пакета', async () => {
        start({ intake: 'https://иной.приём.test/' });
        let where: string = '';
        const watching: TShip = async (intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
            where = intake;
            sent.push(shipment);

            return { ok: true, status: 201, said: '', accepted: { tree: 'дерево', month: '2026-08', created: true } };
        };

        await shipping(watching);

        expect(where).toBe('https://иной.приём.test/');
    });

    it('пробный прогон ничего не отправляет и называет, что уехало бы', async () => {
        start();
        proposals([forPackage]);

        const outcome: IOutcomeOfCommand = await shipping(accepting(), true);

        expect(outcome.code).toBe(0);
        expect(said(outcome)).toContain('уехало бы');
        expect(said(outcome)).toContain('proposals');
        expect(sent).toHaveLength(0);
        expect(get(`${PROPOSALS_DIR}/2026-08-12-probe.md`)).not.toContain('отправлено');
    });

    it('наблюдения за отрезок уезжают счётчиками', async () => {
        start();
        put(`${OBSERVATIONS_DIR}/${TODAY}.jsonl`, `${JSON.stringify({ ev: 'skill-load', res: 'task-flow', sid: '1', v: '0.7.0' })}\n`);

        await shipping();

        expect(summarySent().total).toBe(1);
        expect(summarySent().loads).toContainEqual({ name: 'task-flow', count: 1 });
        expect(summarySent().versions).toEqual(['0.7.0']);
    });
});
