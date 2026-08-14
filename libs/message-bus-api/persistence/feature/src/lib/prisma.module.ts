import { Global, Module } from '@nestjs/common';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/**
 * Клиент хранилища виден всем доменам приёмника: соединение одно на приложение, и второй
 * экземпляр держал бы свой пул соединений к той же базе.
 */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
