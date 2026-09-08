/**
 * `GET /api/proposals` и `GET /api/proposals/:id` — чтение принятых предложений по слою правил.
 *
 * Обе операции закрыты входом человека: токен дерева админки не открывает, иначе утёкший с
 * дерева токен читал бы груз всех деревьев. Вошедший при этом видит груз всех деревьев — учётная
 * запись принадлежит службе, а не дереву, и отбор сужает показанное, а не доступ.
 */
import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IProposalFullRow, IProposalListRow, readProposal, readProposals } from '@rt/message-bus-api/proposals/data-access';

import { IPage, PROPOSAL_SORTABLE, cargoPageAsked, cargoPageFault } from '@rt/message-bus-common';

@Controller('proposals')
export class ProposalsReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница предложений.
     *
     * Выборка, которая не разобралась, отбивается с именем параметра и его границами; страница
     * за пределом списка отказом не считается — список, укоротившийся между двумя запросами,
     * обычное дело, и отказ на это читался бы как поломка.
     */
    @Get()
    @RequiresRight('proposals:read')
    public async page(@Query() query: Record<string, unknown>): Promise<IPage<IProposalListRow>> {
        const fault: string | null = cargoPageFault(query, PROPOSAL_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return readProposals(this.#prisma, cargoPageAsked(query, PROPOSAL_SORTABLE));
    }

    /** Одно предложение целиком. Записи, которой нет, отвечает отказ, а не пустая панель. */
    @Get(':id')
    @RequiresRight('proposals:read')
    public async one(@Param('id') id: string): Promise<IProposalFullRow> {
        const found: IProposalFullRow | null = await readProposal(this.#prisma, id);

        if (!found) {
            throw new NotFoundException('предложения с таким признаком нет');
        }

        return found;
    }
}
