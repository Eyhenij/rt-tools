/**
 * Строки наблюдений: день одной рабочей копии замещается целиком, старое снимается по возрасту.
 *
 * Замещение идёт одной сделкой — снятие дня и вставка приехавших строк: между ними день стоял бы
 * пустым, и чтение в эту секунду отвечало бы «загрузок не было». Ключ замещения — пара «копия —
 * день» внутри дерева: у одного дерева несколько рабочих копий с общим признаком дерева, и
 * замещение по дереву стирало бы строки соседней копии.
 *
 * Снятие по возрасту не знает ни дерева, ни рода события: срок один на всё. Считает по деревьям,
 * потому что журнал называет число снятого по каждому — по нему видно, какое дерево шлёт.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Строка наблюдения, как ложится в хранилище: без своего id, его выдаёт хранилище. */
export interface IObservationRowInput {
    readonly treeId: string;
    readonly origin: string;
    readonly day: string;
    readonly t: Date;
    readonly ev: string;
    readonly res: string;
    readonly kind: string | null;
    readonly skill: string | null;
    readonly sid: string;
    readonly v: string;
}

/** Один день одной копии: что снимается и что ложится взамен. */
export interface IObservationDayInput {
    readonly treeId: string;
    readonly origin: string;
    readonly day: string;
    readonly rows: readonly IObservationRowInput[];
}

/** Чем кончилось замещение: сколько дней заменено и сколько строк легло. */
export interface IObservationsWritten {
    readonly days: number;
    readonly rows: number;
}

/** Сколько строк снято у одного дерева. */
export interface IObservationsSwept {
    readonly treeId: string;
    readonly count: number;
}

/** Строка ответа группировки: дерево и число его строк. */
interface IGroupedByTree {
    readonly treeId: string;
    readonly _count: { readonly _all: number };
}

/**
 * Дни груза ложатся на место прежних — все дни одной сделкой.
 *
 * Сделка одна на груз, а не на день: груз приезжает одним запросом и либо принят целиком, либо
 * не принят — половина дней, легшая при обрыве, читалась бы как полный прогон.
 */
export async function replaceObservationDays(prisma: PrismaService, days: readonly IObservationDayInput[]): Promise<IObservationsWritten> {
    await prisma.$transaction(
        days.flatMap((day: IObservationDayInput): unknown[] => [
            prisma.observation.deleteMany({ where: { treeId: day.treeId, origin: day.origin, day: day.day } }),
            prisma.observation.createMany({ data: [...day.rows] }),
        ]) as Parameters<PrismaService['$transaction']>[0]
    );

    return {
        days: days.length,
        rows: days.reduce((sum: number, day: IObservationDayInput): number => sum + day.rows.length, 0),
    };
}

/**
 * Снятие строк старше названного дня, по деревьям.
 *
 * Граница — день строки, не время приёма: дерево шлёт день по имени файла, и год считается от
 * него. Дни записаны `ГГГГ-ММ-ДД`, и сравнение строк у них хронологическое.
 */
export async function sweepObservationsBefore(prisma: PrismaService, day: string): Promise<readonly IObservationsSwept[]> {
    const grouped: readonly IGroupedByTree[] = await prisma.observation.groupBy({
        by: ['treeId'],
        where: { day: { lt: day } },
        _count: { _all: true },
    });

    if (grouped.length === 0) {
        return [];
    }

    await prisma.observation.deleteMany({ where: { day: { lt: day } } });

    return grouped.map((one: IGroupedByTree): IObservationsSwept => ({ treeId: one.treeId, count: one._count._all }));
}
