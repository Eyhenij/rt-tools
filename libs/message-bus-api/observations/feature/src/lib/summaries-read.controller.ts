/**
 * `GET /api/summaries` и `GET /api/summaries/:id` — чтение принятых записей месяца.
 *
 * Обе операции закрыты входом человека: токен дерева админки не открывает, иначе утёкший с
 * дерева токен читал бы груз всех деревьев. Вошедший при этом видит груз всех деревьев — учётная
 * запись принадлежит службе, а не дереву, и отбор сужает показанное, а не доступ.
 *
 * Список сводки целиком не несёт, а чтение одной записи несёт: сводка лежит телом произвольной
 * формы, и страница, несущая тела всех своих строк, растёт весом без предела.
 */
import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { IMonthRecordFullRow, IMonthRecordListRow, readMonthRecord, readMonthRecords } from '@rt/message-bus-api/observations/data-access';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, MONTH_RECORD_SORTABLE, pageAsked, pageFault } from '@rt/message-bus-common';

@Controller('summaries')
export class SummariesReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница записей месяца.
     *
     * Выборка, которая не разобралась, отбивается с именем параметра и его границами; страница
     * за пределом списка отказом не считается — список, укоротившийся между двумя запросами,
     * обычное дело, и отказ на это читался бы как поломка.
     */
    @Get()
    @RequiresRight('summaries:read')
    public async page(@Query() query: Record<string, unknown>): Promise<IPage<IMonthRecordListRow>> {
        const fault: string | null = pageFault(query, MONTH_RECORD_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return readMonthRecords(this.#prisma, pageAsked(query, MONTH_RECORD_SORTABLE));
    }

    /** Одна запись месяца целиком. Записи, которой нет, отвечает отказ, а не пустая панель. */
    @Get(':id')
    @RequiresRight('summaries:read')
    public async one(@Param('id') id: string): Promise<IMonthRecordFullRow> {
        const found: IMonthRecordFullRow | null = await readMonthRecord(this.#prisma, id);

        if (!found) {
            throw new NotFoundException('записи месяца с таким признаком нет');
        }

        return found;
    }
}
