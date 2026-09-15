/**
 * Роли и доступ человека — всё, что раздел ролей читает из базы и пишет в неё.
 *
 * Лежит рядом с записями, а не в домене своём: роль — сторона доступа записи, и права записи
 * читаются тем же слоем на каждом вызове. Второй домен на две таблицы держал бы те же выборки
 * второй раз.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPageAsked, IPermissionEdit, IRoleView, isRight, pageSkip, TRight } from '@rt/message-bus-common';

/** Роль, какой её отдаёт хранилище: права строками и число записей вложенным счётом. */
interface IRoleRow {
    readonly key: string;
    readonly name: string;
    readonly rights: string[];
    readonly _count: { readonly accounts: number };
}

/** Поля строки роли: из них собирается и страница, и ответ операций правки. */
const ROLE_SELECT: { key: true; name: true; rights: true; _count: { select: { accounts: true } } } = {
    key: true,
    name: true,
    rights: true,
    _count: { select: { accounts: true } },
};

/**
 * Роль для админки. Строка не из набора прав выбрасывается здесь же: она либо опечатка, либо
 * остаток снятого права, и правом не считается нигде.
 */
function roleViewOf(row: IRoleRow): IRoleView {
    return { key: row.key, name: row.name, rights: row.rights.filter(isRight), people: row._count.accounts };
}

/** Роль, которую заводит или правит панель: ключ ставится при заведении и больше не меняется. */
export interface IRoleWrite {
    readonly name: string;
    readonly rights: readonly TRight[];
}

/**
 * Страница ролей для раздела админки.
 *
 * Приезжает страницей, хотя ролей у приёмника единицы: страницу, порядок и повтор чтения экрану
 * даёт одна общая основа, и список, отвечающий не её формой, пришлось бы читать в обход неё.
 * Порядок один — по имени: другого поля порядка у роли нет.
 */
export async function readRoles(prisma: PrismaService, asked: IPageAsked): Promise<IPage<IRoleView>> {
    const total: number = await prisma.role.count();
    const rows: IRoleRow[] = await prisma.role.findMany({
        select: ROLE_SELECT,
        orderBy: { name: asked.dir },
        skip: pageSkip(asked),
        take: asked.size,
    });

    return { rows: rows.map(roleViewOf), page: asked.page, size: asked.size, total };
}

/** Роль по ключу. Пусто — роли с таким ключом нет. */
export async function findRoleByKey(prisma: PrismaService, key: string): Promise<IRoleView | null> {
    const found: IRoleRow | null = await prisma.role.findUnique({ where: { key }, select: ROLE_SELECT });

    return found ? roleViewOf(found) : null;
}

/** Ключ и имя роли: то, по чему судится, занято ли имя. */
export interface IRoleName {
    readonly key: string;
    readonly name: string;
}

/** Ключи и имена всех ролей: по ним судится, занято ли имя, — сравнением приведённых имён. */
export async function listRoleNames(prisma: PrismaService): Promise<readonly IRoleName[]> {
    return prisma.role.findMany({ select: { key: true, name: true }, orderBy: { name: 'asc' } });
}

/** Заведение роли. Уникальность ключа и имени держит хранилище: проверка чтением её не заменяет. */
export async function createRole(prisma: PrismaService, key: string, role: IRoleWrite): Promise<void> {
    await prisma.role.create({ data: { key, name: role.name, rights: [...role.rights] } });
}

/** Имя и права роли целиком. Ключ не трогается: им на роль ссылаются адрес и засев. */
export async function updateRole(prisma: PrismaService, key: string, role: IRoleWrite): Promise<void> {
    await prisma.role.update({ where: { key }, data: { name: role.name, rights: [...role.rights] } });
}

/** Удаление роли. Держат ли её записи, решает вызывающий: хранилище сняло бы роль с них молча. */
export async function deleteRole(prisma: PrismaService, key: string): Promise<void> {
    await prisma.role.delete({ where: { key } });
}

/** Доступ записи, как его держит хранилище: роль отдельно, правки отдельно. */
export interface IAccountAccessRow {
    readonly id: string;
    readonly name: string;
    readonly role: { readonly key: string; readonly rights: string[] } | null;
    readonly permissions: readonly IPermissionEdit[];
}

/** Чем ищется запись: признаком либо приведённым именем. Оба уникальны в хранилище. */
export type TAccountLookup = { readonly id: string } | { readonly nameKey: string };

/**
 * Доступ записи: её роль с правами и точечные правки.
 *
 * Ищется и по признаку, и по имени: панель называет запись именем из адреса, а проверка
 * самозапирания — признаком вошедшего из запроса. Пусто — записи нет.
 */
export async function findAccountAccess(prisma: PrismaService, where: TAccountLookup): Promise<IAccountAccessRow | null> {
    return prisma.account.findUnique({
        where,
        select: {
            id: true,
            name: true,
            role: { select: { key: true, rights: true } },
            permissions: { select: { right: true, granted: true }, orderBy: { right: 'asc' } },
        },
    });
}

/** Роль, на которую ссылается запись: признак — им ставится ссылка, права — ими судится самозапирание. */
export interface IRoleRef {
    readonly id: string;
    readonly rights: string[];
}

/** Роль по ключу — признак и права. Пусто — роли нет. */
export async function findRoleRef(prisma: PrismaService, key: string): Promise<IRoleRef | null> {
    return prisma.role.findUnique({ where: { key }, select: { id: true, rights: true } });
}

/**
 * Замена доступа записи целиком: роль и все точечные правки одной транзакцией.
 *
 * Порознь это два состояния, между которыми запись держит старую роль с новыми правками, и
 * права, сложенные в эту секунду, не те, что назначали.
 */
export async function replaceAccountAccess(
    prisma: PrismaService,
    accountId: string,
    roleId: string | null,
    edits: readonly IPermissionEdit[]
): Promise<void> {
    await prisma.$transaction([
        prisma.account.update({ where: { id: accountId }, data: { roleId } }),
        prisma.accountPermission.deleteMany({ where: { accountId } }),
        prisma.accountPermission.createMany({
            data: edits.map((edit: IPermissionEdit): { accountId: string; right: string; granted: boolean } => ({
                accountId,
                right: edit.right,
                granted: edit.granted,
            })),
        }),
    ]);
}
