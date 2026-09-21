/**
 * Позволение браузеру чужой страницы обращаться к открытым операциям чата.
 *
 * Виджет стоит на странице потребителя, а сервис отвечает по своему имени: для браузера это два
 * разных адреса, и без позволения он не доносит ответ до страницы вовсе. Сервис тут не
 * спрашивают — обращение до него доходит, а прочитать ответ странице не дают.
 *
 * Позволение даётся по тем же спискам адресов, которыми площадки и так сторожат свои открытые
 * операции: второй список для того же самого разошёлся бы с первым молча.
 *
 * Ключ площадки в решении не участвует. Предварительный запрос браузер шлёт без тела, а ключ
 * приёма реплики лежит как раз в теле: позволение отвечается адресу, который стоит в списке хоть
 * одной живой площадки, а пару «ключ и адрес» сводит сама операция. Чужая пара получает отказ, и
 * страница этот отказ читает — позволение ей уже дано.
 *
 * Даёт его приёмник, а не проксировщик: списки лежат на записях площадок, а проксировщик о
 * площадках не знает ничего и позволил бы всем сразу.
 *
 * Готовое позволение каркаса — `enableCors` — берётся на всё приложение разом, и тогда страница
 * площадки получила бы право звать и операции админки. Посредник на путях открытых операций
 * чата — тот же способ каркаса, поставленный туда, где ему место.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';

import { liveSiteOrigins } from '@rt/message-bus-api/chat/data-access';
import { chatCorsHeaders } from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Обращение, каким его видит позволение: способ обращения и заголовки — больше ничего не нужно. */
export interface IChatCorsRequest {
    readonly method?: string;
    readonly headers?: Record<string, string | string[] | undefined>;
}

/** Ответ, каким его видит позволение: заголовок, код и конец. */
export interface IChatCorsAnswer {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(): void;
}

/** Код ответа на предварительный запрос: позволение едет заголовками, тела у такого ответа нет. */
const BEFOREHAND_CODE: number = 204;

/** Первое значение заголовка: каркас отдаёт то строку, то список. */
function header(request: IChatCorsRequest, name: string): string {
    const raw: string | string[] | undefined = request.headers?.[name];

    if (Array.isArray(raw)) {
        return raw[0] ?? '';
    }

    return raw ?? '';
}

@Injectable()
export class ChatCorsMiddleware implements NestMiddleware<IChatCorsRequest, IChatCorsAnswer> {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    public async use(request: IChatCorsRequest, answer: IChatCorsAnswer, next: () => void): Promise<void> {
        const beforehand: boolean = (request.method ?? '').toUpperCase() === 'OPTIONS';
        const asked: string = header(request, 'origin');

        // Ответ зависит от адреса страницы, и посредники между сервисом и браузером должны об
        // этом знать: без этой строки первый сохранённый ответ уехал бы странице чужого адреса.
        answer.setHeader('vary', 'Origin');

        if (asked) {
            const given: Readonly<Record<string, string>> | null = chatCorsHeaders(await liveSiteOrigins(this.#prisma), asked, beforehand);

            for (const [name, value] of Object.entries(given ?? {})) {
                answer.setHeader(name, value);
            }
        }

        if (beforehand) {
            answer.statusCode = BEFOREHAND_CODE;
            answer.end();

            return;
        }

        next();
    }
}
