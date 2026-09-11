/**
 * `GET /api/accounts` — список людей приёмника в админке.
 *
 * Список сам по себе говорит, кто дотягивается до груза, поэтому закрыт правом, а не одним
 * входом: вошедший без права не должен узнавать состав людей прямым запросом мимо экрана.
 *
 * Отдельным контроллером, а не операцией в том, что заводит вход: тот открыт без входа по
 * устройству, и держать рядом открытую операцию и закрытую правом значит решать про доступ
 * дважды в одном файле.
 */
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { readPeople } from '@rt/message-bus-api/accounts/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPersonView, pageAsked, pageFault, PERSON_SORTABLE } from '@rt/message-bus-common';

@Controller('accounts')
export class AccountsReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница людей: имя, роль, состояние записи и время последнего входа.
     *
     * Приезжает страницей, как и остальные списки админки, хотя людей у приёмника десятки:
     * страницу, порядок и повтор чтения экрану даёт одна общая основа, и список, отвечающий не её
     * формой, пришлось бы читать в обход неё.
     *
     * Неразобранная выборка отбивается отказом с именем параметра: «неверный запрос» без имени
     * означает, что причину ищут перебором.
     */
    @Get()
    @RequiresRight('accounts:read')
    public async page(@Query() query: Record<string, unknown>): Promise<IPage<IPersonView>> {
        const fault: string | null = pageFault(query, PERSON_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return readPeople(this.#prisma, pageAsked(query, PERSON_SORTABLE));
    }
}
