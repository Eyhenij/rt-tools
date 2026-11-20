import { Directive } from '@angular/core';

import { IRtAiChat } from '../rt-ai-chat.model';

/**
 * Помечает шаблон ленты, которым рисуется один блок — в ленте и в ячейке секции. Сама она ничего
 * не делает: с ней `let-view` шаблона получает тип вида блока, и поле, которого у вида нет,
 * не собирается.
 */
@Directive({
    selector: 'ng-template[rtAiChatBlockCell]',
})
export class RtAiChatBlockCellDirective {
    public static ngTemplateContextGuard(
        _directive: RtAiChatBlockCellDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод проверки контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtAiChat.CellContext {
        return true;
    }
}
