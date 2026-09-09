/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * К записи месяца не крепятся: разбор правится на дереве после того, как уехал, и второй
 * экземпляр читался бы как второе происшествие. Исчезнувший на дереве у приёмника остаётся —
 * приёмник принимает, а не следит, и удаление по молчанию отправителя стёрло бы записи первого
 * же дерева, переставшего слать.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemArrivalUpdate, postmortemArrivalUpdate } from '@rt/message-bus-api/postmortems/util';
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

/** Один разбор, каким он ложится в хранилище. */
export interface IPostmortemRow {
    readonly file: string;
    readonly text: string;
}

/**
 * Строка списка разборов.
 *
 * Текста разбора в ней нет: разбор приезжает целиком, и страница, несущая тексты всех своих
 * строк, растёт весом без предела. Текст отдаёт чтение одной записи.
 */
export interface IPostmortemListRow {
    readonly id: string;
    readonly tree: ITreeChoice;
    readonly file: string;
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
     * Едет строкой списка, а не одной записью: свой разбор отправитель видит именно списком, и
     * без этого поля выпущенная запись читается им как его собственная отметка.
     */
    readonly closedByPublisher: boolean;
    readonly arrivedAt: Date;
    readonly updatedAt: Date;
}

/** Разбор целиком — то, что показывает панель подробностей. */
export interface IPostmortemFullRow extends IPostmortemListRow {
    readonly text: string;
    /** Чем недочёт исправлен. Пусто у записи, которую никто не чинил: в строке списка его нет. */
    readonly fixNote: string | null;
}

/** Чем сужен список: все части необязательны и все складываются в одно условие. */
interface IPostmortemWhere {
    readonly tree?: { readonly slug: string };
    readonly state?: ECargoState;
    /** Версия выпуска либо пустота: пустотой сужает список отбор «без версии». */
    readonly releaseVersion?: string | null;
}

/** Первая ступень порядка. Вторая — всегда идентификатор записи, и её ставит сам запрос. */
type TPostmortemOrder =
    | { readonly arrivedAt: TPageDirection }
    | { readonly updatedAt: TPageDirection }
    | { readonly file: TPageDirection }
    | { readonly state: TPageDirection }
    | { readonly tree: { readonly name: TPageDirection } };

/**
 * Порядок по названному полю.
 *
 * Дерево упорядочивается именем: признак человеку ни о чём не говорит. Состояние — значением
 * колонки набора, и хранилище упорядочивает набор по объявлению: слова объявлены шагами разбора,
 * поэтому порядок выходит очередью работы, а не алфавитом.
 */
function orderOf(asked: IPageAsked): TPostmortemOrder {
    switch (asked.sort) {
        case 'updatedAt':
            return { updatedAt: asked.dir };
        case 'file':
            return { file: asked.dir };
        case 'state':
            return { state: asked.dir };
        case 'tree':
            return { tree: { name: asked.dir } };
        default:
            return { arrivedAt: asked.dir };
    }
}

/**
 * Отбор списка: дерево, состояние и версия складываются, а не заменяют друг друга.
 *
 * Пусто по дереву — груз всех деревьев: учётная запись принадлежит службе, а не дереву. Пусто по
 * состоянию — записи всех состояний. Пусто по версии — записи всех версий, а «без версии» — не
 * пустой отбор, а условие на пустую колонку: им находят починенное, но не выпущенное.
 *
 * Версия, которой в записях нет, сюда доходит как есть и отдаёт пустую страницу: набор версий
 * открыт, и отказ на вчерашнюю версию читался бы как поломка.
 */
function whereOf(asked: ICargoPageAsked): IPostmortemWhere {
    return {
        ...(asked.tree ? { tree: { slug: asked.tree } } : {}),
        ...(asked.state ? { state: asked.state } : {}),
        ...(asked.version ? { releaseVersion: asked.version } : {}),
        ...(asked.withoutVersion ? { releaseVersion: null } : {}),
    };
}

/** Разбор, каким его отдаёт хранилище строке списка: значения колонок, ещё не переведённые. */
export interface IPostmortemStored {
    id: string;
    file: string;
    state: string;
    releaseVersion: string | null;
    quarantineNote: string | null;
    closedByPublisher: boolean;
    arrivedAt: Date;
    updatedAt: Date;
    tree: ITreeChoice;
}

/** Чем сужен запрос строк: отбор списка либо перечень признаков одной страницы. */
type TPostmortemPick = IPostmortemWhere | { readonly id: { readonly in: string[] } };

/** Ступень порядка: названное поле либо признак записи, которым разводятся равные. */
type TPostmortemOrderStep = TPostmortemOrder | { readonly id: TPageDirection };

/**
 * Строки списка из хранилища: одно место, где названы поля строки.
 *
 * Запросов за строками два — обычный порядок берёт страницу сразу, а порядок по версии вторым
 * запросом по отобранным признакам, — и разойдясь набором полей, они отдали бы человеку строку без
 * столбца ровно на одном из порядков.
 */
