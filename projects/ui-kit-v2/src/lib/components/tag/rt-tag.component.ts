import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../i18n';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { IRtTag } from './rt-tag.model';

const BEM_BLOCK: string = 'rt-tag';

/**
 * Status/label pill для отображения статусов и счётчиков.
 * Поддерживает 6 severity-вариантов (`info` / `success` / `warning` / `danger` /
 * `secondary` / `neutral`), 2 формы (`pill` / `square`) и опциональный close-control
 * (рендерит `rt-icon-button` с иконкой `ico-close` и emits `closed` MouseEvent).
 *
 * Все цвета — через семантические `--rt-color-state-*` токены; layout через
 * primitive `--rt-space-*` / `--rt-radius-*` / `--rt-text-*`. BEM-разметка через
 * директивы `rtBlock` / `rtElem` / `rtMod` из `@rt-tools/core`.
 */
@Component({
    selector: 'rt-tag',
    templateUrl: './rt-tag.component.html',
    styleUrl: './rt-tag.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTagComponent {
    /** Текст pill — обязательный input. */
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    public readonly value: InputSignal<string> = input.required<string>();

    /** Семантическая палитра. По умолчанию `neutral` (нейтральный серый). */
    public readonly severity: InputSignal<IRtTag.Severity> = input<IRtTag.Severity>('neutral');

    /** Форма tag'а. По умолчанию `pill` (фуллскруглённый). */
    public readonly shape: InputSignal<IRtTag.Shape> = input<IRtTag.Shape>('pill');

    /** Вид заливки. По умолчанию `solid`; `outlined` — прозрачный фон + рамка. */
    public readonly appearance: InputSignal<IRtTag.Appearance> = input<IRtTag.Appearance>('solid');

    /** Переопределение скругления поверх `shape`. `null` — радиус по `shape`. */
    public readonly radius: InputSignal<IRtTag.Radius | null> = input<IRtTag.Radius | null>(null);

    /** Префикс-иконка слева от текста. `null` (дефолт) — без иконки. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Суффикс-иконка справа от текста (напр. `external-link` у тега-ссылки). */
    public readonly iconEnd: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Рендерит крестик `rt-icon-button` справа от текста. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Эмиттит MouseEvent при клике на close-button (только если `closable=true`). */
    public readonly closed: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    protected onClose(event: MouseEvent): void {
        event.stopPropagation();
        this.closed.emit(event);
    }
}
