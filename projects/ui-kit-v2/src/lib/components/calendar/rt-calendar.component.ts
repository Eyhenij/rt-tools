import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    signal,
    viewChildren,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button';
import { RtRadiusDirective } from '../radius/rt-radius.directive';
import { RtSkeletonComponent } from '../skeleton';
import { ERtCalendarDayState, IRtCalendar } from './rt-calendar.model';

const BEM_BLOCK: string = 'rt-calendar';

/** Клавиши, что календарь в режиме сетки отдаёт наружу вместо прокрутки страницы. */
const GRID_KEYS: ReadonlySet<string> = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

@Component({
    selector: 'rt-calendar',
    templateUrl: './rt-calendar.component.html',
    styleUrl: './rt-calendar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconButtonComponent,
        RtSkeletonComponent,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCalendarComponent {
    /** Фокус двигала клавиша: только тогда календарь переводит фокус на `activeKey`. */
    readonly #keyed: WritableSignal<boolean> = signal(false);

    protected readonly sublabelSkeletonHeight: string = '12px';
    protected readonly chosenState: ERtCalendarDayState = ERtCalendarDayState.Chosen;

    protected readonly dayButtons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
        viewChildren<ElementRef<HTMLButtonElement>>('dayButton');

    /**
     * День, что стоит в порядке обхода Tab в режиме сетки: `activeKey`, иначе выбранный, иначе
     * сегодняшний, иначе первый доступный. Вне режима сетки — `null`, и каждый день обходится Tab.
     */
    protected readonly rovingKey: Signal<string | null> = computed((): string | null => {
        if (!this.grid()) {
            return null;
        }
        const days: IRtCalendar.Day[] = this.months().flatMap((month: IRtCalendar.Month): IRtCalendar.Day[] => [...month.days]);
        const active: string | null = this.activeKey();
        const pick: IRtCalendar.Day | undefined =
            days.find((day: IRtCalendar.Day): boolean => day.key === active) ??
            days.find((day: IRtCalendar.Day): boolean => day.state === ERtCalendarDayState.Chosen) ??
            days.find((day: IRtCalendar.Day): boolean => day.today === true) ??
            days.find((day: IRtCalendar.Day): boolean => !day.disabled);
        return pick?.key ?? null;
    });

    public readonly months: InputSignal<readonly IRtCalendar.Month[]> = input.required<readonly IRtCalendar.Month[]>();
    public readonly weekdayLabels: InputSignal<readonly string[]> = input.required<readonly string[]>();
    public readonly canPrev: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly canNext: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Локализованные aria-подписи кнопок навигации — задаёт consumer. */
    public readonly prevAriaLabel: InputSignal<string> = input<string>('');
    public readonly nextAriaLabel: InputSignal<string> = input<string>('');
    public readonly sublabelsLoading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Режим сетки: один день в обходе Tab, клавиши стрелок, PageUp/PageDown, Home и End уходят
     * наружу событием `gridKey`, а фокус встаёт на `activeKey`. Выключен — поведение прежнее.
     */
    public readonly grid: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** День с фокусом в режиме сетки, ключ `YYYY-MM-DD`; его ставит consumer по `gridKey`. */
    public readonly activeKey: InputSignal<string | null> = input<string | null>(null);
    /** Заголовок месяца — кнопка, что шлёт `titleClick`: так consumer открывает выбор месяца. */
    public readonly titleAction: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Заголовок первого месяца стоит в шапке между стрелками, а не над сеткой. */
    public readonly headerTitle: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly prevMonth: OutputEmitterRef<void> = output<void>();
    public readonly nextMonth: OutputEmitterRef<void> = output<void>();
    public readonly dayClick: OutputEmitterRef<IRtCalendar.Day> = output<IRtCalendar.Day>();
    /** Клавиша сетки на дне: куда перевести фокус, решает consumer. */
    public readonly gridKey: OutputEmitterRef<IRtCalendar.GridKey> = output<IRtCalendar.GridKey>();
    public readonly titleClick: OutputEmitterRef<IRtCalendar.Month> = output<IRtCalendar.Month>();
    /** День под указателем или с фокусом; `null` — указатель ушёл с месяцев. По нему рисуется будущий диапазон. */
    public readonly dayHover: OutputEmitterRef<IRtCalendar.Day | null> = output<IRtCalendar.Day | null>();

    constructor() {
        afterRenderEffect((): void => {
            const key: string | null = this.rovingKey();
            if (!this.#keyed() || key === null) {
                return;
            }
            this.dayButtons()
                .find((button: ElementRef<HTMLButtonElement>): boolean => button.nativeElement.dataset['iso'] === key)
                ?.nativeElement.focus();
        });
    }

    protected onDayKey(event: KeyboardEvent, day: IRtCalendar.Day): void {
        if (!this.grid() || !GRID_KEYS.has(event.key)) {
            return;
        }
        event.preventDefault();
        this.#keyed.set(true);
        this.gridKey.emit({ key: event.key, day });
    }

    protected onDayHover(day: IRtCalendar.Day): void {
        if (!day.disabled) {
            this.dayHover.emit(day);
        }
    }

    protected onDayClick(day: IRtCalendar.Day): void {
        if (!day.disabled) {
            this.dayClick.emit(day);
        }
    }
}
