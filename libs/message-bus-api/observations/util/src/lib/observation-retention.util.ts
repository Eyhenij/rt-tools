/**
 * Срок хранения строк наблюдений: год от дня строки, снятие раз в ночь.
 *
 * Решения здесь чистые и берут момент доводом: спека зовёт их с названным временем, а не крутит
 * часы вокруг себя. Умолчание «сейчас» стоит на границе — в службе, которая их зовёт.
 */

/** Сколько дней лежит строка. Срок один на все роды событий. */
export const OBSERVATION_KEEP_DAYS: number = 365;

/** Час и минута ночного снятия по всемирному времени: час без нагрузки, время читается в журнале. */
export const OBSERVATION_SWEEP_HOUR: number = 3;
export const OBSERVATION_SWEEP_MINUTE: number = 10;

const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

/** День в форме `ГГГГ-ММ-ДД` по всемирному времени. */
export function dayOf(moment: Date): string {
    return moment.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

/** Первый день, который ещё хранится: строки старше него снимаются. */
export function keepSince(now: Date, keepDays: number = OBSERVATION_KEEP_DAYS): string {
    return dayOf(new Date(now.getTime() - keepDays * MS_PER_DAY));
}

/** Момент ближайшего ночного снятия после названного: сегодня, если час ещё не прошёл, иначе завтра. */
export function nextSweepAt(now: Date): Date {
    const today: Date = new Date(now);
    today.setUTCHours(OBSERVATION_SWEEP_HOUR, OBSERVATION_SWEEP_MINUTE, 0, 0);

    return today.getTime() > now.getTime() ? today : new Date(today.getTime() + MS_PER_DAY);
}
