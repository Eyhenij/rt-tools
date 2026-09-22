import { beforeEach, describe, expect, it } from 'vitest';

import { ChatCorsMiddleware, IChatCorsAnswer, IChatCorsRequest } from './chat-cors.middleware';
import { ChatPrismaDouble } from './chat.double';

/** Ответ стенда: заголовки складываются как есть, конец и код читаются пробой. */
class AnswerSpy implements IChatCorsAnswer {
    public statusCode: number = 200;
    public ended: boolean = false;
    public readonly headers: Record<string, string> = {};

    public setHeader(name: string, value: string): void {
        this.headers[name] = value;
    }

    public end(): void {
        this.ended = true;
    }
}

/** Обращение с названного адреса названным способом. */
function asking(origin: string, method: string = 'GET'): IChatCorsRequest {
    return { method, headers: origin ? { origin } : {} };
}

describe('позволение браузеру чужой страницы', () => {
    let db: ChatPrismaDouble;
    let cors: ChatCorsMiddleware;
    let answer: AnswerSpy;
    let passed: number;

    /** Площадка со списком адресов: включённость задаётся каждой пробой отдельно. */
    function siteOf(id: string, origins: string[], enabled: boolean = true): void {
        db.sites.push({ id, spaceId: 'space-1', key: id, origins, enabled });
    }

    beforeEach(() => {
        db = new ChatPrismaDouble();
        cors = new ChatCorsMiddleware(db.asPrisma());
        answer = new AnswerSpy();
        passed = 0;
    });

    /** Один проход посредника: сколько раз он пустил обращение дальше, считает проба. */
    async function pass(request: IChatCorsRequest): Promise<void> {
        await cors.use(request, answer, (): void => {
            passed += 1;
        });
    }

    it('SC-CH-74 — страница из списка площадки получает позволение и проходит дальше', async () => {
        siteOf('site-1', ['https://shop.example']);

        await pass(asking('https://shop.example'));

        expect(answer.headers['access-control-allow-origin']).toBe('https://shop.example');
        expect(answer.headers['vary']).toBe('Origin');
        expect(passed).toBe(1);
    });

    it('SC-CH-75 — чужой адрес позволения не получает, а обращение всё равно идёт дальше', async () => {
        siteOf('site-1', ['https://shop.example']);

        await pass(asking('https://foreign.example'));

        expect(answer.headers['access-control-allow-origin']).toBeUndefined();
        expect(answer.headers['vary']).toBe('Origin');
        expect(passed).toBe(1);
    });

    it('SC-CH-75 — адрес выключенной площадки позволения не получает', async () => {
        siteOf('site-1', ['https://shop.example'], false);

        await pass(asking('https://shop.example'));

        expect(answer.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('SC-CH-76 — предварительный запрос отвечается тем же списком и дальше не идёт', async () => {
        siteOf('site-1', ['https://shop.example']);

        await pass(asking('https://shop.example', 'OPTIONS'));

        expect(answer.headers['access-control-allow-origin']).toBe('https://shop.example');
        expect(answer.headers['access-control-allow-methods']).toContain('POST');
        expect(answer.statusCode).toBe(204);
        expect(answer.ended).toBe(true);
        expect(passed).toBe(0);
    });

    it('SC-CH-76 — предварительный запрос с чужого адреса получает ответ без позволения', async () => {
        siteOf('site-1', ['https://shop.example']);

        await pass(asking('https://foreign.example', 'OPTIONS'));

        expect(answer.headers['access-control-allow-origin']).toBeUndefined();
        expect(answer.headers['access-control-allow-methods']).toBeUndefined();
        expect(answer.statusCode).toBe(204);
    });

    it('SC-CH-77 — позволение называет адрес спросившей страницы, а не любой', async () => {
        siteOf('site-1', ['https://shop.example']);
        siteOf('site-2', ['https://blog.example']);

        await pass(asking('https://blog.example'));

        expect(answer.headers['access-control-allow-origin']).toBe('https://blog.example');
        expect(Object.values(answer.headers)).not.toContain('*');
    });

    it('обращение без адреса страницы идёт дальше без позволения: своя же страница его не шлёт', async () => {
        siteOf('site-1', ['https://shop.example']);

        await pass(asking(''));

        expect(answer.headers['access-control-allow-origin']).toBeUndefined();
        expect(passed).toBe(1);
    });
});
