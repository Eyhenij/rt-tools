/**
 * Учётные записи — всё, что домен читает из базы и пишет в неё. Входом человека ведает Keycloak.
 *
 * Записи учётных записей делают операции раздела людей: правки —
 * заведение, новый пароль, отключение — зовутся из разных операций и лежат поэтому здесь.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPersonSource, personRowOf } from '@rt/message-bus-api/accounts/util';
import { IPage, IPageAsked, IPersonView, pageSkip, TPageDirection } from '@rt/message-bus-common';

/** Учётная запись, которую заводят: имя, его приведённый вид и хеш пароля. */
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
