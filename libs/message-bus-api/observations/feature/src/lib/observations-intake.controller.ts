/**
 * `POST /api/intake/observations` — строки наблюдений дерева за отрезок прогона, по дням.
 *
 * В отличие от сводки, строки приёмник разбирает: по ним считает хранилище, и строка, которую
 * нечем посчитать, отбивает груз целиком. День одной рабочей копии ложится на место прежнего —
 * окна прогонов перекрываются по дням, и строка, оставшаяся от прошлого прогона, считалась бы
 * дважды.
 *
 * Дерево берётся у токена, признак копии — у груза: у одного дерева несколько рабочих копий с
 * общим признаком, и замещение по одному дереву стирало бы строки соседней.
 */
import { BadRequestException, Body, Controller, HttpStatus, PayloadTooLargeException, Post, Req, Res } from '@nestjs/common';

import {
    IObservationDayInput,
    IObservationRowInput,
    IObservationsWritten,
    replaceObservationDays,
} from '@rt/message-bus-api/observations/data-access';
import {
    EObservationsFault,
    IObservationsFault,
    IParsedObservationDay,
    IParsedObservationRow,
    IParsedObservations,
    isObservationsFault,
    OBSERVATIONS_FIELDS,
    observationLinesCap,
    observationsFaultMessage,
    parseObservationsCargo,
} from '@rt/message-bus-api/observations/util';
import { IObservationsAccepted } from '@rt-tools/agent-kit/cargo';
import { TreeOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import { cargoFault, cargoFaultMessage, ICargoFault, IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

/** Как род груза зовётся в отказе: дерево шлёт четыре рода и должно знать, какой из них отбит. */
const CARGO_KIND: string = 'наблюдения';

@Controller('intake')
export class ObservationsIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('observations')
    @TreeOperation()
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IObservationsAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, OBSERVATIONS_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        // Проверка головы уже прошла, и тело здесь — набор полей: `cargoFault` отбил бы всё
        // остальное первой же веткой
        const parsed: IParsedObservations | IObservationsFault = parseObservationsCargo(body as TCargoBody, observationLinesCap());

        if (isObservationsFault(parsed)) {
            throw this.#refusal(parsed);
        }

        const written: IObservationsWritten = await replaceObservationDays(this.#prisma, this.#daysOf(parsed, tree.id));

        // Дни легли на место прежних — это правка, а не заведение: `200` всегда
        response.status(HttpStatus.OK);

        return { tree: tree.slug, days: written.days, rows: written.rows };
    }

    /** Строк больше предела — `413`, как у веса; всё остальное в разборе — `400`. */
    #refusal(found: IObservationsFault): Error {
        const message: string = observationsFaultMessage(found);

        return found.kind === EObservationsFault.Lines ? new PayloadTooLargeException(message) : new BadRequestException(message);
    }

    /** Дни груза с деревом токена: разбор дерева не знает, хранилище без него не ищет. */
    #daysOf(parsed: IParsedObservations, treeId: string): readonly IObservationDayInput[] {
        return parsed.days.map((day: IParsedObservationDay): IObservationDayInput => ({
            treeId,
            origin: parsed.origin,
            day: day.day,
            rows: day.rows.map((row: IParsedObservationRow): IObservationRowInput => ({ ...row, treeId, origin: parsed.origin })),
        }));
    }
}
