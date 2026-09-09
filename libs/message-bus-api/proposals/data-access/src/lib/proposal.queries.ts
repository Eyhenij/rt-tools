/**
 * Предложения к записи месяца: копятся, а не замещаются.
 *
 * Сводка отвечает на вопрос «как дела сейчас», предложения — «что случилось за месяц». Дерево
 * при этом шлёт файл предложений целиком, и без отбора уже приехавшего каждый прогон заводил бы
 * копии всего накопленного.
 *
 * Отбор держит уникальность пары «дерево — признак», а не проверка чтением: два прогона
 * приезжают одновременно, и прочитанное первым устареет раньше, чем он допишет своё.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { proposalDigest } from '@rt/message-bus-api/proposals/util';
import {
    CARGO_RELEASE_VERSION_FIELD,
    cargoCloseData,
    cargoCloseMove,
    cargoStateData,
    cargoStateMove,
    cargoStateOf,
    cargoStateWrites,
    ECargoState,
    ECargoStateMove,
    ICargoCloseOutcome,
    ICargoPageAsked,
    ICargoStateAsk,
    ICargoStateOutcome,
    IPage,
    IPageAsked,
    IReleaseVersionKeyed,
    ITreeChoice,
    orderedReleaseVersions,
    pageSkip,
    releaseVersionPageIds,
    TPageDirection,
} from '@rt/message-bus-common';

/** Одно предложение, каким оно ложится в хранилище. */
export interface IProposalRow {
    readonly text: string;
    readonly address: string;
    readonly resource: string;
}

/**
 * Строка списка предложений.
 *
 * Текста предложения в ней нет: он отдаётся чтением одной записи. Дерево приезжает через запись
 * месяца — предложение крепится к ней, а не к дереву напрямую.
 */
export interface IProposalListRow {
    readonly id: string;
    readonly tree: ITreeChoice;
    readonly resource: string;
    readonly address: string;
    /** На каком шаге разбора стоит запись: пустым это поле не приезжает никогда. */
    readonly state: ECargoState;
    /** В какой версии искать фикс. Пусто у записи, которую никто не выпускал: столбец её не заполняет. */
    readonly releaseVersion: string | null;
    /**
     * Чем запись спорна. Пусто у записи, которая в карантине не была.
     *
     * Едет строкой списка по тому же доводу, что и версия выпуска: свою запись отправитель видит
     * именно списком, и без этого поля карантин читается им как состояние без ответа на «почему».
     */
    readonly quarantineNote: string | null;
    /**
     * Закрыл ли запись издатель редакции, а не приславшее её дерево.
     *
     * Едет строкой списка, а не одной записью: своё предложение отправитель видит именно списком,
     * и без этого поля выпущенная запись читается им как его собственная отметка.
     */
    readonly closedByPublisher: boolean;
    readonly arrivedAt: Date;
}

/** Предложение целиком — то, что показывает панель подробностей. */
export interface IProposalFullRow extends IProposalListRow {
    readonly text: string;
    /** Месяц записи, к которой предложение приехало: в строке списка его нет. */
    readonly month: string;
    /** Чем недочёт исправлен. Пусто у записи, которую никто не чинил: в строке списка его нет. */
    readonly fixNote: string | null;
}

/** Чем сужен список: все части необязательны и все складываются в одно условие. */
interface IProposalWhere {
    readonly record?: { readonly tree: { readonly slug: string } };
    readonly state?: ECargoState;
    /** Версия выпуска либо пустота: пустотой сужает список отбор «без версии». */
    readonly releaseVersion?: string | null;
}

/** Чем сужен запрос строк: отбор списка либо перечень признаков одной страницы. */
type TProposalPick = IProposalWhere | { readonly id: { readonly in: string[] } };

/** Первая ступень порядка. Вторая — всегда идентификатор записи, и её ставит сам запрос. */
type TProposalOrder =
    | { readonly arrivedAt: TPageDirection }
    | { readonly resource: TPageDirection }
    | { readonly address: TPageDirection }
    | { readonly state: TPageDirection }
    | { readonly record: { readonly tree: { readonly name: TPageDirection } } };

/**
 * Порядок по названному полю.
 *
 * Дерево упорядочивается именем: признак человеку ни о чём не говорит. Состояние — значением
 * колонки набора, и хранилище упорядочивает набор по объявлению: слова объявлены шагами разбора,
 * поэтому порядок выходит очередью работы, а не алфавитом.
 */
function orderOf(asked: IPageAsked): TProposalOrder {
    switch (asked.sort) {
        case 'resource':
            return { resource: asked.dir };
        case 'address':
            return { address: asked.dir };
        case 'state':
            return { state: asked.dir };
        case 'tree':
            return { record: { tree: { name: asked.dir } } };
        default:
            return { arrivedAt: asked.dir };
    }
}

