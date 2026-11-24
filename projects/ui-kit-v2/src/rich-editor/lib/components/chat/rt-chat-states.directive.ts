import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError, rtSlotTemplate } from '@rt-tools/ui-kit-v2';

/**
 * Свой вид чата без переписки: `<ng-template rtChatEmpty>` встаёт вместо заглушки по умолчанию
 * целиком. Контекста нет — заглушка про отсутствие переписки, а не про её содержимое.
 */
@Directive({
    selector: 'ng-template[rtChatEmpty]',
})
export class RtChatEmptyDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/**
 * Свой вид ошибки загрузки переписки: `<ng-template rtChatError let-error let-retry="retry">`
 * встаёт вместо заглушки по умолчанию; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtChatError]',
})
export class RtChatErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtChatErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}

/** Хост слотов-шаблонов чата: его имя стоит в предупреждении о прежней форме слота. */
const SLOT_HOST: string = 'rt-chat';

/** Свои кнопки в шапке чата: `<ng-template rtChatHeaderActions>`, рисуются, пока шапка показана. */
@Directive({ selector: '[rtChatHeaderActions]' })
export class RtChatHeaderActionsDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(SLOT_HOST, 'rtChatHeaderActions');
}

/** Полоса над рамкой поля ответа: `<ng-template rtChatComposerBar>`, рисуется, пока ответ разрешён. */
@Directive({ selector: '[rtChatComposerBar]' })
export class RtChatComposerBarDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(SLOT_HOST, 'rtChatComposerBar');
}

/** Кнопки внутри поля мессенджера слева: `<ng-template rtChatComposerTools>`, только в поле мессенджера. */
@Directive({ selector: '[rtChatComposerTools]' })
export class RtChatComposerToolsDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(SLOT_HOST, 'rtChatComposerTools');
}

/** Своё содержимое под диалогом: `<ng-template rtChatFooter>`, пока диалог открыт и прочитан без ошибки. */
@Directive({ selector: '[rtChatFooter]' })
export class RtChatFooterDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(SLOT_HOST, 'rtChatFooter');
}
