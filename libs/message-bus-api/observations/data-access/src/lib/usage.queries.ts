/**
 * Использование правил: сколько раз и в скольких сессиях дерево грузило каждый скил за период.
 *
 * Считает хранилище, не строки в памяти: дерево за год держит сотни тысяч строк, а сгруппированные
 * хранилищем они отвечают одним запросом. Клиент хранилища отдельных сессий не считает, поэтому
 * запрос идёт своим текстом; имена столбцов — как в схеме хранилища.
 *
 * Дерево названо признаком, как в списке сводок; период — двумя днями включительно, оба уже
 * проверены до вызова.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';

/** Строка использования одного скила: загрузки, сессии с загрузкой, отказы гейта правил. */
export interface IUsageRow {
    readonly skill: string;
    /** Род скила: правило, паттерн, скил пакета, свой скил дерева. */
    readonly kind: string;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
}

/** Одна сессия одного скила: день, признак сессии и сколько раз она его загрузила. */
export interface IUsageSessionRow {
    readonly day: string;
    readonly sid: string;
    readonly count: number;
}

/** Период, оба края включительно, дни `ГГГГ-ММ-ДД`. */
export interface IUsageAsked {
    readonly treeId: string;
    readonly from: string;
    readonly to: string;
}

/** Строка хранилища до приведения рода: у отказа гейта рода нет, а отказ всегда о правиле. */
interface IUsageRawRow {
    readonly skill: string;
    readonly kind: string | null;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
}

/** Род скила, о котором есть только отказы гейта: гейт правил отказывает по правилу. */
const KIND_OF_DENIED: string = 'rule';

/** Дерево по признаку: признак дерева называет запрос, хранилище ищет по нему. */
export async function findTreeIdBySlug(prisma: PrismaService, slug: string): Promise<string | null> {
    const found: { id: string } | null = await prisma.tree.findUnique({ where: { slug }, select: { id: true } });

    return found?.id ?? null;
}

/**
 * Использование скилов дерева за период: строка на скил, самые загружаемые первыми, при равных —
 * по имени. Скил с отказами и без загрузок тоже строка: это правило, которое никто не грузит.
 */
export async function readUsage(prisma: PrismaService, asked: IUsageAsked): Promise<readonly IUsageRow[]> {
    const rows: readonly IUsageRawRow[] = await prisma.$queryRaw<IUsageRawRow[]>(Prisma.sql`
        SELECT "res" AS "skill",
               MAX("skill") AS "kind",
               COUNT(*) FILTER (WHERE "ev" = 'skill-load')::int AS "loads",
               COUNT(DISTINCT "sid") FILTER (WHERE "ev" = 'skill-load')::int AS "sessions",
               COUNT(*) FILTER (WHERE "ev" = 'gate-deny')::int AS "denials"
        FROM "observation"
        WHERE "treeId" = ${asked.treeId}
          AND "day" >= ${asked.from}
          AND "day" <= ${asked.to}
          AND "ev" IN ('skill-load', 'gate-deny')
        GROUP BY "res"
        ORDER BY "loads" DESC, "skill" ASC
    `);

    return rows.map((row: IUsageRawRow): IUsageRow => ({ ...row, kind: row.kind ?? KIND_OF_DENIED }));
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
