import { Pipe, PipeTransform } from '@angular/core';

import { rtTreeFind } from '../select/rt-select-tree';
import { IRtSelect } from '../select/rt-select.model';

/** Лейбл опции по её value для отображения чипа выбранного значения — на любой глубине дерева. */
@Pipe({ name: 'rtMultiselectLabel' })
export class RtMultiselectLabelPipe implements PipeTransform {
    public transform<TValue>(value: TValue, options: ReadonlyArray<IRtSelect.Option<TValue>>): string {
        return rtTreeFind(options, value)?.label ?? String(value);
    }
}
