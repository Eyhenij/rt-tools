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

/**
 * Светлая и тёмная тема рядом.
 *
 * Тумблер в тулбаре показывает одну тему за раз, а расхождения контраста живут ровно на
 * сравнении: цвет, читаемый в светлой, пропадает в тёмной, и по очереди этого не увидеть.
 *
 * Каждая половина прибивает свой набор свойств явно — иначе та, что положилась на умолчание,
 * показала бы тему из тулбара, а не свою, и в тёмной теме пара становилась двумя одинаковыми
 * колонками. Наборы объявлены миксинами в `src/styles`, а накладываются на классы половин из
 * `.storybook/storybook.scss`: свойства тем кит вешает на `:root`, и скоупнуть их можно
 * только там, где стиль глобальный.
 *
 * Тёмная половина несёт ещё и признак `data-theme="dark"`: часть кита переключается не
 * свойствами, а правилами вида `[data-theme='dark'] .rt-логотип`, и без признака они в
 * половину не попадают.
 *
 * Чего пара не показывает: при тёмной теме в тулбаре светлая половина получает светлые
 * свойства, но правила `[data-theme='dark'] …` продолжают доставать её от `<html>` —
 * снять их изнутри нечем. Светлую половину смотрят при светлой теме в тулбаре.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */
@Component({
    selector: 'app-story-themes',
    template: `
        @if (caption()) {
            <h3 class="app-story-themes__caption">{{ caption() }}</h3>
        }
        <div class="app-story-themes__panes">
            <div class="app-story-themes__pane">
                <span class="app-story-themes__label">Светлая</span>
                @if (pane(); as template) {
                    <ng-container [ngTemplateOutlet]="template" />
                }
            </div>
            <div class="app-story-themes__pane app-story-themes__pane--dark" data-theme="dark">
                <span class="app-story-themes__label">Тёмная</span>
                @if (pane(); as template) {
                    <ng-container [ngTemplateOutlet]="template" />
                }
            </div>
        </div>
    `,
    styleUrl: './story-themes.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'app-story-themes',
    },
    imports: [
        // angular
        NgTemplateOutlet,
    ],
})
export class StoryThemesComponent {
    protected readonly pane: Signal<TemplateRef<unknown> | undefined> = contentChild(TemplateRef);

    /** Подпись над парой — что именно сравнивается. */
    public readonly caption: InputSignal<string> = input<string>('');
}
