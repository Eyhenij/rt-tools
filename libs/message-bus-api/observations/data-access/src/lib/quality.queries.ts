/**
 * Чтение раздела «Качество». Счёт живёт в `qualityOf`, здесь только строки для него.
 *
 * Разборы и переходы читаются целиком, а не за период: повтор считается от фикса, а фикс мог быть
 * раньше любого спрошенного периода.
 */
import { IQualityDayRow, IQualityFirstSeen, IQualityInput, IQualityRecord, qualityFreshFrom } from '@rt/message-bus-api/observations/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ECargoKind, ITreeChoice } from '@rt/message-bus-common';

/** Период и сужение, какими их спросили. */
export type TQualityAsked = Pick<IQualityInput, 'from' | 'to' | 'today' | 'tree' | 'version' | 'page' | 'size'>;

interface IStoredTree extends ITreeChoice {
    readonly id: string;
}

interface IStoredDayRow {
    readonly day: string;
    readonly version: string;
    readonly metrics: unknown;
    readonly tree: ITreeChoice;
}

interface IStoredRecord {
    readonly id: string;
    readonly resource: string | null;
    readonly arrivedAt: Date;
    readonly releaseVersion: string | null;
    readonly tree: { readonly slug: string };
}

interface IStoredTransition {
    readonly recordId: string;
    readonly at: Date;
}

interface IStoredVersion {
    readonly treeId: string;
    readonly version: string;
    readonly _min: { readonly day: string | null };
}

function dayOf(moment: Date): string {
    return moment.toISOString().slice(0, 10);
}

function dayRowOf(row: IStoredDayRow): IQualityDayRow {
    return { tree: row.tree, day: row.day, version: row.version, metrics: row.metrics as Readonly<Record<string, number>> };
}

async function dayRows(prisma: PrismaService, from: string, to: string): Promise<readonly IQualityDayRow[]> {
    const rows: readonly IStoredDayRow[] = await prisma.metricsDay.findMany({
        where: { day: { gte: from, lte: to } },
        select: { day: true, version: true, metrics: true, tree: { select: { slug: true, name: true } } },
    });

    return rows.map(dayRowOf);
}

/** Первый приход к фиксу: возврат записи назад момент не сдвигает. */
function fixedDays(moves: readonly IStoredTransition[]): ReadonlyMap<string, string> {
    const fixed: Map<string, string> = new Map();

    for (const move of moves) {
        if (!fixed.has(move.recordId)) {
            fixed.set(move.recordId, dayOf(move.at));
        }
    }

    return fixed;
}

async function records(prisma: PrismaService): Promise<readonly IQualityRecord[]> {
    const [stored, moves]: [readonly IStoredRecord[], readonly IStoredTransition[]] = await Promise.all([
        prisma.postmortem.findMany({
            select: { id: true, resource: true, arrivedAt: true, releaseVersion: true, tree: { select: { slug: true } } },
        }),
        prisma.recordTransition.findMany({
            where: { kind: ECargoKind.Postmortem, state: { in: ['fixed', 'released'] } },
            orderBy: { at: 'asc' },
            select: { recordId: true, at: true },
        }),
    ]);
    const fixed: ReadonlyMap<string, string> = fixedDays(moves);

    return stored.map((row: IStoredRecord): IQualityRecord => ({
        id: row.id,
        tree: row.tree.slug,
        resource: row.resource,
        arrived: dayOf(row.arrivedAt),
        releaseVersion: row.releaseVersion,
        fixed: fixed.get(row.id) ?? null,
    }));
}

async function firstSeen(prisma: PrismaService, trees: readonly IStoredTree[]): Promise<readonly IQualityFirstSeen[]> {
    return (await prisma.metricsDay.groupBy({ by: ['treeId', 'version'], _min: { day: true } })).map(
        (row: IStoredVersion): IQualityFirstSeen => ({
            tree: trees.find((tree: IStoredTree): boolean => tree.id === row.treeId)?.slug ?? '',
            version: row.version,
            day: row._min.day ?? '',
        })
    );
}

/** Всё, что нужно счёту раздела. */
export async function readQualityInput(prisma: PrismaService, asked: TQualityAsked): Promise<IQualityInput> {
    const trees: readonly IStoredTree[] = await prisma.tree.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, slug: true, name: true },
    });
    const [rows, fresh, stored, seen, lines]: [
        readonly IQualityDayRow[],
        readonly IQualityDayRow[],
        readonly IQualityRecord[],
        readonly IQualityFirstSeen[],
        number,
    ] = await Promise.all([
        dayRows(prisma, asked.from, asked.to),
        dayRows(prisma, qualityFreshFrom(asked.today), asked.today),
        records(prisma),
        firstSeen(prisma, trees),
        prisma.metricsDay.count(),
    ]);

    return {
        ...asked,
        rows,
        fresh,
        records: stored,
        firstSeen: seen,
        anyLine: lines > 0,
        trees: trees.map((tree: IStoredTree): ITreeChoice => ({ slug: tree.slug, name: tree.name })),
    };
}
