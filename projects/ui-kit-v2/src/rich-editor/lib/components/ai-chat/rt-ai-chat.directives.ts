import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtAiChat } from './rt-ai-chat.model';

/**
 * Вложения ответа ассистента: то, что рисует приложение под текстом ответа — график, таблица,
 * карточка. Шаблон получает сообщение.
 */
@Directive({
    selector: 'ng-template[rtAiChatMessageExtra]',
})
export class RtAiChatMessageExtraDirective {
    public readonly templateRef: TemplateRef<IRtAiChat.ExtraContext> = inject<TemplateRef<IRtAiChat.ExtraContext>>(TemplateRef);

    public static ngTemplateContextGuard(
        _directive: RtAiChatMessageExtraDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате
        context: unknown
    ): context is IRtAiChat.ExtraContext {
        return true;
    }
}
