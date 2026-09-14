/**
 * Использование правил: сколько раз и в скольких сессиях дерево грузило каждый скил за период.
 *
 * Считает хранилище, не строки в памяти: дерево за год держит сотни тысяч строк, а сгруппированные
 * хранилищем они отвечают одним запросом. Клиент хранилища отдельных сессий не считает, поэтому
 * запрос идёт своим текстом; имена столбцов — как в схеме хранилища.
 *
 * Дерево названо признаком, как в списке сводок; период — двумя днями включительно, оба уже
 * проверены до вызова. Страницу и порядок таблица скилов получает как всякий список админки:
 * раздел стоит на общей основе списка, и та читает страницу.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';
import { IPageAsked, IUsagePage, IUsageRow, IUsageSessionRow, pageSkip, USAGE_SORTABLE } from '@rt/message-bus-common';

/** Период, оба края включительно, дни `ГГГГ-ММ-ДД`. */
export interface IUsageAsked {
    readonly treeId: string;
    readonly from: string;
    readonly to: string;
}

/**
 * Выборка таблицы скилов: период и страница с порядком.
 *
 * Дерево здесь стоит дважды: признаком из запроса, как у всякой страничной выборки, и ключом
 * хранилища, найденным по признаку. Ищет хранилище по ключу; признак остаётся, потому что общая
 * выборка его несёт, а выкидывать поле из общего типа ради одного списка незачем.
 */
export interface IUsagePageAsked extends IUsageAsked, IPageAsked {}

/** Строка хранилища до приведения рода: у отказа гейта рода нет, а отказ всегда о правиле. */
interface IUsageRawRow {
    readonly skill: string;
    readonly kind: string | null;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
    /** Сколько всего строк у выборки: оконный счёт, один и тот же в каждой строке страницы. */
    readonly total: number;
}

/** Род скила, о котором есть только отказы гейта: гейт правил отказывает по правилу. */
const KIND_OF_DENIED: string = 'rule';

/**
 * Столбец порядка по имени поля. Имя вставляется в текст запроса как есть, поэтому берётся из
 * закрытого набора, а чужое имя падает на умолчание: набор сверен ещё разбором выборки.
 */
function orderColumn(sort: string): Prisma.Sql {
    return Prisma.raw(`"${USAGE_SORTABLE.includes(sort) ? sort : USAGE_SORTABLE[0]}"`);
}

/** Дерево по признаку: признак дерева называет запрос, хранилище ищет по нему. */
export async function findTreeIdBySlug(prisma: PrismaService, slug: string): Promise<string | null> {
    const found: { id: string } | null = await prisma.tree.findUnique({ where: { slug }, select: { id: true } });

    return found?.id ?? null;
}

/** Строка ответа из строки хранилища: род отказа приведён, оконный счёт снят. */
function usageRowOf(row: IUsageRawRow): IUsageRow {
    return { skill: row.skill, kind: row.kind ?? KIND_OF_DENIED, loads: row.loads, sessions: row.sessions, denials: row.denials };
}

/**
 * Страница использования скилов дерева за период: строка на скил, по умолчанию самые
 * загружаемые первыми, при равных — по имени. Скил с отказами и без загрузок тоже строка: это
 * правило, которое никто не грузит.
 *
 * Общее число строк считается тем же запросом оконным счётом поверх группировки: второй запрос
 * за счётом отвечал бы уже про другой список. Пустая страница числа не несёт — тогда оно ноль.
 */
export async function readUsage(prisma: PrismaService, asked: IUsagePageAsked): Promise<IUsagePage> {
    const rows: readonly IUsageRawRow[] = await prisma.$queryRaw<IUsageRawRow[]>(Prisma.sql`
        SELECT "res" AS "skill",
               MAX("skill") AS "kind",
               COUNT(*) FILTER (WHERE "ev" = 'skill-load')::int AS "loads",
               COUNT(DISTINCT "sid") FILTER (WHERE "ev" = 'skill-load')::int AS "sessions",
               COUNT(*) FILTER (WHERE "ev" = 'gate-deny')::int AS "denials",
               COUNT(*) OVER ()::int AS "total"
        FROM "observation"
        WHERE "treeId" = ${asked.treeId}
          AND "day" >= ${asked.from}
          AND "day" <= ${asked.to}
          AND "ev" IN ('skill-load', 'gate-deny')
        GROUP BY "res"
        ORDER BY ${orderColumn(asked.sort)} ${Prisma.raw(asked.dir === 'asc' ? 'ASC' : 'DESC')}, "skill" ASC
        LIMIT ${asked.size} OFFSET ${pageSkip(asked)}
    `);

    return {
        rows: rows.map(usageRowOf),
        total: rows[0]?.total ?? 0,
        page: asked.page,
        size: asked.size,
        from: asked.from,
        to: asked.to,
    };
}

/** Сессии одного скила за период: день, признак сессии, сколько раз; свежий день первым. */
export async function readUsageSessions(prisma: PrismaService, asked: IUsageAsked, skill: string): Promise<readonly IUsageSessionRow[]> {
    return prisma.$queryRaw<IUsageSessionRow[]>(Prisma.sql`
        SELECT "day", "sid", COUNT(*)::int AS "count"
        FROM "observation"
        WHERE "treeId" = ${asked.treeId}
          AND "res" = ${skill}
          AND "ev" = 'skill-load'
          AND "day" >= ${asked.from}
          AND "day" <= ${asked.to}
        GROUP BY "day", "sid"
        ORDER BY "day" DESC, "count" DESC, "sid" ASC
    `);
}
