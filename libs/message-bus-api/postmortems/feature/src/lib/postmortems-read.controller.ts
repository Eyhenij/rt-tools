/**
 * `GET /api/postmortems` и `GET /api/postmortems/:id` — чтение принятых разборов происшествий.
 *
 * Обе операции закрыты входом человека: токен дерева админки не открывает, иначе утёкший с
 * дерева токен читал бы груз всех деревьев. Вошедший при этом видит груз всех деревьев — учётная
 * запись принадлежит службе, а не дереву, и отбор сужает показанное, а не доступ.
 *
 * Список текста разборов не несёт, а чтение одной записи несёт: разбор приезжает целиком, и
 * страница, несущая тексты всех своих строк, растёт весом без предела.
 */
import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemFullRow, IPostmortemListRow, readPostmortem, readPostmortems } from '@rt/message-bus-api/postmortems/data-access';

import { cargoPageAsked, cargoPageFault, ERefusal, IPage, POSTMORTEM_SORTABLE, refusalBody } from '@rt/message-bus-common';

@Controller('postmortems')
export class PostmortemsReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница разборов.
     *
     * Выборка, которая не разобралась, отбивается с именем параметра и его границами; страница
     * за пределом списка отказом не считается — список, укоротившийся между двумя запросами,
     * обычное дело, и отказ на это читался бы как поломка.
     */
    @Get()
    @RequiresRight('postmortems:read')
    public async page(@Query() query: Record<string, unknown>): Promise<IPage<IPostmortemListRow>> {
        const fault: string | null = cargoPageFault(query, POSTMORTEM_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return readPostmortems(this.#prisma, cargoPageAsked(query, POSTMORTEM_SORTABLE));
    }

    /** Один разбор целиком. Записи, которой нет, отвечает отказ, а не пустая панель. */
    @Get(':id')
    @RequiresRight('postmortems:read')
    public async one(@Param('id') id: string): Promise<IPostmortemFullRow> {
        const found: IPostmortemFullRow | null = await readPostmortem(this.#prisma, id);

        if (!found) {
            throw new NotFoundException(refusalBody(ERefusal.PostmortemNotFound));
        }

        return found;
    }
}
