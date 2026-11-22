import { Directive, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2';

const HOST: string = 'rt-chat';

/** Свои кнопки в шапке чата: `<ng-template rtChatHeaderActions>`, рисуются, пока шапка показана. */
@Directive({ selector: '[rtChatHeaderActions]' })
export class RtChatHeaderActionsDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtChatHeaderActions');
}

/** Полоса над рамкой поля ответа: `<ng-template rtChatComposerBar>`, рисуется, пока ответ разрешён. */
@Directive({ selector: '[rtChatComposerBar]' })
export class RtChatComposerBarDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtChatComposerBar');
}

/** Кнопки внутри поля мессенджера слева: `<ng-template rtChatComposerTools>`, только в поле мессенджера. */
@Directive({ selector: '[rtChatComposerTools]' })
export class RtChatComposerToolsDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtChatComposerTools');
}

/** Своё содержимое под диалогом: `<ng-template rtChatFooter>`, пока диалог открыт и прочитан без ошибки. */
@Directive({ selector: '[rtChatFooter]' })
export class RtChatFooterDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtChatFooter');
}
