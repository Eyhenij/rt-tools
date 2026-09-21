/**
 * Часы ответа площадки: отвечает ли оператор в эту минуту.
 *
 * Решение принимает сервис, а не виджет: часы названы в поясе площадки, а часы браузера
 * посетителя показывают его собственный пояс и врут о чужом. Виджет получает готовый ответ и
 * только говорит о нём словами.
 *
 * Минута приходит доводом, а не читается часами внутри: иначе проверить решение можно было бы
 * только ожиданием нужного часа.
 */

/** Часы ответа: минуты суток и пояс, в котором их считают. Равные концы — часы не названы. */
export interface IChatHours {
    readonly from: number;
    readonly to: number;
    /** Имя пояса базы поясов. Пусто — часы считаются по поясу узла. */
    readonly timeZone: string;
}

/** Сколько минут в сутках: по нему разворачивается отрезок через полночь. */
const DAY_MINUTES: number = 24 * 60;

/** Названы ли часы. Равные концы означают, что площадка их не называла и ничего не обещает. */
export function chatHoursNamed(hours: IChatHours): boolean {
    return hours.from !== hours.to;
}

/**
 * Минута суток в поясе площадки.
 *
 * Пояс приходит именем, а не сдвигом: сдвиг меняется дважды в год, и записанный числом он
 * половину года называет не тот час. Незнакомое имя пояса — пояс узла: отказывать здесь не за
 * что, площадка от этого чата не лишается.
 */
export function chatMinuteOfDay(at: Date, timeZone: string): number {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    try {
        const shown: string = new Intl.DateTimeFormat('en-GB', timeZone ? { ...options, timeZone } : options).format(at);
        const [hour, minute]: number[] = shown.split(':').map((part: string): number => Number(part));

        return hour * 60 + minute;
    } catch {
        return at.getHours() * 60 + at.getMinutes();
    }
}

/**
 * Отвечает ли оператор в эту минуту.
 *
 * Часы не названы — отвечает всегда: площадка, которая о них молчит, ничего и не обещала.
 * Отрезок через полночь развёрнут: «с 22 до 6» — это две части суток, а не пустота.
 */
export function chatAnswersAt(hours: IChatHours, at: Date): boolean {
    if (!chatHoursNamed(hours)) {
        return true;
    }

    const minute: number = chatMinuteOfDay(at, hours.timeZone) % DAY_MINUTES;

    return hours.from < hours.to ? minute >= hours.from && minute < hours.to : minute >= hours.from || minute < hours.to;
}
