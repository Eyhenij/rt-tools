/**
 * Чтение списка людей приёмника.
 *
 * Список сам по себе говорит, кто дотягивается до груза, поэтому закрыт правом, а не одним
 * входом: вошедший без права не должен узнавать состав людей прямым запросом мимо экрана.
 *
 * Отдельным контроллером, а не операцией в том, что заводит вход: тот открыт без входа по
 * устройству, и держать рядом открытую операцию и закрытую правом значит решать про доступ
 * дважды в одном файле.
 */
import { Controller, Get } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { IPersonRow, readPeople } from '@rt/message-bus-api/accounts/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

@Controller('accounts')
export class AccountsReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Список людей: имя, роль, состояние записи и время последнего входа.
     *
     * Страницами не режется: людей у приёмника десятки, а не тысячи, и отбор с порядком раздел
     * пока не просит. Придёт — придёт вместе с ними, а не заранее пустым доводом.
     */
    @Get()
    @RequiresRight('accounts:read')
    public async page(): Promise<IPersonRow[]> {
        return readPeople(this.#prisma);
    }
}
