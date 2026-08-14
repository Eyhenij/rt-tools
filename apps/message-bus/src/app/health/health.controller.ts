import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Public } from '@rt/message-bus-api/trees/feature';

/**
 * Проба живости. Отвечает только тогда, когда отвечает и хранилище: служба считается поднятой,
 * когда она выполнила задание, а не когда сообщила о готовности.
 *
 * В ответе нет ни редакции, ни имён составных частей: всё сверх «поднята» — подсказка тому, кто
 * ищет вход. Токена проба не требует и объявляет это меткой: проверка токена закрыта по
 * умолчанию, и без метки проба отвечала бы отказом, как всякая незаявленная операция.
 */
@Controller('health')
@Public()
export class HealthController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Get()
    public async check(): Promise<{ status: string }> {
        const alive: boolean = await this.#prisma.isAlive();

        if (!alive) {
            throw new ServiceUnavailableException('служба не готова');
        }

        return { status: 'ok' };
    }
}