/**
 * Отбор списка: дерево, состояние и версия складываются, а не заменяют друг друга.
 *
 * Отбор по дереву идёт через запись месяца: своей связи с деревом у предложения нет. Состояние и
 * версия лежат колонками самого предложения, поэтому условия стоят на разных уровнях одного
 * запроса. «Без версии» — не пустой отбор, а условие на пустую колонку: им находят починенное, но
 * не выпущенное; версия, которой в записях нет, отдаёт пустую страницу, а не отказ.
 */
function whereOf(asked: ICargoPageAsked): IProposalWhere {
    return {
        ...(asked.tree ? { record: { tree: { slug: asked.tree } } } : {}),
        ...(asked.state ? { state: asked.state } : {}),
        ...(asked.version ? { releaseVersion: asked.version } : {}),
        ...(asked.withoutVersion ? { releaseVersion: null } : {}),
    };
}

/** Предложение, каким его отдаёт хранилище строке списка: значения колонок, ещё не переведённые. */
interface IProposalStored {
    id: string;
    resource: string;
    address: string;
    state: string;
    releaseVersion: string | null;
    quarantineNote: string | null;
    closedByPublisher: boolean;
    arrivedAt: Date;
    record: { tree: ITreeChoice };
}

/** Ступень порядка: названное поле либо признак записи, которым разводятся равные. */
type TProposalOrderStep = TProposalOrder | { readonly id: TPageDirection };

/**
 * Строки списка из хранилища: одно место, где названы поля строки.
 *
 * Запросов за строками два — обычный порядок берёт страницу сразу, а порядок по версии вторым
 * запросом по отобранным признакам, — и разойдясь набором полей, они отдали бы человеку строку без
 * столбца ровно на одном из порядков.
 */
async function storedRows(
    prisma: PrismaService,
    where: TProposalPick,
    orderBy?: TProposalOrderStep[],
    skip?: number,
    take?: number
): Promise<IProposalStored[]> {
    return prisma.proposal.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
            id: true,
            resource: true,
            address: true,
            state: true,
            releaseVersion: true,
            quarantineNote: true,
            closedByPublisher: true,
            arrivedAt: true,
            record: { select: { tree: { select: { slug: true, name: true } } } },
        },
    });
}

/**
 * Строка списка из того, что отдало хранилище: дерево лежит внутри записи месяца.
 *
 * Состояние приезжает значением колонки и переводится в набор общей либы: набор объявлен дважды —
 * хранилищем и общей либой, — и читающая сторона знает только второй.
 */
function listRowOf(row: IProposalStored): IProposalListRow {
    return {
        id: row.id,
        tree: row.record.tree,
        resource: row.resource,
        address: row.address,
        state: cargoStateOf(row.state),
        releaseVersion: row.releaseVersion,
        quarantineNote: row.quarantineNote,
        closedByPublisher: row.closedByPublisher,
        arrivedAt: row.arrivedAt,
    };
}

/** Страница в порядке, который строит хранилище: одна поездка за отобранной и упорядоченной страницей. */
async function byColumn(prisma: PrismaService, where: IProposalWhere, asked: ICargoPageAsked): Promise<IProposalListRow[]> {
    const rows: IProposalStored[] = await storedRows(prisma, where, [orderOf(asked), { id: asked.dir }], pageSkip(asked), asked.size);

    return rows.map(listRowOf);
}

/**
 * Страница в порядке по версии выпуска: две поездки вместо одной.
 *
 * Порядок по версии хранилище не строит — колонка строковая, и `0.10.0` встало бы перед `0.9.0`;
 * правило сравнения живёт в общей либе, потому что теми же номерами админка показывает версии в
 * отборе. Первая поездка приносит признак и версию каждой отобранной записи, вторая — поля самой
 * страницы: строк в ответе двадцать, и тащить остальные целиком ради них незачем.
 *
 * Порядок ответа задают признаки, а не второй запрос: `in` отдаёт строки, как ему удобно.
 */
async function byVersion(prisma: PrismaService, where: IProposalWhere, asked: ICargoPageAsked): Promise<IProposalListRow[]> {
    const keyed: IReleaseVersionKeyed[] = await prisma.proposal.findMany({ where, select: { id: true, releaseVersion: true } });
    const ids: readonly string[] = releaseVersionPageIds(keyed, asked);

    if (ids.length === 0) {
        return [];
    }

    const rows: IProposalStored[] = await storedRows(prisma, { id: { in: [...ids] } });
    const byId: Map<string, IProposalStored> = new Map(rows.map((row: IProposalStored): [string, IProposalStored] => [row.id, row]));

    return ids
        .map((id: string): IProposalStored | undefined => byId.get(id))
        .filter((row: IProposalStored | undefined): row is IProposalStored => row !== undefined)
        .map(listRowOf);
}

