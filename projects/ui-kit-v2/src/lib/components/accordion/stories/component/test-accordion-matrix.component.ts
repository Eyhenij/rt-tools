import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAccordionComponent } from '../../rt-accordion.component';
import { IRtAccordion } from '../../rt-accordion.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAccordionMatrixPart = 'opening' | 'length' | 'states' | 'presets' | 'themes';

/** Случай раскрытия: имя для подписи ячейки и пункт, раскрытый при входе. */
interface IAccordionOpeningCase {
    readonly name: string;
    readonly openIndex: number | null;
}

/** Случай длины: имя для подписи ячейки и пункты. */
interface IAccordionLengthCase {
    readonly name: string;
    readonly items: readonly IRtAccordion.Item[];
}

const ITEMS: readonly IRtAccordion.Item[] = [
    { title: 'Сколько идёт доставка?', text: 'По городу — один день, в другие города — от трёх до пяти дней.' },
    { title: 'Можно ли вернуть товар?', text: 'Да, в течение четырнадцати дней, если сохранена упаковка.' },
    { title: 'Как оплатить заказ?', text: 'Картой на сайте или наличными курьеру при получении.' },
];

const LONG_TITLE: string = 'Что делать, если курьер не приехал в назначенное время и не отвечает на звонки?';

const LONG_TEXT: string =
    'Напишите в поддержку номер заказа. Мы свяжемся со службой доставки, узнаем, где посылка, и ' +
    'назначим новое время. Если заказ задержался больше чем на сутки, стоимость доставки вернётся ' +
    'на карту, с которой он оплачен.';

/**
 * Матрицы состояний `rt-accordion` для витрины.
 *
 * Своя ось у компонента одна — какие пункты раскрыты. Вторая ось — длина: заголовок, который не
 * помещается в строку, переносится, и стрелка остаётся у правого края.
 *
 * Раскрытие ставится входом `openIndex`: матрица показывает положения, а не ведёт нажатия. Несколько
 * раскрытых пунктов получаются только нажатиями, и их показывает `Playground`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-accordion-matrix',
    templateUrl: './test-accordion-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAccordionComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAccordionMatrixComponent {
    public part: TAccordionMatrixPart = 'opening';

    public readonly items: readonly IRtAccordion.Item[] = ITEMS;

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly openings: readonly IAccordionOpeningCase[] = [
        { name: 'первый раскрыт — умолчание', openIndex: 0 },
        { name: 'раскрыт третий', openIndex: 2 },
        { name: 'все свёрнуты', openIndex: null },
    ];

    public readonly lengths: readonly IAccordionLengthCase[] = [
        { name: 'короткий заголовок', items: [ITEMS[0]] },
        { name: 'заголовок переносится', items: [{ title: LONG_TITLE, text: ITEMS[0].text }] },
        { name: 'длинный ответ', items: [{ title: ITEMS[0].title, text: LONG_TEXT }] },
    ];

    /** Одна ячейка ряда: ряд задаёт ей ширину и подпись. */
    public readonly single: readonly IAccordionLengthCase[] = [{ name: 'три вопроса, первый раскрыт', items: ITEMS }];

    public readonly openingLabel: (value: IAccordionOpeningCase) => string = (value: IAccordionOpeningCase): string => value.name;
    public readonly lengthLabel: (value: IAccordionLengthCase) => string = (value: IAccordionLengthCase): string => value.name;
}
