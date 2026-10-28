import { NumberInput } from '@angular/cdk/coercion';
import {
    computed,
    input,
    numberAttribute,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';

const BEM_BLOCK: string = 'rt-usage-ring';

/** Радиус дуги в единицах рисунка: круг 18 × 18, дуга толщиной 2.5 по середине кольца. */
const RING_RADIUS: number = 7.75;

/** Длина окружности дуги: из неё складывается доля, закрашенная по `stroke-dasharray`. */
export const RT_USAGE_RING_CIRCUMFERENCE: number = 2 * Math.PI * RING_RADIUS;

/** Доля от 0 до 100 в целых процентах; всё вне границ прижимается к краю. */
export function rtUsagePercent(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Кольцо расхода: доля потраченного лимита дугой по кругу, с порога предупреждения оранжевая.
 *
 * Кольцо рисует только долю. Что за лимит и когда он сбрасывается, говорит подсказка `hint`
 * по наведению и фокусу: её текст собирает приложение, кит не знает ни лимита, ни дат.
 */
@Component({
    selector: 'rt-usage-ring',
    templateUrl: './rt-usage-ring.component.html',
    styleUrl: './rt-usage-ring.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtUsageRingComponent {
    /** Доля в целых процентах, прижатая к 0…100. */
    protected readonly percent: Signal<number> = computed((): number => rtUsagePercent(this.value()));

    protected readonly radius: number = RING_RADIUS;

    protected readonly circumference: number = RT_USAGE_RING_CIRCUMFERENCE;

    /** Незакрашенная часть окружности: дуга рисуется штрихом этой длины со смещением. */
    protected readonly dashOffset: Signal<number> = computed((): number => RT_USAGE_RING_CIRCUMFERENCE * (1 - this.percent() / 100));

    protected readonly mods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        warning: this.percent() >= this.warnAt(),
    }));

    protected readonly label: Signal<string> = rtKitLabel(
        'aiUsageAria',
        computed((): Readonly<Record<string, number>> => ({ percent: this.percent() }))
    );

    /** Потраченная доля лимита в процентах. */
    public readonly value: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, { transform: numberAttribute });

    /** С этой доли кольцо оранжевое. */
    public readonly warnAt: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(80, { transform: numberAttribute });

    /** Подсказка по наведению и фокусу: доля и дата сброса словами приложения. Пусто — подсказки нет. */
    public readonly hint: InputSignal<string> = input<string>('');
}
