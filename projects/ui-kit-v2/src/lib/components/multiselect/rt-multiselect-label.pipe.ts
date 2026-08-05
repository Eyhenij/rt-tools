import { Pipe, PipeTransform } from '@angular/core';

import { IRtSelect } from '../select/rt-select.model';

/** Лейбл опции по её value для отображения чипа выбранного значения. */
@Pipe({ name: 'rtMultiselectLabel' })
export class RtMultiselectLabelPipe implements PipeTransform {
    public transform<TValue>(value: TValue, options: ReadonlyArray<IRtSelect.Option<TValue>>): string {
        const match: IRtSelect.Option<TValue> | undefined = options.find((o: IRtSelect.Option<TValue>): boolean => o.value === value);
        return match?.label ?? String(value);
    }
}
