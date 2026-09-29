import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    input,
    InputSignal,
    InputSignalWithTransform,
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
 * Каждая половина несёт свой признак темы — `data-theme`, — и этого довольно: кит отвечает
 * признаком на любом узле, не только на корне страницы. Без признака половина, положившаяся
 * на умолчание, показала бы тему из тулбара, а не свою, и в тёмной теме пара становилась
 * двумя одинаковыми колонками.
 *
 * Раньше половины прибивали набор свойств миксинами из `.storybook/storybook.scss`: кит
 * вешал свойства темы только на `:root`, и скоупнуть их можно было лишь глобальным стилем.
 * С местным куском темы этой обвязки больше нет.
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
            <div class="app-story-themes__pane" data-theme="light">
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
        // Корень показа: по нему обвязка снимков берёт область кадра — см. STORY_SNAPSHOT_ROOT_ATTRIBUTE.
        // Записан литералом, а не константой: метаданные компонента читаются сборщиком статически.
        'data-story-root': '',
        '[class.app-story-themes--fill]': 'fill()',
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

    /**
     * Показ занимает всю ширину половины — тот же вход, что у пары наборов. Половина ужимает
     * содержимое по его собственной ширине, и список с таблицей внутри вставал на ширину таблицы:
     * на холсте 900 px он выходил за край половины на 197 px и ложился на соседнюю.
     */
    public readonly fill: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
