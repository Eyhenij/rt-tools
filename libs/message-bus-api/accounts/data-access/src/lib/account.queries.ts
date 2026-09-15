/**
 * Учётные записи и входы — всё, что домен читает из базы и пишет в неё.
 *
 * Вход ищется по хешу, а не перебором строк: хеш уникален в хранилище, и поиск равенством идёт
 * индексом. Перебор со сверкой в коде стоил бы прохода по всем живым входам на каждом запросе
 * всякого раздела.
 *
 * Записи учётных записей делают команды строки запуска и операции раздела людей: одни и те же
 * правки — заведение, новый пароль, отключение — зовутся с двух сторон, и лежат поэтому здесь.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IAccountSummaryRow, IPersonSource, IRequestAccount, personRowOf } from '@rt/message-bus-api/accounts/util';
import { IPage, IPageAsked, IPersonView, pageSkip, TPageDirection } from '@rt/message-bus-common';

/** Учётная запись, которую заводит команда: имя, его приведённый вид и хеш пароля. */
export interface INewAccount {
    readonly name: string;
    readonly nameKey: string;
    readonly passwordHash: string;
}

/** Запись, найденная по имени для входа: хеш пароля и признак отключения. */
export interface IAccountForLogin {
    readonly id: string;
    readonly name: string;
    readonly passwordHash: string;
    readonly disabledAt: Date | null;
}

/** Вход, найденный по хешу куки: чей он, когда истекает и не оборван ли. */
export interface ISessionForRequest {
    readonly id: string;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
    readonly account: { readonly id: string; readonly name: string; readonly disabledAt: Date | null };
}

/** Учётная запись по приведённому имени. Пусто — записи с таким именем нет. */
export async function findAccountByNameKey(prisma: PrismaService, nameKey: string): Promise<IAccountForLogin | null> {
    return prisma.account.findUnique({
        where: { nameKey },
        select: { id: true, name: true, passwordHash: true, disabledAt: true },
    });
}

/**
 * Заведение записи.
 *
 * Уникальность имени держит хранилище: проверка чтением её не заменяет — две команды, запущенные
 * подряд, разошлись бы между чтением и записью.
 */
export async function createAccount(prisma: PrismaService, account: INewAccount): Promise<void> {
    await prisma.account.create({ data: { ...account } });
}

/** Смена пароля. Прежние входы при этом не обрываются: пароль сменил их владелец, а не чужой. */
export async function replaceAccountPassword(prisma: PrismaService, id: string, passwordHash: string): Promise<void> {
    await prisma.account.update({ where: { id }, data: { passwordHash } });
}

/**
 * Отключение записи и обрыв её живых входов одной правкой.
 *
 * Порознь это два состояния, между которыми отключённая запись читает груз: обрыв, отставший от
 * отключения на один запрос, — тот же открытый доступ, только короче.
 */
export async function disableAccount(prisma: PrismaService, id: string, at: Date): Promise<number> {
    const [, sessions]: [unknown, { count: number }] = await prisma.$transaction([
        prisma.account.update({ where: { id }, data: { disabledAt: at } }),
        prisma.session.updateMany({ where: { accountId: id, revokedAt: null }, data: { revokedAt: at } }),
    ]);

    return sessions.count;
}

/** Поля строки раздела людей: то, из чего собирается ответ операций и страница списка. */
const PERSON_SELECT: { name: true; disabledAt: true; lastLoginAt: true; role: { select: { name: true } } } = {
    name: true,
    disabledAt: true,
    lastLoginAt: true,
    role: { select: { name: true } },
};

/**
 * Строка раздела людей по приведённому имени. Пусто — записи с таким именем нет.
 *
 * Ею отвечают операции правки: экран показывает то, что лежит в хранилище после правки, а не то,
 * что он послал.
 */
export async function findPersonByNameKey(prisma: PrismaService, nameKey: string): Promise<IPersonView | null> {
    const found: IPersonSource | null = await prisma.account.findUnique({ where: { nameKey }, select: PERSON_SELECT });

    return found ? personRowOf(found) : null;
}

/** Записи для списка команд: имя, состояние и время последнего входа. */
export async function listAccounts(prisma: PrismaService): Promise<IAccountSummaryRow[]> {
    return prisma.account.findMany({
        orderBy: { name: 'asc' },
        select: { name: true, disabledAt: true, lastLoginAt: true },
    });
}

/**
 * Первая ступень порядка людей. Вторая — всегда имя: оно уникально, и им запрос кончает порядок.
 *
 * Пустой последний вход уезжает в конец при любом направлении: хранилище кладёт пустоту первой
 * при убывании, и список открывался бы теми, кто не входил ни разу, — а спрашивают его о том,
 * кто ходит.
 */
type TPersonOrder =
    | { readonly lastLoginAt: { readonly sort: TPageDirection; readonly nulls: 'last' } }
    | { readonly disabledAt: { readonly sort: TPageDirection; readonly nulls: 'last' } }
    | { readonly name: TPageDirection };

