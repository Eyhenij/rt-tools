/**
 * Двойник отправителя вызовов: он записывает, о чём сервис сказал наружу, и в сеть не ходит.
 *
 * Спека, которая ходила бы в сеть, проверяла бы чужой узел, а не дерево: в ней проверяется, о
 * чём сервис говорит и держит ли отправка ответ человеку.
 */
import { ChatHookService, IChatHookEvent, IChatHookOutcome, IChatHookTarget } from './chat-hook.service';
import { ChatPrismaDouble } from './chat.double';

/** Один сказанный наружу вызов, как его видит спека. */
export interface ISaidCall {
    readonly kind: string;
    readonly site: string;
    readonly conversationId: string;
}

/** Исход принятой отправки: двойник отвечает им, пока его не попросили зависнуть. */
const TAKEN: IChatHookOutcome = { delivered: true, attempts: 1, status: 200, fault: '' };

export class ChatHookSpy extends ChatHookService {
    public readonly said: ISaidCall[] = [];
    #hangs: boolean = false;

    constructor() {
        super(new ChatPrismaDouble().asPrisma());
    }

    /** С этой минуты отправка не кончается: так проверяется, что она никого не держит. */
    public hang(): void {
        this.#hangs = true;
    }

    public override async say(site: IChatHookTarget, kind: string, event: IChatHookEvent): Promise<IChatHookOutcome> {
        this.said.push({ kind, site: site.key, conversationId: event.conversationId });

        if (this.#hangs) {
            return new Promise<IChatHookOutcome>((): void => {
                // зависшая отправка: она не кончается ни успехом, ни отказом
            });
        }

        return TAKEN;
    }
}
