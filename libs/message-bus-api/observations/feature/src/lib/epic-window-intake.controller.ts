/**
 * `POST /api/intake/epic-windows` — окно эпика одной рабочей копии.
 *
 * Окно пересекает дни, и строка дня, заменяемая своим днём, разрезала бы его, поэтому у окна своя
 * операция. Окно замещает хранимое того же дерева, копии, эпика и момента открытия: дерево шлёт его
 * снова, пока эпик не выпущен, а более старое окно более новое не заменяет.
 */
import { BadRequestException, Body, ConflictException, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { writeEpicWindow } from '@rt/message-bus-api/observations/data-access';
import {
    EPIC_WINDOW_FIELDS,
    IEpicWindowFault,
    IParsedEpicWindow,
    isEpicWindowFault,
    parseEpicWindow,
} from '@rt/message-bus-api/observations/util';
import { TreeOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import { cargoFault, cargoFaultMessage, ERefusal, ICargoFault, IIntakeResponse, refusalBody, TCargoBody } from '@rt/message-bus-common';

/** Как род груза зовётся в отказе. */
const CARGO_KIND: string = 'окно эпика';

/** Ответ приёма: дерево и эпик принятого окна. */
export interface IEpicWindowAccepted {
    readonly tree: string;
    readonly epic: number;
}

@Controller('intake')
export class EpicWindowIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('epic-windows')
    @TreeOperation()
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IEpicWindowAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, EPIC_WINDOW_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        // Проверка головы уже прошла, и тело здесь — набор полей: `cargoFault` отбил бы остальное
        const parsed: IParsedEpicWindow | IEpicWindowFault = parseEpicWindow(body as TCargoBody, new Date());

        if (isEpicWindowFault(parsed)) {
            throw new BadRequestException(refusalBody(ERefusal.EpicWindowFieldRefused, { field: parsed.field }));
        }
        if (!(await writeEpicWindow(this.#prisma, { ...parsed, treeId: tree.id }))) {
            throw new ConflictException(refusalBody(ERefusal.MetricsStale, { day: parsed.openedAt.toISOString().slice(0, 10) }));
        }

        // Окно легло на место прежнего: заведение от правки отправителю знать незачем
        response.status(HttpStatus.OK);

        return { tree: tree.slug, epic: parsed.epic };
    }
}
