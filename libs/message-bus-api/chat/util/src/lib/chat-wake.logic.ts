/**
 * Будильник переписки: пора ли сказать приложению, что на разговор никто не ответил.
 *
 * Минута приходит доводом, а не читается часами внутри: иначе проверить решение можно было бы
 * только ожиданием нужного часа.
 *
 * Будит переписка один раз: минута последнего будильника лежит на ней, и снимает её ответ
 * оператора. Разговор, который будит каждую минуту, приложение научится не смотреть вовсе.
 */
import { chatAnswersAt, IChatHours } from './chat-hours.logic';

/** Что известно о переписке для решения о будильнике. */
export interface IChatWakeTalk {
    /** Через сколько минут без ответа переписка будит оператора. Ноль — будильник выключен. */
    readonly answerWithin: number;
    /** Минута последней реплики переписки. */
    readonly lastMessageAt: Date;
    /** Чья была последняя реплика: ответил ли уже оператор. */
    readonly lastSideIsVisitor: boolean;
    /** Минута последнего будильника. Пусто — переписка не будила никого ни разу. */
    readonly wokeAt: Date | null;
    /** Часы ответа площадки: вне их лишний раз никого не будят. */
    readonly hours: IChatHours;
}

/** Сколько миллисекунд в минуте: ими считается возраст последней реплики. */
const MINUTE: number = 60_000;

/** Сколько минут переписка стоит без ответа к этой минуте. */
export function chatWaitedMinutes(talk: IChatWakeTalk, at: Date): number {
    return Math.floor((at.getTime() - talk.lastMessageAt.getTime()) / MINUTE);
}

/**
 * Пора ли будить оператора по этой переписке.
 *
 * Четыре причины промолчать, и каждая своя: будильник площадки выключен; последнее слово за
 * оператором — отвечать не на что; условленное время ещё не вышло; по этой самой реплике уже
 * будили. Пятая — часы ответа площадки: вне их посетителю уже обещано, что ответ придёт в
 * рабочие часы, и опоздания, о котором стоит говорить, ещё нет.
 */
export function chatWakeDue(talk: IChatWakeTalk, at: Date): boolean {
    if (talk.answerWithin <= 0 || !talk.lastSideIsVisitor) {
        return false;
    }

    if (chatWaitedMinutes(talk, at) < talk.answerWithin) {
        return false;
    }

    if (talk.wokeAt !== null && talk.wokeAt.getTime() >= talk.lastMessageAt.getTime()) {
        return false;
    }

    return chatAnswersAt(talk.hours, at);
}