async function storedRows(
    prisma: PrismaService,
    where: TPostmortemPick,
    orderBy?: TPostmortemOrderStep[],
    skip?: number,
    take?: number
): Promise<IPostmortemStored[]> {
    return prisma.postmortem.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
            id: true,
            file: true,
            state: true,
            releaseVersion: true,
            quarantineNote: true,
            closedByPublisher: true,
            arrivedAt: true,
            updatedAt: true,
            tree: { select: { slug: true, name: true } },
        },
    });
}

/**
 * Строка списка из того, что отдало хранилище.
 *
 * Состояние приезжает значением колонки и переводится в набор общей либы: набор объявлен дважды —
 * хранилищем и общей либой, — и читающая сторона знает только второй.
 */
export function postmortemListRowOf(row: IPostmortemStored): IPostmortemListRow {
    return {
        id: row.id,
        tree: row.tree,
        file: row.file,
        state: cargoStateOf(row.state),
        releaseVersion: row.releaseVersion,
        quarantineNote: row.quarantineNote,
        closedByPublisher: row.closedByPublisher,
        arrivedAt: row.arrivedAt,
        updatedAt: row.updatedAt,
    };
}

/** Страница в порядке, который строит хранилище: одна поездка за отобранной и упорядоченной страницей. */
async function byColumn(prisma: PrismaService, where: IPostmortemWhere, asked: ICargoPageAsked): Promise<IPostmortemListRow[]> {
    const rows: IPostmortemStored[] = await storedRows(prisma, where, [orderOf(asked), { id: asked.dir }], pageSkip(asked), asked.size);

    return rows.map(postmortemListRowOf);
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
async function byVersion(prisma: PrismaService, where: IPostmortemWhere, asked: ICargoPageAsked): Promise<IPostmortemListRow[]> {
    const keyed: IReleaseVersionKeyed[] = await prisma.postmortem.findMany({ where, select: { id: true, releaseVersion: true } });
    const ids: readonly string[] = releaseVersionPageIds(keyed, asked);

    if (ids.length === 0) {
        return [];
    }

    const rows: IPostmortemStored[] = await storedRows(prisma, { id: { in: [...ids] } });
    const byId: Map<string, IPostmortemStored> = new Map(rows.map((row: IPostmortemStored): [string, IPostmortemStored] => [row.id, row]));

    return ids
        .map((id: string): IPostmortemStored | undefined => byId.get(id))
        .filter((row: IPostmortemStored | undefined): row is IPostmortemStored => row !== undefined)
        .map(postmortemListRowOf);
}

/**
 * Страница разборов.
 *
 * Общее число берётся вторым запросом, а не одной сделкой со строками: список, укоротившийся
 * между ними, — обычное дело, и ради снимка, который всё равно устареет к отрисовке, сделка
 * держала бы соединение дольше самого чтения.
 *
 * Порядок идёт двумя ступенями: разборы одного прогона приезжают с одним временем, и без второго
 * ключа одна и та же запись видна на двух страницах подряд, а соседняя не видна ни на одной.
 */
export async function readPostmortems(prisma: PrismaService, asked: ICargoPageAsked): Promise<IPage<IPostmortemListRow>> {
    const where: IPostmortemWhere = whereOf(asked);
    const total: number = await prisma.postmortem.count({ where });
    const rows: IPostmortemListRow[] =
        asked.sort === CARGO_RELEASE_VERSION_FIELD ? await byVersion(prisma, where, asked) : await byColumn(prisma, where, asked);

    return { rows, total, page: asked.page, size: asked.size };
}

/**
 * Версии выпуска, встретившиеся у разборов, — упорядоченные номерами.
 *
 * Отдаются все: набор версий заранее не объявлен — их называет дерево при выпуске, — а верхние
 * двадцать значили бы, что старую версию через отбор уже не найти. Пустая колонка сюда не
 * приходит: запись без версии — это отсутствие значения, и в отборе она стоит своим пунктом.
 */
export async function readPostmortemVersions(prisma: PrismaService): Promise<readonly string[]> {
    const rows: { releaseVersion: string | null }[] = await prisma.postmortem.findMany({
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

/** Один разбор целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readPostmortem(prisma: PrismaService, id: string): Promise<IPostmortemFullRow | null> {
    const found: (IPostmortemStored & { text: string; fixNote: string | null }) | null = await prisma.postmortem.findUnique({
        where: { id },
        select: {
            id: true,
            file: true,
            text: true,
            state: true,
            fixNote: true,
            releaseVersion: true,
            quarantineNote: true,
            closedByPublisher: true,
            arrivedAt: true,
            updatedAt: true,
            tree: { select: { slug: true, name: true } },
        },
    });

    return found ? { ...postmortemListRowOf(found), text: found.text, fixNote: found.fixNote } : null;
}

/**
 * Тексты разборов, которые уже лежат: по ним решается, сбрасывать ли состояние.
 *
 * Читаются одним запросом на весь груз, а не по запросу на запись: прогон дерева везёт разборы
 * десятками, и запрос на каждый стоил бы столько же, сколько сама запись.
 */
async function storedTexts(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<Map<string, string>> {
    const rows: { file: string; text: string }[] = await prisma.postmortem.findMany({
        where: { treeId, file: { in: items.map((item: IPostmortemRow): string => item.file) } },
        select: { file: true, text: true },
    });

    return new Map(rows.map((row: { file: string; text: string }): [string, string] => [row.file, row.text]));
}

/**
 * Положить разборы дерева: каждый по своему имени файла заводится или обновляется.
 *
 * Все записи операции ложатся вместе или не ложатся вовсе, поэтому они идут одной сделкой:
 * упавший третий разбор оставил бы дерево в состоянии, которого не было ни до, ни после.
 * Одной командой это не выразить — обновление берёт текст каждой записи свой.
 *
 * Лежащие тексты читаются до сделки, потому что решение о сбросе состояния берёт оба текста
 * сразу, а команда обновления прежнего не видит. Два прогона одного дерева, разошедшиеся между
 * чтением и записью, дадут лишний сброс либо пропустят его: цена такой пары — одно состояние, а
 * не связность хранилища, и ради неё чтение с записью в одну сделку не сводятся.
 *
 * Возвращает, сколько разборов положено.
 */
export async function writePostmortems(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    const stored: Map<string, string> = await storedTexts(prisma, treeId, items);

    await prisma.$transaction(
        items.map((item: IPostmortemRow) => {
            const arrival: IPostmortemArrivalUpdate = postmortemArrivalUpdate(stored.get(item.file), item.text);

            return prisma.postmortem.upsert({
                where: { treeId_file: { treeId, file: item.file } },
                create: { treeId, file: item.file, text: item.text },
                update: arrival,
                select: { id: true },
            });
        })
    );

    return items.length;
}

/**
 * Перевести разборы дерева в названные состояния.
 *
 * Прежнее состояние читается из хранилища, а не берётся из запроса: между чтением дерева и его
 * правкой стоит сеть, и присланное прежнее состояние успевает устареть. Читается оно одним
 * запросом на весь пакет — дерево разбирает груз пачкой, и запрос на строку стоил бы столько
 * же, сколько сам разбор.
 *
 * Ложатся только разрешённые переходы, и все вместе: строка, отбитая порядком переходов, до
 * сделки не доходит вовсе. Исход возвращается по каждой строке — ответ дерева и строка журнала
 * собираются из него, а не считаются заново.
 */
export async function movePostmortemStates(
    prisma: PrismaService,
    treeId: string,
    asked: readonly ICargoStateAsk[]
): Promise<ICargoStateOutcome[]> {
    if (asked.length === 0) {
        return [];
    }

    const rows: { file: string; state: string }[] = await prisma.postmortem.findMany({
        where: { treeId, file: { in: asked.map((one: ICargoStateAsk): string => one.key) } },
        select: { file: true, state: true },
    });
    const stored: Map<string, ECargoState> = new Map(
        rows.map((row: { file: string; state: string }): [string, ECargoState] => [row.file, cargoStateOf(row.state)])
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
                prisma.postmortem.update({
                    where: { treeId_file: { treeId, file: ask.key } },
                    data: cargoStateData(ask),
                    select: { id: true },
                })
            )
        );
    }

    return judged.map((one: { outcome: ICargoStateOutcome }): ICargoStateOutcome => one.outcome);
}

/** Разбор, каким его видит закрытие: признак, состояние и дерево, приславшее запись. */
interface IPostmortemForClose {
    id: string;
    state: string;
    tree: { slug: string };
}

/**
 * Закрыть разборы любых деревьев: перевести их в починенное либо выпущенное.
 *
 * Устроено тем же приёмом, что и закрытие предложений, и стоит здесь по той же причине, по
 * которой здесь стоит правка деревом: таблицу правит тот домен, чья она. Запись ищется признаком
 * из чтения, а не именем файла: одно и то же имя лежит у нескольких деревьев, и названное именем
 * закрытие попало бы не в ту запись.
 */
export async function closePostmortems(prisma: PrismaService, asked: readonly ICargoStateAsk[]): Promise<ICargoCloseOutcome[]> {
    if (asked.length === 0) {
        return [];
    }

    const rows: IPostmortemForClose[] = await prisma.postmortem.findMany({
        where: { id: { in: asked.map((one: ICargoStateAsk): string => one.key) } },
        select: { id: true, state: true, tree: { select: { slug: true } } },
    });
    const stored: Map<string, IPostmortemForClose> = new Map(
        rows.map((row: IPostmortemForClose): [string, IPostmortemForClose] => [row.id, row])
    );
    const judged: { ask: ICargoStateAsk; outcome: ICargoCloseOutcome }[] = asked.map((ask: ICargoStateAsk) => {
        const found: IPostmortemForClose | undefined = stored.get(ask.key);
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
                prisma.postmortem.update({ where: { id: ask.key }, data: cargoCloseData(ask), select: { id: true } })
            )
        );
    }

    return judged.map((one: { outcome: ICargoCloseOutcome }): ICargoCloseOutcome => one.outcome);
}
