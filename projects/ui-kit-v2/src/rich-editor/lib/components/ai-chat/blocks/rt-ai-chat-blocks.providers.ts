import { InjectionToken, Provider, Type } from '@angular/core';

import { IRtAiChat } from '../rt-ai-chat.model';

/**
 * Отрисовщики блоков, которых кит сам не знает. Приложение кладёт сюда график, таблицу и другие
 * блоки своими провайдерами; тяжёлая зависимость отрисовщика остаётся в его точке входа.
 * Без единой регистрации токен не задан, и такие блоки рисуются заглушкой.
 */
export const RT_AI_CHAT_BLOCK_RENDERERS: InjectionToken<readonly IRtAiChat.BlockRenderer[]> = new InjectionToken<
    readonly IRtAiChat.BlockRenderer[]
>('RT_AI_CHAT_BLOCK_RENDERERS');

/**
 * Регистрирует отрисовщик блока типа `type`: компонент получает блок во вход `block`.
 * Регистрация того же типа ещё раз заменяет прежнюю — побеждает последняя.
 */
export function provideRtAiChatBlock(type: string, component: Type<unknown>): Provider {
    const renderer: IRtAiChat.BlockRenderer = { type, component };

    return { provide: RT_AI_CHAT_BLOCK_RENDERERS, useValue: renderer, multi: true };
}
