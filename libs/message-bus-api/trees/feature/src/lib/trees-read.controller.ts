/**
 * `GET /api/trees` — деревья для отбора в админке.
 *
 * Отдаёт признак и имя каждого: человек узнаёт своё дерево по имени, а сужается список
 * признаком — признак это хеш адреса репозитория, и по нему дерево не узнаётся.
 *
 * Операция закрыта входом человека, а не токеном дерева: токен открывает приём и только своего
 * дерева, а список называет все.
 */
import { Controller, Get } from '@nestjs/common';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { listTreeChoices } from '@rt/message-bus-api/trees/data-access';
import { ITreeChoice } from '@rt/message-bus-common';

@Controller('trees')
export class TreesReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Все деревья приёмника именами. Страницами не приезжают: их единицы, и отбор — один список выбора. */
    @Get()
    @SessionOperation()
    public async all(): Promise<ITreeChoice[]> {
        return listTreeChoices(this.#prisma);
    }
}
