/**
 * `POST /api/intake/postmortems` — разборы происшествий дерева.
 *
 * Заводит или обновляет их по именам файлов на дереве. Проверка на адрес дерева этот род груза
 * не накрывает: разбор по устройству называет файлы, где промах случился, и накрытая проверка
 * отбивала бы каждую отправку — требование стоит к отправителю, проверка живёт у него.
 *
 * Запись месяца разбор не заполняет, но заводит: ответ приёмника называет месяц, а время
 * прогона в записи говорит, отчитывается ли дерево вообще, — отчитывается оно и разборами тоже.
 */
import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { ensureMonthRecord, IMonthRecordWritten } from '@rt/message-bus-api/observations/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemRow, writePostmortems } from '@rt/message-bus-api/postmortems/data-access';
import { POSTMORTEM_ITEM_FIELDS, POSTMORTEMS_FIELDS } from '@rt/message-bus-api/postmortems/util';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import {
    cargoFault,
    cargoFaultMessage,
    cargoItemFaultMessage,
    cargoItemsOf,
    cargoSchemaOf,
    faultyCargoItems,
    ICargoFault,
    IIntakeAccepted,
    IIntakeResponse,
    monthOf,
    TCargoBody,
} from '@rt/message-bus-common';

/** Как род груза зовётся в отказе: дерево шлёт три рода и должно знать, какой из них отбит. */
const CARGO_KIND: string = 'разборы происшествий';

/** Строка записи: поля уже проверены на наличие, здесь берётся их текст. */
function rowOf(item: TCargoBody): IPostmortemRow {
    return { file: String(item['file']), text: String(item['text']) };
}

@Controller('intake')
export class PostmortemsIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('postmortems')
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IIntakeAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, POSTMORTEMS_FIELDS);

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

        const faulty: { at: number; fields: string[] }[] = faultyCargoItems(items, POSTMORTEM_ITEM_FIELDS);

        if (faulty.length > 0) {
            throw new BadRequestException(cargoItemFaultMessage(CARGO_KIND, faulty[0].at, faulty[0].fields));
        }

        return items;
    }

    /**
     * Запись месяца и разборы дерева.
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

        await writePostmortems(this.#prisma, treeId, items.map(rowOf));

        return record;
    }
}
