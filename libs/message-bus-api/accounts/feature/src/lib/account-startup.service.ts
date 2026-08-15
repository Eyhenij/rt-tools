/**
 * Что служба говорит о учётных записях, когда поднимается.
 *
 * Свежий узел без единой записи иначе выглядит поломкой входа: любая пара отбивается тем же
 * отказом, что и неверная, — так обещает правило об отказе входа, — и отличить «ты ошибся» от
 * «заводить некого» нечем ни на экране, ни в журнале.
 *
 * Строка уходит отдельным поставщиком, а не телом модуля: модуль объявляет состав, а не делает
 * работу, и запрос к хранилищу в его конструкторе поднимался бы вместе с составом команд, где
 * ни порта, ни входа нет вовсе.
 */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { countAccounts } from '@rt/message-bus-api/accounts/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Источник строки лога: подъём службы. */
const LOG_CONTEXT: string = 'Bootstrap';

@Injectable()
export class AccountStartupService implements OnApplicationBootstrap {
    readonly #log: Logger = new Logger(LOG_CONTEXT);
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Строка пишется, только когда записей нет ни одной.
     *
     * Уровень — предупреждение: служба поднялась и работает, но читать принятое пока некому, и
     * это состояние, которое владелец должен увидеть, не разглядывая вывод целиком.
     *
     * Отказ хранилища здесь не ловится: он поднимется наверх и остановит подъём — служба,
     * поднявшаяся без базы, отвечала бы отказом на каждый запрос, называясь при этом живой.
     */
    public async onApplicationBootstrap(): Promise<void> {
        const counted: number = await countAccounts(this.#prisma);

        if (counted === 0) {
            this.#log.warn('учётных записей нет ни одной: заводятся командой message-bus account:add <имя>');
        }
    }
}
