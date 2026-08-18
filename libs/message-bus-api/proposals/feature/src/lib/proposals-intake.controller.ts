/**
 * `POST /api/intake/proposals` — предложения дерева по слою правил.
 *
 * Кладёт к записи месяца те, которых у дерева ещё не было, и отвечает счётом: сколько легло и
 * сколько приехало повторно. Запись заводится этой же операцией, если сводка в этом месяце ещё
 * не приезжала: порядок запросов прогона приёмник не назначает, а отказ «сводки ещё не было»
 * превратил бы порядок в скрытое требование.
 *
 * Негодная запись отбивает операцию целиком: список из пяти предложений, из которых упало
 * третье, оставил бы запись месяца в состоянии, которого не было ни до, ни после.
 */
import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { ensureMonthRecord, IMonthRecordWritten } from '@rt/message-bus-api/observations/data-access';
import { IIntakeAccepted } from '@rt-tools/agent-kit/cargo';
import { TreeOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { addProposals, IProposalRow, IProposalsWritten } from '@rt/message-bus-api/proposals/data-access';
import { PROPOSAL_ITEM_FIELDS } from '@rt/message-bus-api/proposals/util';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import {
    CARGO_ITEMS_FIELDS,
    ICargoFault,
    IIntakeResponse,
    TCargoBody,
    cargoFault,
    cargoFaultMessage,
    cargoItemFaultMessage,
    cargoItemsOf,
    cargoSchemaOf,
    faultyCargoItems,
    monthOf,
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
    @TreeOperation()
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IIntakeAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, CARGO_ITEMS_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        const cargo: TCargoBody = body as TCargoBody;
        const items: TCargoBody[] = this.#itemsOf(cargo);
        const ranAt: Date = new Date();
        const written: IMonthRecordWritten = await this.#write(cargo, tree.id, ranAt);
        const laid: IProposalsWritten = await this.#lay(written.id, tree.id, items);

        response.status(written.created ? HttpStatus.CREATED : HttpStatus.OK);

        return { tree: tree.slug, month: written.month, created: written.created, added: laid.added, known: laid.known };
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
     * Запись месяца, к которой предложения крепятся.
     *
     * Отказ хранилища здесь не ловится: недоступную базу разбирает один разбор отказов на всё
     * приложение. Поймай его операция — каждая решала бы сама, что считать поломкой хранилища, и
     * три решения разошлись бы на первой же незнакомой ошибке.
     */
    async #write(cargo: TCargoBody, treeId: string, ranAt: Date): Promise<IMonthRecordWritten> {
        return ensureMonthRecord(this.#prisma, {
            treeId,
            ranAt,
            month: monthOf(ranAt),
            schema: cargoSchemaOf(cargo),
        });
    }

    /** Сами предложения. Счёт легшего и уже лежавшего уезжает ответом: повтор отказом не бывает. */
    async #lay(recordId: string, treeId: string, items: TCargoBody[]): Promise<IProposalsWritten> {
        return addProposals(this.#prisma, recordId, treeId, items.map(rowOf));
    }
}
