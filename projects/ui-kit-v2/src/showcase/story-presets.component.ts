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
 * Обе половины прибивают свои назначения явно, как это делает пара тем: тумблер в тулбаре пишет
 * тему в `<html data-theme>`, и половина, положившаяся на умолчание, в тёмной теме показала бы
 * не свой набор, а тёмный — пара стала бы сравнением тёмной темы с материальным набором.
 * Материальной половине светлая основа нужна не меньше: набор переписывает полторы сотни
 * назначений и не трогает ещё полторы — не прибитые, они пришли бы от корня страницы, и
 * половина вышла бы наполовину материальной, наполовину тёмной. Прибито это в
 * `.storybook/storybook.scss`: назначения кит вешает на `:root`, и скоупнуть их можно только
 * из глобального стиля.
 *
 * Признак набора `data-preset='material'` стоит на половине сверх этого — тот самый, которым
 * набор включает приложение. Назначения он даёт те же, что прибитые, и повторяет их нарочно:
 * набор различается не только назначениями, и правило кита, написанное на самом признаке,
 * иначе в половину не попало бы вовсе.
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
}
