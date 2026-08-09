import { Directive, inject, input, InputSignalWithTransform, TemplateRef } from '@angular/core';

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

    /**
     * Сторона размещения относительно полосы вкладок.
     *
     * Пустое значение приводится к правой стороне: `<ng-template rtTabsControl>` без значения
     * задаёт входу пустую строку, а не умолчание, и такой контрол не попадал ни в левый слот,
     * ни в правый — он пропадал из шапки вовсе.
     */
    public readonly side: InputSignalWithTransform<IRtTabs.ControlSide, IRtTabs.ControlSide | ''> = input<
        IRtTabs.ControlSide,
        IRtTabs.ControlSide | ''
    >('right', {
        alias: 'rtTabsControl',
        transform: (value: IRtTabs.ControlSide | ''): IRtTabs.ControlSide => (value === '' ? 'right' : value),
    });
}
