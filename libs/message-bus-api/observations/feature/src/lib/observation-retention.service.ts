/**
 * Ночное снятие строк наблюдений старше срока хранения.
 *
 * Хранилище строк растёт на каждый прогон каждого дерева и само ничего не отдаёт: без снятия
 * таблица за год уходит в сотни тысяч строк на дерево, а чтение за период читает всё. Срок один
 * на все роды событий и считается от дня строки.
 *
 * Расписание — один таймер до ближайшего ночного часа, взводится заново после каждого снятия.
 * Планировщика в дереве нет, и одна ночная работа его не оправдывает: момент считает чистая
 * функция от «сейчас», и она проверяется вызовом.
 *
 * Отказ снятия — строка журнала, не падение службы: приём и чтение живут без снятия, а снятие
 * повторится следующей ночью.
 */
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

import { IObservationsSwept, sweepObservationsBefore } from '@rt/message-bus-api/observations/data-access';
import { keepSince, nextSweepAt } from '@rt/message-bus-api/observations/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Источник строки журнала: снятие строк наблюдений. */
const LOG_CONTEXT: string = 'ObservationRetention';

@Injectable()
export class ObservationRetentionService implements OnApplicationBootstrap, OnApplicationShutdown {
    readonly #log: Logger = new Logger(LOG_CONTEXT);
    readonly #prisma: PrismaService;

    #timer: NodeJS.Timeout | null = null;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    public onApplicationBootstrap(): void {
        this.arm();
    }

    public onApplicationShutdown(): void {
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }

    /**
     * Таймер до ближайшего ночного часа. Таймер не держит процесс: служба, у которой остался
     * один взведённый таймер, гаснет как обычно.
     */
    public arm(now: Date = new Date()): Date {
        const at: Date = nextSweepAt(now);

        this.#timer = setTimeout((): void => {
            void this.sweep().finally((): void => {
                this.arm();
            });
        }, at.getTime() - now.getTime());
        this.#timer.unref();

        return at;
    }

    /**
     * Снятие строк старше срока. Пишет строку журнала на каждое дерево, у которого что-то снято,
     * и одну строку, когда снимать было нечего: молчание читалось бы как «снятие не шло».
     */
    public async sweep(now: Date = new Date()): Promise<readonly IObservationsSwept[]> {
        const since: string = keepSince(now);

        try {
            const swept: readonly IObservationsSwept[] = await sweepObservationsBefore(this.#prisma, since);

            if (swept.length === 0) {
                this.#log.log('строк наблюдений старше срока нет', { since });
            }
            for (const one of swept) {
                this.#log.log('строки наблюдений старше срока сняты', { treeId: one.treeId, count: one.count, since });
            }

            return swept;
        } catch (error: unknown) {
            // Причина уходит подробностью строкой: журнал разбирает хвост вызова сам, а домен
            // наблюдений до разбора отказов не дотягивается по слоям
            this.#log.error('снятие строк наблюдений не состоялось', error instanceof Error ? error.message : String(error), { since });

            return [];
        }
    }
}
