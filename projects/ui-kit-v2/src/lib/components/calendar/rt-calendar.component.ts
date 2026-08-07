import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    ViewEncapsulation,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button';
import { RtSkeletonComponent } from '../skeleton';
import { IRtCalendar } from './rt-calendar.model';

const BEM_BLOCK: string = 'rt-calendar';

@Component({
    selector: 'rt-calendar',
    templateUrl: './rt-calendar.component.html',
    styleUrl: './rt-calendar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconButtonComponent,
        RtSkeletonComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCalendarComponent {
    protected readonly sublabelSkeletonHeight: string = '12px';

    public readonly months: InputSignal<readonly IRtCalendar.Month[]> = input.required<readonly IRtCalendar.Month[]>();
    public readonly weekdayLabels: InputSignal<readonly string[]> = input.required<readonly string[]>();
    public readonly canPrev: InputSignal<boolean> = input<boolean>(false);
    public readonly canNext: InputSignal<boolean> = input<boolean>(false);
    /** Локализованные aria-подписи кнопок навигации — задаёт consumer. */
    public readonly prevAriaLabel: InputSignal<string> = input<string>('');
    public readonly nextAriaLabel: InputSignal<string> = input<string>('');
    public readonly sublabelsLoading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly prevMonth: OutputEmitterRef<void> = output<void>();
    public readonly nextMonth: OutputEmitterRef<void> = output<void>();
    public readonly dayClick: OutputEmitterRef<IRtCalendar.Day> = output<IRtCalendar.Day>();

    protected onDayClick(day: IRtCalendar.Day): void {
        if (!day.disabled) {
            this.dayClick.emit(day);
        }
    }
}
