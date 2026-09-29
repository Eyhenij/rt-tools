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
 * Свой набор оформления и материальный рядом.
 *
 * Набор — второй слой назначений поверх светлой темы: он переписывает цвет, скругление и тень,
 * оставляя разметку и размеры теми же. Разницу видно ровно на сравнении: по очереди половина
 * отличий читается как «так и было», а рядом — как правка.
 *
 * Половина своего набора несёт светлый признак темы, материальная — признак набора
 * `data-preset='material'`, тот самый, которым набор включает приложение. Оба признака кит
 * отрабатывает на любом узле, и этого довольно: половина, оставленная без признака, в тёмной
 * теме показала бы не свой набор, а тёмный — пара стала бы сравнением тёмной темы с
 * материальным набором.
 *
 * Светлая основа под материальной половиной приходит от того же признака набора: кит кладёт
 * набор и на пару тем внутри неё, иначе половина вышла бы наполовину материальной. Раньше это
 * прибивалось миксинами из `.storybook/storybook.scss` — с местным куском темы обвязки больше
 * нет.
 *
 * Чего пара не показывает: при тёмной теме в тулбаре правила вида `[data-theme='dark'] .rt-…`
 * продолжают доставать обе половины от `<html>` — снять их изнутри нечем. Пару смотрят при
 * светлой теме в тулбаре.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */
@Component({
    selector: 'app-story-presets',
    templateUrl: './story-presets.component.html',
    styleUrl: './story-presets.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'app-story-presets',
        // Корень показа: по нему обвязка снимков берёт область кадра — см. STORY_SNAPSHOT_ROOT_ATTRIBUTE.
        // Записан литералом, а не константой: метаданные компонента читаются сборщиком статически.
        'data-story-root': '',
        '[class.app-story-presets--fill]': 'fill()',
    },
    imports: [
        // angular
        NgTemplateOutlet,
    ],
})
export class StoryPresetsComponent {
    protected readonly pane: Signal<TemplateRef<unknown> | undefined> = contentChild(TemplateRef);

    /** Подпись над парой — что именно сравнивается. */
    public readonly caption: InputSignal<string> = input<string>('');

    /**
     * Показ занимает всю ширину половины. Нужен тому, что тянулось на ширину страницы: половина
     * ужимает содержимое по его собственной ширине, и показ одного экземпляра схлопывается.
     */
    public readonly fill: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Одна половина вместо пары, без признака набора. Нужна семье, которая свой вид ставит на себя
     * сама — таблице первого кита: её вид по умолчанию один, и пара показала бы его дважды.
     */
    public readonly single: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
