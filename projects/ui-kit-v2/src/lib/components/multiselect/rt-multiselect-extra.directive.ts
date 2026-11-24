import { Directive, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2/core';

/**
 * Свои переключатели приложения над чертой вида `toggles`: `<ng-template rtMultiselectExtra>`.
 * Шаблон рисуется только в открытой панели этого вида: в виде `list` и в закрытом поле его
 * содержимое не создаётся.
 */
@Directive({ selector: '[rtMultiselectExtra]' })
export class RtMultiselectExtraDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate('rt-multiselect', 'rtMultiselectExtra');
}