/**
 * Страница предложений.
 *
 * Общее число берётся вторым запросом, а не одной сделкой со строками: список, укоротившийся
 * между ними, — обычное дело, и ради снимка, который всё равно устареет к отрисовке, сделка
 * держала бы соединение дольше самого чтения.
 *
 * Порядок идёт двумя ступенями: предложения одного прогона приезжают с одним временем, и без
 * второго ключа одна и та же запись видна на двух страницах подряд, а соседняя не видна ни на
 * одной.
 */
export async function readProposals(prisma: PrismaService, asked: ICargoPageAsked): Promise<IPage<IProposalListRow>> {
    const where: IProposalWhere = whereOf(asked);
    const total: number = await prisma.proposal.count({ where });
    const rows: IProposalListRow[] =
        asked.sort === CARGO_RELEASE_VERSION_FIELD ? await byVersion(prisma, where, asked) : await byColumn(prisma, where, asked);

    return { rows, total, page: asked.page, size: asked.size };
}

/**
 * Версии выпуска, встретившиеся у предложений, — упорядоченные номерами.
 *
 * Отдаются все: набор версий заранее не объявлен — их называет дерево при выпуске, — а верхние
 * двадцать значили бы, что старую версию через отбор уже не найти. Пустая колонка сюда не
 * приходит: запись без версии — это отсутствие значения, и в отборе она стоит своим пунктом.
 */
export async function readProposalVersions(prisma: PrismaService): Promise<readonly string[]> {
    const rows: { releaseVersion: string | null }[] = await prisma.proposal.findMany({
        where: { releaseVersion: { not: null } },
        select: { releaseVersion: true },
        distinct: ['releaseVersion'],
    });
    const found: string[] = [];

    for (const row of rows) {
        if (row.releaseVersion !== null) {
            found.push(row.releaseVersion);
        }
    }

    return orderedReleaseVersions(found);
}

/** Одно предложение целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readProposal(prisma: PrismaService, id: string): Promise<IProposalFullRow | null> {
    const found: {
        id: string;
        text: string;
        resource: string;
        address: string;
        state: string;
        fixNote: string | null;
        releaseVersion: string | null;
        quarantineNote: string | null;
        closedByPublisher: boolean;
        arrivedAt: Date;
        record: { month: string; tree: ITreeChoice };
    } | null = await prisma.proposal.findUnique({
        where: { id },
        select: {
            id: true,
            text: true,
            resource: true,
            address: true,
            state: true,
            fixNote: true,
            releaseVersion: true,
            quarantineNote: true,
            closedByPublisher: true,
            arrivedAt: true,
            record: { select: { month: true, tree: { select: { slug: true, name: true } } } },
        },
    });

    return found ? { ...listRowOf(found), text: found.text, month: found.record.month, fixNote: found.fixNote } : null;
}

/** Чем кончилась вставка: сколько записей легло и сколько приехало повторно. */
export interface IProposalsWritten {
    readonly added: number;
    readonly known: number;
}

/**
 * Дописать к записи месяца те предложения, которых у дерева ещё не было.
 *
 * Все записи одной операции ложатся вместе: пять предложений, из которых упало третье, оставили
 * бы запись месяца в состоянии, которого не было ни до, ни после. Держится это одной командой
 * вставки — не пятью подряд.
 *
 * Уже приехавшее отбирается по паре «дерево — признак», а не по паре «запись месяца — текст»:
 * повтор приезжает в любом месяце, и граница месяца от него не защищает.
 */
export async function addProposals(
    prisma: PrismaService,
    recordId: string,
    treeId: string,
    items: readonly IProposalRow[]
): Promise<IProposalsWritten> {
    if (items.length === 0) {
        return { added: 0, known: 0 };
    }

    const written: { count: number } = await prisma.proposal.createMany({
        data: items.map((item: IProposalRow) => ({
            recordId,
            treeId,
            text: item.text,
            digest: proposalDigest(item.text),
            address: item.address,
            resource: item.resource,
        })),
        // Уже приехавшее пропускается, а не отбивает вставку: дерево шлёт файл целиком, и
        // повтор здесь — это правило, а не промах отправителя
        skipDuplicates: true,
    });

    return { added: written.count, known: items.length - written.count };
}

/**
 * Перевести предложения дерева в названные состояния.
 *
 * Ключ здесь — признак текста, а не имя файла: тем же признаком предложение опознаётся на
 * приёме, и второго способа назвать свою запись у дерева нет.
 *
 * Прежнее состояние читается из хранилища одним запросом на весь пакет: присланное деревом
 * успевает устареть между чтением и правкой, а запрос на строку стоил бы столько же, сколько
 * сам разбор груза. Ложатся только разрешённые переходы и все вместе; исход возвращается по
 * каждой строке — из него собираются и ответ дереву, и строка журнала.
 */
