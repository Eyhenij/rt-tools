/**
 * Обращения виджета к сервису.
 *
 * Все пять открытые: виджет представляется ключом площадки, а своей перепиской — признаком
 * посетителя. Форму ответов виджет берёт у общей либы — той же, которой отвечает приёмник:
 * своя копия формы разошлась бы с ней молча.
 *
 * Отказ приезжает кодом, а не словами: слова виджет говорит свои, и разбирает код общий разбор.
 */
import { ERefusal, IChatMessageRow, IChatSiteLookRow, IPage, IRefusal, refusalOf, TRefusalParams } from '@rt/message-bus-common';

/** Сколько реплик читается за раз: разговор поддержки короток, страница у него одна. */
const FEED_SIZE: number = 100;

/** Чем виджет называет себя сервису: площадка и, когда он уже есть, признак посетителя. */
export interface IWidgetSigns {
    readonly service: string;
    readonly site: string;
    readonly visitor: string;
    readonly conversation: string;
}

/** Отказ сервиса, каким его показывает виджет. */
export class WidgetRefusal extends Error {
    public readonly code: ERefusal | null;
    public readonly params: TRefusalParams | undefined;

    constructor(refusal: IRefusal | null) {
        super(refusal?.code ?? 'chat');
        this.code = refusal?.code ?? null;
        this.params = refusal?.params;
    }
}

/** Ответ сервиса или отказ: тело разбирается один раз, здесь. */
async function answer<T>(response: Response): Promise<T> {
    const body: unknown = await response.json().catch((): null => null);

    if (!response.ok) {
        throw new WidgetRefusal(refusalOf(body));
    }

    return body as T;
}

/** Площадка глазами виджета: приветствие и часы ответа. */
export async function askSiteLook(service: string, site: string): Promise<IChatSiteLookRow> {
    const asked: Response = await fetch(`${service}/api/chat/site?site=${encodeURIComponent(site)}`);

    return answer<IChatSiteLookRow>(asked);
}

/** Своя переписка посетителя целиком, старые реплики первыми. */
export async function askOwnFeed(signs: IWidgetSigns): Promise<IPage<IChatMessageRow>> {
    const query: URLSearchParams = new URLSearchParams({
        site: signs.site,
        visitor: signs.visitor,
        conversation: signs.conversation,
        size: String(FEED_SIZE),
    });
    const asked: Response = await fetch(`${signs.service}/api/chat/messages?${query.toString()}`);

    return answer<IPage<IChatMessageRow>>(asked);
}

/** Заведение переписки. Признак посетителя приезжает, если он у виджета уже был. */
export async function startTalk(service: string, site: string, visitor: string): Promise<{ conversationId: string; visitorToken: string }> {
    const asked: Response = await fetch(`${service}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(visitor ? { site, visitor } : { site }),
    });

    return answer<{ conversationId: string; visitorToken: string }>(asked);
}

/** Реплика посетителя в его переписку. */
export async function sendRemark(signs: IWidgetSigns, text: string): Promise<{ messageId: string; takenAt: string }> {
    const asked: Response = await fetch(`${signs.service}/api/chat/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ site: signs.site, visitor: signs.visitor, conversation: signs.conversation, text }),
    });

    return answer<{ messageId: string; takenAt: string }>(asked);
}

/** Адрес потока событий своей переписки. */
export function streamAddress(signs: IWidgetSigns): string {
    const query: URLSearchParams = new URLSearchParams({ site: signs.site, visitor: signs.visitor });

    return `${signs.service}/api/chat/stream?${query.toString()}`;
}
