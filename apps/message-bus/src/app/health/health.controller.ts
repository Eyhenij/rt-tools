import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/**
 * Проба живости. Отвечает только тогда, когда отвечает и хранилище: служба считается поднятой,
 * когда она выполнила задание, а не когда сообщила о готовности.
 *
 * В ответе нет ни редакции, ни имён составных частей: всё сверх «поднята» — подсказка тому, кто
 * ищет вход. Токена проба не требует — это единственная открытая операция приёмника.
 */
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    public async check(): Promise<{ status: string }> {
        const alive: boolean = await this.prisma.isAlive();

        if (!alive) {
            throw new ServiceUnavailableException('служба не готова');
        }

        return { status: 'ok' };
    }
}
