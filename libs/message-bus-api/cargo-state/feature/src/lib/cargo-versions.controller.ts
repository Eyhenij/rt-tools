/**
 * `GET /api/cargo/versions` — версии выпуска, встретившиеся в записях одного рода груза.
 *
 * Ими админка наполняет отбор по версии: набора версий, объявленного заранее, не существует — их
 * называет дерево при выпуске, — и перечислить в отборе можно только то, что уже лежит.
 *
 * Операция закрыта входом человека, а не токеном дерева: токен открывает приём и только своего
 * дерева, а версии собираются по всем сразу — одна и та же версия у двух деревьев это одно
 * значение отбора.
 *
 * Стоит в домене груза, а не в домене одного рода: родов два, отбор у них свой, и лежащий у
 * одного из них контроллер знал бы про чужую либу.
 */
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { readPostmortemVersions } from '@rt/message-bus-api/postmortems/data-access';
import { readProposalVersions } from '@rt/message-bus-api/proposals/data-access';
import { cargoKindFault, cargoKindOf, ECargoKind } from '@rt/message-bus-common';

@Controller('cargo')
export class CargoVersionsController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Встретившиеся версии рода груза, упорядоченные номерами.
     *
     * Род обязателен и умолчания не имеет: версии двух родов приезжают разными наборами, и
     * подставленный молча род показал бы в отборе одного раздела версии другого. Страницами
     * версии не приезжают: их десятки, и отбор это один список выбора.
     */
    @Get('versions')
    @SessionOperation()
    public async versions(@Query() query: Record<string, unknown>): Promise<readonly string[]> {
        const fault: string | null = cargoKindFault(query);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return cargoKindOf(query['kind']) === ECargoKind.Proposal
            ? readProposalVersions(this.#prisma)
            : readPostmortemVersions(this.#prisma);
    }
}
