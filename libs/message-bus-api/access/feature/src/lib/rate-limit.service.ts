/**
 * Счётчик обращений: где лежат отметки ограничителя частоты.
 *
 * В памяти приёма, а не в хранилище: предел стоит затем, чтобы таблица не росла со скоростью
 * отправителя, и класть ради него запись в ту же таблицу значило бы решать задачу ею же. Приём
 * поднят одним процессом — второго, у которого был бы свой счётчик, нет ни на проде, ни на
 * стенде.
 *
 * Отметки живут до перезапуска. Перезапуск сбрасывает окно, и это принято: он редок, а
 * ограничитель стоит против потока обращений, а не против того, кто ждёт перезапуска.
 *
 * Само решение здесь не считается — его считает чистая функция домена доступа. Служба только
 * помнит отметки и выбрасывает ключи, у которых их не осталось.
 */
import { Injectable } from '@nestjs/common';

import { IRateVerdict, rateVerdict, TRateMarks } from '@rt/message-bus-api/access/util';

@Injectable()
export class RateLimitService {
    readonly #marks: Map<string, TRateMarks> = new Map<string, TRateMarks>();

    /**
     * Пускать ли обращение с этого ключа.
     *
     * Ключ пустым не бывает: чем зовётся клиент, решает вызывающий, и «неизвестно» у него тоже
     * ключ — иначе неопознанные обращения обходили бы предел все разом.
     */
    public allow(key: string, at: Date): boolean {
        const verdict: IRateVerdict = rateVerdict(this.#marks.get(key) ?? [], at);

        if (verdict.marks.length === 0) {
            this.#marks.delete(key);
        } else {
            this.#marks.set(key, verdict.marks);
        }

        return verdict.allowed;
    }

    /** Сколько ключей сейчас под счётом. Читает это спека и сводка старта, а не решение. */
    public get size(): number {
        return this.#marks.size;
    }
}