export async function moveProposalStates(
    prisma: PrismaService,
    treeId: string,
    asked: readonly ICargoStateAsk[]
): Promise<ICargoStateOutcome[]> {
    if (asked.length === 0) {
        return [];
    }

    const rows: { digest: string; state: string }[] = await prisma.proposal.findMany({
        where: { treeId, digest: { in: asked.map((one: ICargoStateAsk): string => one.key) } },
        select: { digest: true, state: true },
    });
    const stored: Map<string, ECargoState> = new Map(
        rows.map((row: { digest: string; state: string }): [string, ECargoState] => [row.digest, cargoStateOf(row.state)])
    );
    const judged: { ask: ICargoStateAsk; outcome: ICargoStateOutcome }[] = asked.map((ask: ICargoStateAsk) => {
        const was: ECargoState | undefined = stored.get(ask.key);
        const move: ECargoStateMove | null = was === undefined ? null : cargoStateMove(was, ask.state);

        return { ask, outcome: { key: ask.key, move } };
    });
    const written: ICargoStateAsk[] = judged
        .filter((one: { ask: ICargoStateAsk; outcome: ICargoStateOutcome }): boolean =>
            cargoStateWrites(one.outcome.move, one.ask.fixNote, one.ask.releaseVersion, one.ask.quarantineNote)
        )
        .map((one: { ask: ICargoStateAsk }): ICargoStateAsk => one.ask);

    if (written.length > 0) {
        await prisma.$transaction(
            written.map((ask: ICargoStateAsk) =>
                prisma.proposal.update({
                    where: { treeId_digest: { treeId, digest: ask.key } },
                    data: cargoStateData(ask),
                    select: { id: true },
                })
            )
        );
    }

    return judged.map((one: { outcome: ICargoStateOutcome }): ICargoStateOutcome => one.outcome);
}

/** Предложение, каким его видит закрытие: признак, состояние и дерево, приславшее запись. */
interface IProposalForClose {
    id: string;
    state: string;
    tree: { slug: string };
}

/**
 * Закрыть предложения любых деревьев: перевести их в починенное либо выпущенное.
 *
 * Стоит рядом с правкой состояния деревом, а не вместо неё: у отправителя своё право на свою
 * запись, и закрытие его не отменяет. Разного здесь два. Первое — запись ищется признаком из
 * чтения, а не ключом отправителя: имя файла и признак текста уникальны у своего дерева, а не в
 * приёме, и названный ключ нашёл бы у двух деревьев две записи. Второе — отбора по дереву нет
 * вовсе: издатель видит весь груз, и своего дерева у него в этой операции не бывает.
 *
 * Порядок переходов свой — `cargoCloseMove`: издатель ставит только два последних шага, зато
 * ходит через «в работе», которого у него не было.
 */
export async function closeProposals(prisma: PrismaService, asked: readonly ICargoStateAsk[]): Promise<ICargoCloseOutcome[]> {
    if (asked.length === 0) {
        return [];
    }

    const rows: IProposalForClose[] = await prisma.proposal.findMany({
        where: { id: { in: asked.map((one: ICargoStateAsk): string => one.key) } },
        select: { id: true, state: true, tree: { select: { slug: true } } },
    });
    const stored: Map<string, IProposalForClose> = new Map(
        rows.map((row: IProposalForClose): [string, IProposalForClose] => [row.id, row])
    );
    const judged: { ask: ICargoStateAsk; outcome: ICargoCloseOutcome }[] = asked.map((ask: ICargoStateAsk) => {
        const found: IProposalForClose | undefined = stored.get(ask.key);
        const move: ECargoStateMove | null = found === undefined ? null : cargoCloseMove(cargoStateOf(found.state), ask.state);

        return { ask, outcome: { key: ask.key, tree: found?.tree.slug ?? null, move } };
    });
    const written: ICargoStateAsk[] = judged
        .filter((one: { ask: ICargoStateAsk; outcome: ICargoCloseOutcome }): boolean =>
            cargoStateWrites(one.outcome.move, one.ask.fixNote, one.ask.releaseVersion, one.ask.quarantineNote)
        )
        .map((one: { ask: ICargoStateAsk }): ICargoStateAsk => one.ask);

    if (written.length > 0) {
        await prisma.$transaction(
            written.map((ask: ICargoStateAsk) =>
                prisma.proposal.update({ where: { id: ask.key }, data: cargoCloseData(ask), select: { id: true } })
            )
        );
    }

    return judged.map((one: { outcome: ICargoCloseOutcome }): ICargoCloseOutcome => one.outcome);
}
