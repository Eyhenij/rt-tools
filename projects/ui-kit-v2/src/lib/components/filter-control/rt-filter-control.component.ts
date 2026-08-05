import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BreakpointsService } from '../../platform';

import { RtSelectComponent } from '../select/rt-select.component';
import { IRtSelect } from '../select/rt-select.model';
import { RtToggleButtonGroupComponent } from '../toggle-button-group/rt-toggle-button-group.component';
import { IRtFilterControl } from './rt-filter-control.model';

const BEM_BLOCK: string = 'rt-filter-control';

/**
 * Адаптивный фильтр-контрол для тулбаров list-страниц.
 *
 * Один и тот же набор опций рендерится двумя способами по ширине вьюпорта:
 *  - десктоп (> 1080px) — развёрнутые сегменты `rt-toggle-button-group`;
 *  - узкий экран (≤ 1080px, `BreakpointsService.narrow`) — компактный
 *    `rt-select` с `clearable=false` (сброс — через явную опцию «Все»).
 *
 * API повторяет controlled-контракт rt-toggle-button-group (`[options]` /
 * `[value]` / `(valueChange)`), поэтому миграция потребителя — смена селектора
 * без правки хендлеров. Sentinel «нет фильтра» задаёт сам потребитель реальным
 * значением опции («»/false), а не `null`/`undefined` — rt-select всегда
 * показывает выбранную опцию.
 *
 * Generic `<T = string>` сохраняет типизацию по value (union'ы, enum'ы).
 */
@Component({
    selector: 'rt-filter-control',
    templateUrl: './rt-filter-control.component.html',
    styleUrls: ['./rt-filter-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,

        // standalone components / directives
        RtSelectComponent,
        RtToggleButtonGroupComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtFilterControlComponent<T = string> {
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    protected readonly isNarrow: Signal<boolean> = this.#breakpoints.narrow;

    /** Проекция опций фильтра в форму rt-select (icon/title отбрасываются). */
    protected readonly selectOptions: Signal<ReadonlyArray<IRtSelect.Option<T>>> = computed((): ReadonlyArray<IRtSelect.Option<T>> =>
        this.options().map((option: IRtFilterControl.Option<T>): IRtSelect.Option<T> => ({
            label: option.label,
            value: option.value,
        }))
    );

    public readonly options: InputSignal<ReadonlyArray<IRtFilterControl.Option<T>>> =
        input.required<ReadonlyArray<IRtFilterControl.Option<T>>>();

    public readonly value: InputSignal<T | undefined> = input<T | undefined>(undefined);

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly placeholder: InputSignal<string> = input<string>('');

    /**
     * Размер сегментов (десктоп). На узком экране select всегда рендерится в md,
     * чтобы совпадать по высоте и ширине со строкой поиска list-страницы.
     */
    public readonly size: InputSignal<IRtFilterControl.Size> = input<IRtFilterControl.Size>('sm');

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Растягивает сегменты на всю ширину контейнера (только десктоп-вариант). */
    public readonly fullWidth: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly valueChange: OutputEmitterRef<T> = output<T>();

    protected onValueChange(value: T): void {
        this.valueChange.emit(value);
    }

    protected onSelectionChange(value: T | null): void {
        // rt-select с clearable=false и явной опцией «Все» не эмитит null,
        // но guard оставляем на случай программной очистки.
        if (value !== null) {
            this.valueChange.emit(value);
        }
    }
}
