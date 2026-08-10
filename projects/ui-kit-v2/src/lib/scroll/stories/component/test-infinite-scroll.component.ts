import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { RtInfiniteScrollDirective } from '../../infinite-scroll.directive';

/** Сколько строк добавляет одна догрузка. */
const PAGE_SIZE: number = 12;

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Директива сама ничего не рисует: она следит за маяком в конце списка. Поэтому обёртка везёт
 * список и сам маяк — на пустом `div` в кадре не было бы ни строки, и показ ничего бы не
 * подтверждал.
 */
@Component({
    selector: 'app-infinite-scroll',
    template: `
        <div style="block-size: 18rem; overflow: auto; border: 1px solid var(--rt-color-border-default); border-radius: 0.5rem">
            <ol style="margin: 0; padding: 0.5rem 1.5rem">
                @for (row of rows(); track row) {
                    <li style="padding: 0.25rem 0">Договор №2024-{{ row }}</li>
                }
            </ol>
            <div rtInfiniteScroll [disabled]="disabled" [rootMargin]="rootMargin" (loadMore)="onLoadMore()"></div>
        </div>
        <p>Догрузок: {{ loads() }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInfiniteScrollDirective,
    ],
})
export class TestRtInfiniteScrollComponent {
    public readonly rows: WritableSignal<readonly number[]> = signal<readonly number[]>(
        Array.from({ length: PAGE_SIZE }, (_: unknown, index: number): number => index + 101)
    );

    public readonly loads: WritableSignal<number> = signal<number>(0);

    public disabled: boolean = false;
    public rootMargin: string = '50%';

    public onLoadMore(): void {
        this.loads.update((count: number): number => count + 1);
        this.rows.update((rows: readonly number[]): readonly number[] => [
            ...rows,
            ...Array.from({ length: PAGE_SIZE }, (_: unknown, index: number): number => rows.length + 101 + index),
        ]);
    }
}
