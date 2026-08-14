import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@rt/message-bus-api/persistence/util';

/**
 * Клиент хранилища приёмника.
 *
 * Служба не только держит соединение, но и отвечает на вопрос, живо ли хранилище: проба живости
 * обязана молчать, пока база не отвечает, — служба считается поднятой, когда она выполнила
 * задание, а не когда сообщила о готовности.
 *
 * Свои строки лога клиент пишет в вывод, и дальше вывода они не идут: поломка хранилища иначе
 * порождает поток, который сам себя разгоняет.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    readonly #log: Logger = new Logger('Db');

    constructor() {
        super({
            adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] ?? '' }),
        });
    }

    public async onModuleInit(): Promise<void> {
        await this.$connect();
        this.#log.log('соединение с хранилищем открыто');
    }

    public async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }

    /**
     * Отвечает ли хранилище. Запрос самый дешёвый из возможных: пробу живости зовут часто, и её
     * цена не должна расти вместе с числом записей.
     */
    public async isAlive(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;

            return true;
        } catch (error: unknown) {
            this.#log.error(`хранилище не отвечает: ${error instanceof Error ? error.message : 'причина неизвестна'}`);

            return false;
        }
    }
}
