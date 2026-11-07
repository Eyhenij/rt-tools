/**
 * `POST /api/intake/metrics` — строка дня одной рабочей копии: только числа.
 *
 * Дерево отправляет её само, без команды человека, поэтому отказ называется кодом: отправитель
 * пишет код в след своей отправки. Строка не копится, а замещается: повторная отправка дня итог не
 * меняет, а более старая строка не заменяет более новую.
 */
import { BadRequestException, Body, ConflictException, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { writeMetricsDay } from '@rt/message-bus-api/observations/data-access';
import {
    IMetricsDayFault,
    IParsedMetricsDay,
    isMetricsDayFault,
    METRICS_DAY_FIELDS,
    parseMetricsDay,
} from '@rt/message-bus-api/observations/util';
import { IMetricsDayAccepted } from '@rt-tools/agent-kit/cargo';
import { TreeOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import { cargoFault, cargoFaultMessage, ERefusal, ICargoFault, IIntakeResponse, refusalBody, TCargoBody } from '@rt/message-bus-common';

/** Как род груза зовётся в отказе. */
const CARGO_KIND: string = 'строка дня';

@Controller('intake')
export class MetricsIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('metrics')
    @TreeOperation()
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IMetricsDayAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, METRICS_DAY_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        // Проверка головы уже прошла, и тело здесь — набор полей: `cargoFault` отбил бы остальное
        const parsed: IParsedMetricsDay | IMetricsDayFault = parseMetricsDay(body as TCargoBody);

        if (isMetricsDayFault(parsed)) {
            throw new BadRequestException(refusalBody(ERefusal.MetricsFieldRefused, { field: parsed.field }));
        }
        if (!(await writeMetricsDay(this.#prisma, { ...parsed, treeId: tree.id }))) {
            throw new ConflictException(refusalBody(ERefusal.MetricsStale, { day: parsed.day }));
        }

        // День лёг на место прежнего: заведение от правки отправителю знать незачем
        response.status(HttpStatus.OK);

        return { tree: tree.slug, day: parsed.day };
    }
}
