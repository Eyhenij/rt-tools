import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

import { IRtTabs } from './rt-tabs.model';

/**
 * Декларирует header-контрол `<rt-tabs>` — произвольный шаблон (кнопка, фильтр),
 * который рендерится слева или справа от полосы вкладок. Ставится на
 * `<ng-template>`; `rt-tabs` собирает контролы через `contentChildren` и
 * раскладывает по сторонам согласно `side`.
 */
@Directive({
    selector: '[rtTabsControl]',
})
export class RtTabsControlDirective {
    /** Шаблон контрола, выводимый в header-слоте. */
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);

    /** Сторона размещения относительно полосы вкладок. */
    public readonly side: InputSignal<IRtTabs.ControlSide> = input<IRtTabs.ControlSide>('right', {
        alias: 'rtTabsControl',
    });
}
