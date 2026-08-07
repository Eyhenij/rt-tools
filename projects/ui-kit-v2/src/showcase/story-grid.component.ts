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

/** Контекст ячейки: значение строки приходит неявным, значение столбца — по имени `col`. */
export interface IStoryCell<ROW, COL> {
    $implicit: ROW;
    col: COL;
}

/**
 * Сетка «ось × ось» с подписанными строками и столбцами.
 *
 * Показывает то, чего не показывает playground с контролами: все значения оси сразу, чтобы
 * расхождение на стыке двух осей было видно без перебора руками. Перемножать оси имеет смысл
 * только когда они влияют друг на друга — иначе берётся `app-story-row`.
 *
 * Обвязка витрины, а не кит: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 * Обобщена по типам осей, потому что `strictTemplates` не пропустит `string` в типизированный
 * вход компонента.
 */
@Component({
    selector: 'app-story-grid',
    template: `
        @if (caption()) {
            <h3 class="app-story-grid__caption">{{ caption() }}</h3>
        }
        <div class="app-story-grid__scroll">
            <table class="app-story-grid__table">
                <thead>
                    <tr>
                        <td class="app-story-grid__corner"></td>
                        @for (col of columns(); track $index) {
                            <th scope="col" class="app-story-grid__head">{{ columnLabel()(col) }}</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (row of rows(); track $index) {
                        <tr>
                            <th scope="row" class="app-story-grid__head app-story-grid__head--row">{{ rowLabel()(row) }}</th>
                            @for (col of columns(); track $index) {
                                <td class="app-story-grid__cell">
                                    <div class="app-story-grid__slot" [style.inline-size]="slotWidth()">
                                        @if (cell(); as template) {
                                            <ng-container
                                                [ngTemplateOutlet]="template"
                                                [ngTemplateOutletContext]="{ $implicit: row, col: col }" />
                                        }
                                    </div>
                                </td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    `,
    styleUrl: './story-grid.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'app-story-grid',
    },
    imports: [
        // angular
        NgTemplateOutlet,
    ],
})
export class StoryGridComponent<ROW, COL> {
    protected readonly cell: Signal<TemplateRef<IStoryCell<ROW, COL>> | undefined> = contentChild(TemplateRef);

    /** Подпись над сеткой — что именно здесь перемножено. */
    public readonly caption: InputSignal<string> = input<string>('');

    /** Значения оси, идущей по строкам. */
    public readonly rows: InputSignal<readonly ROW[]> = input.required<readonly ROW[]>();

    /** Значения оси, идущей по столбцам. */
    public readonly columns: InputSignal<readonly COL[]> = input.required<readonly COL[]>();

    /**
     * Ширина ячейки. Нужна тому, что тянется на всю ширину родителя: поле ввода в ячейке
     * по содержимому схлопывается до нуля и показывает не размер, а его отсутствие.
     */
    public readonly slotWidth: InputSignal<string> = input<string>('');

    /** Подпись строки; по умолчанию — само значение. Нужна осям, чьи значения не строки. */
    public readonly rowLabel: InputSignal<(value: ROW) => string> = input<(value: ROW) => string>((value: ROW): string => String(value));

    /** Подпись столбца; по умолчанию — само значение. */
    public readonly columnLabel: InputSignal<(value: COL) => string> = input<(value: COL) => string>((value: COL): string => String(value));
}
