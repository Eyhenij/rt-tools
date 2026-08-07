import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { IRtNightGrid } from './rt-night-grid.model';

const BEM_BLOCK: string = 'rt-night-grid';

/**
 * Плотная сетка суток: ряд мелких ячеек, каждая — одна ночь. Применяется там, где
 * нужно окинуть взглядом занятость на недели вперёд, а не листать календарь.
 *
 * Сетка скроллится внутри себя по горизонтали — документ боком не едет.
 */
@Component({
    selector: 'rt-night-grid',
    templateUrl: './rt-night-grid.component.html',
    styleUrl: './rt-night-grid.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
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
export class RtNightGridComponent {
    readonly #t_uiNightGridAria: Signal<string> = rtKitLabel('uiNightGridAria');

    protected readonly ariaText: Signal<string> = computed((): string => this.ariaLabel() || this.#t_uiNightGridAria());

    public readonly cells: InputSignal<ReadonlyArray<IRtNightGrid.Cell>> = input.required<ReadonlyArray<IRtNightGrid.Cell>>();

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly ariaLabel: InputSignal<string> = input<string>('');

    public readonly cellClick: OutputEmitterRef<IRtNightGrid.Cell> = output<IRtNightGrid.Cell>();

    protected onCellClick(cell: IRtNightGrid.Cell): void {
        this.cellClick.emit(cell);
    }
}
