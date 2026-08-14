/**
 * `POST /api/intake/proposals` — предложения дерева по слою правил.
 *
 * Кладёт к записи месяца те, которых в ней ещё не было. Запись заводится этой же операцией,
 * если сводка в этом месяце ещё не приезжала: порядок запросов прогона приёмник не назначает, а
 * отказ «сводки ещё не было» превратил бы порядок в скрытое требование.
 *
 * Негодная запись отбивает операцию целиком: список из пяти предложений, из которых упало
 * третье, оставил бы запись месяца в состоянии, которого не было ни до, ни после.
 */
import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { ensureMonthRecord, IMonthRecordWritten } from '@rt/message-bus-api/observations/data-access';
import { IIntakeAccepted } from '@rt-tools/agent-kit/cargo';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { addProposals, IProposalRow } from '@rt/message-bus-api/proposals/data-access';
import { PROPOSAL_ITEM_FIELDS, PROPOSALS_FIELDS } from '@rt/message-bus-api/proposals/util';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import {
    cargoFault,
    cargoFaultMessage,
    cargoItemFaultMessage,
    cargoItemsOf,
    cargoSchemaOf,
    faultyCargoItems,
    ICargoFault,
    IIntakeResponse,
    monthOf,
    TCargoBody,
} from '@rt/message-bus-common';

/** Как род груза зовётся в отказе: дерево шлёт три рода и должно знать, какой из них отбит. */
const CARGO_KIND: string = 'предложения';

/** Строка записи: поля уже проверены на наличие, здесь берётся их текст. */
function rowOf(item: TCargoBody): IProposalRow {
    return { text: String(item['text']), address: String(item['address']), resource: String(item['resource']) };
}

@Controller('intake')
export class ProposalsIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('proposals')
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IIntakeAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, PROPOSALS_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        const cargo: TCargoBody = body as TCargoBody;
        const items: TCargoBody[] = this.#itemsOf(cargo);
        const ranAt: Date = new Date();
        const written: IMonthRecordWritten = await this.#write(cargo, items, tree.id, ranAt);

        response.status(written.created ? HttpStatus.CREATED : HttpStatus.OK);

        return { tree: tree.slug, month: written.month, created: written.created };
    }

    /** Список записей и их форма. Проверяется до похода в базу: отбитая операция базы не касается. */
    #itemsOf(cargo: TCargoBody): TCargoBody[] {
        const items: TCargoBody[] | null = cargoItemsOf(cargo);

        if (!items) {
            throw new BadRequestException(`в грузе рода «${CARGO_KIND}» поле items ожидается списком записей`);
        }

        const faulty: { at: number; fields: string[] }[] = faultyCargoItems(items, PROPOSAL_ITEM_FIELDS);

        if (faulty.length > 0) {
            throw new BadRequestException(cargoItemFaultMessage(CARGO_KIND, faulty[0].at, faulty[0].fields));
        }

        return items;
    }

    /**
     * Запись месяца и предложения к ней.
     *
     * Отказ хранилища здесь не ловится: недоступную базу разбирает один разбор отказов на всё
     * приложение. Поймай его операция — каждая решала бы сама, что считать поломкой хранилища, и
     * три решения разошлись бы на первой же незнакомой ошибке.
     */
    async #write(cargo: TCargoBody, items: TCargoBody[], treeId: string, ranAt: Date): Promise<IMonthRecordWritten> {
        const record: IMonthRecordWritten = await ensureMonthRecord(this.#prisma, {
            treeId,
            month: monthOf(ranAt),
            schema: cargoSchemaOf(cargo),
            ranAt,
        });

        await addProposals(this.#prisma, record.id, items.map(rowOf));

        return record;
    }
}
