/**
 * Запись месяца: одна на пару «дерево — месяц». Нашлась — обновляется, не нашлась — заводится.
 *
 * Уникальность держит хранилище, а не проверка чтением: два прогона одного дерева приезжают
 * одновременно, и проверка их не развела бы. Проигравший гонку не отказывает, а обновляет
 * запись победителя — отказ на ожидаемом случае терял бы прогон.
 *
 * Запись заводится и предложениями, приехавшими раньше сводки: порядок запросов прогона
 * приёмник не назначает, а отказ «сводки ещё не было» превратил бы порядок в скрытое требование.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';
import { TCargoBody } from '@rt/message-bus-common';

/** Чем кончилась запись: куда лёг груз и завела ли его эта операция. */
export interface IMonthRecordWritten {
    readonly id: string;
    readonly month: string;
    /** Запись месяца заведена этим запросом, а не обновлена. */
    readonly created: boolean;
}

/** Что знает о прогоне всякий род груза: чьё дерево, какой месяц, какой версией назвался. */
export interface IMonthRecordInput {
    readonly treeId: string;
    readonly month: string;
    readonly schema: string;
    readonly ranAt: Date;
}

/**
 * Была ли запись до этого прогона.
 *
 * Читается ДО записи: `upsert` не говорит, завёл он строку или обновил, а ответ приёмника
 * называет это дереву кодом. Цена — один лишний запрос на прогон; проигравший гонку прочитает
 * «не было» и ответит как заводящий, но запись при этом останется одна, и это ровно то, что
 * обещано.
 */
async function existedBefore(prisma: PrismaService, treeId: string, month: string): Promise<boolean> {
    const found: { id: string } | null = await prisma.monthRecord.findUnique({
        where: { treeId_month: { treeId, month } },
        select: { id: true },
    });

    return found !== null;
}

/**
 * Сводка последнего прогона замещает прежнюю целиком.
 *
 * Счётчики, снимок надстроек и невыбранное берутся из последнего прогона: отрезок сводки короче
 * месяца, окна прогонов перекрываются, и сложение завышало бы числа молча, а повтор после
 * обрыва связи — удваивал.
 */
export async function writeMonthSummary(
    prisma: PrismaService,
    input: IMonthRecordInput & { summary: TCargoBody }
): Promise<IMonthRecordWritten> {
    const existed: boolean = await existedBefore(prisma, input.treeId, input.month);
    // Приведение одно и стоит здесь, на границе с хранилищем: тело сводки приехало снаружи, и
    // формы у него нет никакой — колонка `jsonb` принимает его как есть, а тип генератора
    // описывает то же самое своими именами.
    const summary: Prisma.InputJsonObject = input.summary as Prisma.InputJsonObject;

    const record: { id: string } = await prisma.monthRecord.upsert({
        where: { treeId_month: { treeId: input.treeId, month: input.month } },
        create: {
            treeId: input.treeId,
            month: input.month,
            summary,
            schema: input.schema,
            ranAt: input.ranAt,
        },
        update: { summary, schema: input.schema, ranAt: input.ranAt },
        select: { id: true },
    });

    return { id: record.id, month: input.month, created: !existed };
}

/**
 * Запись месяца под груз, который сводкой не является.
 *
 * Сводку не трогает вовсе: предложение, приехавшее вторым прогоном, не должно стирать картину,
 * снятую первым. Время прогона при этом сдвигается — по нему видно, отчитывается ли дерево, а
 * отчитывается оно и предложениями тоже.
 */
export async function ensureMonthRecord(prisma: PrismaService, input: IMonthRecordInput): Promise<IMonthRecordWritten> {
    const existed: boolean = await existedBefore(prisma, input.treeId, input.month);

    const record: { id: string } = await prisma.monthRecord.upsert({
        where: { treeId_month: { treeId: input.treeId, month: input.month } },
        create: { treeId: input.treeId, month: input.month, schema: input.schema, ranAt: input.ranAt },
        update: { schema: input.schema, ranAt: input.ranAt },
        select: { id: true },
    });

    return { id: record.id, month: input.month, created: !existed };
}
