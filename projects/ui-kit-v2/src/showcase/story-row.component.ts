import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    contentChild,
    input,
    InputSignal,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

/** Контекст ячейки ряда: значение оси приходит неявным. */
export interface IStoryItem<ITEM> {
    $implicit: ITEM;
}

/**
 * Ряд по одной оси: все значения подряд, каждое подписано.
 *
 * Берётся, когда ось ни с чем не перемножается — то есть в большинстве случаев. Перемножение
 * осей, которые друг на друга не влияют, добавляет ячейки, не добавляя ничего нового, и
 * прячет расхождение ровно так же, как его отсутствие.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */
@Component({
    selector: 'app-story-row',
    template: `
        @if (caption()) {
            <h3 class="app-story-row__caption">{{ caption() }}</h3>
        }
        <div class="app-story-row__items">
            @for (item of items(); track $index) {
                <div class="app-story-row__item">
                    <div class="app-story-row__slot" [style.inline-size]="slotWidth()">
                        @if (cell(); as template) {
                            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ $implicit: item }" />
                        }
                    </div>
                    <span class="app-story-row__label">{{ itemLabel()(item) }}</span>
                </div>
            }
        </div>
    `,
    styleUrl: './story-row.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'app-story-row',
    },
    imports: [
        // angular
        NgTemplateOutlet,
    ],
})
export class StoryRowComponent<ITEM> {
    protected readonly cell: Signal<TemplateRef<IStoryItem<ITEM>> | undefined> = contentChild(TemplateRef);

    /** Подпись над рядом — какая это ось. */
    public readonly caption: InputSignal<string> = input<string>('');

    /** Значения оси. */
    public readonly items: InputSignal<readonly ITEM[]> = input.required<readonly ITEM[]>();

    /**
     * Ширина ячейки. Нужна тому, что тянется на всю ширину родителя: поле ввода в ячейке
     * по содержимому схлопывается до нуля и показывает не размер, а его отсутствие.
     */
    public readonly slotWidth: InputSignal<string> = input<string>('');

    /** Подпись значения; по умолчанию — само значение. Нужна осям, чьи значения не строки. */
    public readonly itemLabel: InputSignal<(value: ITEM) => string> = input<(value: ITEM) => string>((value: ITEM): string =>
        String(value)
    );
}
