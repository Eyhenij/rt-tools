import { IRtChat } from './rt-chat.model';

const DAY_MS: number = 86_400_000;

/** Полночь того же дня по местному времени: дни ленты считаются по часам читателя */
function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Подпись дня над его первым сообщением: «сегодня» и «вчера» словами языка ленты, дальше дата.
 * Год пишется только у прошлых лет: в текущем он ничего не различает.
 */
export function rtChatDayLabel(date: Date, now: Date, locale: string): string {
    const today: Date = startOfDay(now);
    // Округление гасит час перевода часов: сутки на нём длиннее или короче на час
    const days: number = Math.round((startOfDay(date).getTime() - today.getTime()) / DAY_MS);
    if (days === 0 || days === -1) {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
    }
    const year: 'numeric' | undefined = date.getFullYear() === today.getFullYear() ? undefined : 'numeric';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: year }).format(date);
}

/** Сообщения, с которых в ленте начинается новый день, и подпись этого дня — по номеру сообщения */
export function rtChatDayLabels(messages: readonly IRtChat.Message[], now: Date, locale: string): ReadonlyMap<number | string, string> {
    const labels: Map<number | string, string> = new Map<number | string, string>();
    let previous: number = Number.NaN;
    for (const message of messages) {
        const date: Date = new Date(message.createdAt);
        const day: number = startOfDay(date).getTime();
        if (day !== previous) {
            labels.set(message.id, rtChatDayLabel(date, now, locale));
        }
        previous = day;
    }
    return labels;
}
