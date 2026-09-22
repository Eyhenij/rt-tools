import { describe, expect, it } from 'vitest';

import { chatHookReady, chatHookSignature, IChatHookSite } from './chat-hook.logic';

/** Площадка с адресом и тайной: от неё отличаются все случаи ниже. */
const READY: IChatHookSite = { hookUrl: 'https://приложение.example/chat', hookSecret: 'тайна' };

describe('вызов наружу', () => {
    it('SC-CH-62 — площадка с адресом и тайной вызовы получает', () => {
        expect(chatHookReady(READY)).toBe(true);
    });

    it('SC-CH-63 — площадка без адреса вызовов не получает', () => {
        expect(chatHookReady({ ...READY, hookUrl: '' })).toBe(false);
        // адрес из одних пробелов — тот же пустой адрес, только незаметный глазом
        expect(chatHookReady({ ...READY, hookUrl: '   ' })).toBe(false);
    });

    it('SC-CH-63 — площадка с адресом, но без тайны вызовов не получает', () => {
        expect(chatHookReady({ ...READY, hookSecret: '' })).toBe(false);
    });

    it('SC-CH-64 — подпись считается тайной площадки, и у разных тайн она разная', () => {
        const body: string = '{"kind":"remark","conversationId":"один"}';
        const mine: string = chatHookSignature(READY.hookSecret, body);

        expect(mine).toMatch(/^[0-9a-f]{64}$/);
        // положительная пара: та же тайна и то же тело дают ту же подпись
        expect(chatHookSignature(READY.hookSecret, body)).toBe(mine);
        expect(chatHookSignature('другая тайна', body)).not.toBe(mine);
    });

    it('SC-CH-64 — подпись считается по телу целиком', () => {
        const first: string = chatHookSignature(READY.hookSecret, '{"kind":"remark"}');
        const second: string = chatHookSignature(READY.hookSecret, '{"kind":"closing"}');

        expect(first).not.toBe(second);
    });
});
