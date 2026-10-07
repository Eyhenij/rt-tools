import { Pipe, PipeTransform } from '@angular/core';

import { rtTreeFind } from '@rt-tools/ui-kit-v2/select';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';

/** Лейбл опции по её value для отображения чипа выбранного значения — на любой глубине дерева. */
@Pipe({ name: 'rtMultiselectLabel' })
export class RtMultiselectLabelPipe implements PipeTransform {
    public transform<TValue>(value: TValue, options: ReadonlyArray<IRtSelect.Option<TValue>>): string {
        return rtTreeFind(options, value)?.label ?? String(value);
    }
}
