/**
 * Счёт неудачных попыток входа подряд — по одному на имя учётной записи.
 *
 * Живёт в памяти службы, а не в хранилище: счёт нужен ровно на время перебора, а запись о каждой
 * промашке в базе делала бы из перебора нагрузку на хранилище — ровно то, чем перебор и вредит.
 * Цена — перезапуск службы счёт обнуляет; перебору это стоит ожидания одного подъёма, а стоило бы
 * колонки в таблице, которую никто не читает.
 *
 * Имена, о которых давно не спрашивали, забываются: без этого память растёт с каждым новым
 * выдуманным именем, и наполнить её может кто угодно снаружи.
 */
import { Injectable } from '@nestjs/common';

import { LOGIN_ATTEMPT_TTL_MS } from '@rt/message-bus-api/accounts/util';

/** Что помнится об одном имени: сколько неудач подряд и когда была последняя. */
interface IAttemptCount {
    count: number;
    at: Date;
}

@Injectable()
export class LoginAttemptsService {
    readonly #failures: Map<string, IAttemptCount> = new Map();

    /**
     * Записать неудачу и сказать, сколько их подряд, считая эту.
     *
     * Момент приходит доводом, а не читается часами машины: по нему решается, устарел ли прежний
     * счёт, и проверять это подкруткой времени вокруг спеки было бы нечем.
     */
    public failed(nameKey: string, at: Date): number {
        this.#forget(at);

        const known: IAttemptCount | undefined = this.#failures.get(nameKey);
        const count: number = known && !this.#stale(known, at) ? known.count + 1 : 1;

        this.#failures.set(nameKey, { count, at });

        return count;
    }

    /** Удачный вход стирает счёт: удлинять ответ тому, кто вспомнил пароль, не за что. */
    public passed(nameKey: string): void {
        this.#failures.delete(nameKey);
    }

    /** Сколько неудач подряд помнится об имени. Ноль — не помнится ничего. */
    public counted(nameKey: string, at: Date): number {
        const known: IAttemptCount | undefined = this.#failures.get(nameKey);

        return known && !this.#stale(known, at) ? known.count : 0;
    }

    #stale(known: IAttemptCount, at: Date): boolean {
        return at.getTime() - known.at.getTime() > LOGIN_ATTEMPT_TTL_MS;
    }

    /** Забыть имена, о которых давно не спрашивали: иначе память растёт от выдуманных имён. */
    #forget(at: Date): void {
        for (const [nameKey, known] of this.#failures) {
            if (this.#stale(known, at)) {
                this.#failures.delete(nameKey);
            }
        }
    }
}