/** Порядок по названному полю. Умолчание — последний вход: кто ходит, человеку нужнее. */
function orderOf(asked: IPageAsked): TPersonOrder {
    switch (asked.sort) {
        case 'name':
            return { name: asked.dir };
        case 'disabledAt':
            return { disabledAt: { sort: asked.dir, nulls: 'last' } };
        default:
            return { lastLoginAt: { sort: asked.dir, nulls: 'last' } };
    }
}

/**
 * Страница людей для раздела админки: то же самое плюс роль.
 *
 * Отдельной выборкой, а не доводом к списку команд: команда печатает в терминал и роли не знает,
 * и общая выборка возила бы роль туда, где её некуда деть.
 *
 * Приезжает страницей, как и остальные списки админки, хотя людей у приёмника десятки: страницу,
 * порядок и повтор чтения экрану даёт одна общая основа, и список, отвечающий не её формой,
 * пришлось бы читать в обход неё.
 */
export async function readPeople(prisma: PrismaService, asked: IPageAsked): Promise<IPage<IPersonView>> {
    const total: number = await prisma.account.count();
    const rows: IPersonSource[] = await prisma.account.findMany({
        select: PERSON_SELECT,
        orderBy: [orderOf(asked), { name: 'asc' }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return { rows: rows.map(personRowOf), page: asked.page, size: asked.size, total };
}

/** Сколько записей заведено. Спрашивается при старте: свежая служба говорит, что входить некем. */
export async function countAccounts(prisma: PrismaService): Promise<number> {
    return prisma.account.count();
}

/**
 * Заведение входа и отметка о том, что записью вошли.
 *
 * Обе правки одной транзакцией: время последнего входа, отставшее от самого входа, читается
 * командой списка как «этой записью не входили ни разу».
 */
export async function createSession(
    prisma: PrismaService,
    input: { accountId: string; hash: string; expiresAt: Date; at: Date }
): Promise<string> {
    const [session]: [{ id: string }, unknown] = await prisma.$transaction([
        prisma.session.create({
            data: { accountId: input.accountId, hash: input.hash, expiresAt: input.expiresAt },
            select: { id: true },
        }),
        prisma.account.update({ where: { id: input.accountId }, data: { lastLoginAt: input.at } }),
    ]);

    return session.id;
}

/**
 * Вход по хешу куки — вместе с записью, которой он принадлежит.
 *
 * Отключение записи читается здесь же: между отключением и следующим запросом иначе оставался бы
 * живой вход отключённого.
 */
export async function findSessionByHash(prisma: PrismaService, hash: string): Promise<ISessionForRequest | null> {
    return prisma.session.findUnique({
        where: { hash },
        select: {
            id: true,
            expiresAt: true,
            revokedAt: true,
            account: { select: { id: true, name: true, disabledAt: true } },
        },
    });
}

/**
 * Обрыв одного входа — того, которым пришли.
 *
 * Всех входов записи выход не обрывает: два браузера — два входа, и выход в одном не выбивает
 * человека там, где он ничего не делал.
 */
export async function revokeSession(prisma: PrismaService, id: string, at: Date): Promise<void> {
    await prisma.session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: at } });
}

/** Роль и точечные правки одной записи: то, из чего складываются права человека. */
export interface IAccountRights {
    readonly roleRights: readonly string[] | null;
    readonly edits: readonly { readonly right: string; readonly granted: boolean }[];
}

/** Строка, какой её отдаёт хранилище: роль отдельно, правки отдельно. */
interface IAccountRightsRow {
    readonly role: { readonly rights: string[] } | null;
    readonly permissions: readonly { readonly right: string; readonly granted: boolean }[];
}

/**
 * Права записи: набор её роли и точечные правки поверх него.
 *
 * Читается на каждом вызове операции, закрытой правом, а не берётся из выданного входа: вход
 * живёт часами и говорит только, кто пришёл. Снятое право иначе держало бы раздел открытым до
 * конца дня.
 *
 * Записи нет — пусто вместо отказа: решение принимает проверка доступа, и второй код отказа в
 * этом месте разошёлся бы с её собственным.
 */
export async function findAccountRights(prisma: PrismaService, accountId: string): Promise<IAccountRights | null> {
    const found: IAccountRightsRow | null = await prisma.account.findUnique({
        where: { id: accountId },
        select: { role: { select: { rights: true } }, permissions: { select: { right: true, granted: true } } },
    });

    return found ? { roleRights: found.role?.rights ?? null, edits: found.permissions } : null;
}

/** Вошедший для запроса: то, что кладётся в него проверкой входа. */
export function requestAccountOf(session: ISessionForRequest): IRequestAccount {
    return { id: session.account.id, name: session.account.name, sessionId: session.id };
}
