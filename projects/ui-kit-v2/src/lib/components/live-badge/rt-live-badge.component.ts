import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
} from '@angular/core';

import { translateSignal } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-live-badge';

/**
 * Пилюля живого счётчика: точка состояния, подпись и число. `active` означает
 * «поток жив», а не «счётчик больше нуля»: ноль посетителей при живом потоке —
 * это данные, а оборванный поток — отсутствие данных, и выглядеть они должны
 * по-разному.
 */
@Component({
    selector: 'rt-live-badge',
    templateUrl: './rt-live-badge.component.html',
    styleUrl: './rt-live-badge.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtLiveBadgeComponent {
    readonly #t_uiLiveOnSite: Signal<string> = translateSignal('rtKit.uiLiveOnSite');

    protected readonly labelText: Signal<string> = computed((): string => this.label() || this.#t_uiLiveOnSite());

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly label: InputSignal<string> = input<string>('');

    /** `null` — данных ещё нет, рисуется прочерк. */
    public readonly count: InputSignal<number | null> = input<number | null>(null);

    public readonly active: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
