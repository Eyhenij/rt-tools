import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon';
import { RtTooltipDirective } from '../../../tooltip';
import { RtExpansionPanelContentDirective } from '../../rt-expansion-panel-content.directive';
import { RtExpansionPanelComponent } from '../../rt-expansion-panel.component';
import { IRtExpansionPanel } from '../../rt-expansion-panel.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TExpansionPanelMatrixPart = 'appearance' | 'opening' | 'length' | 'states' | 'presets' | 'themes';

/** Случай вида: имя для подписи ячейки и вид панели. */
interface IExpansionPanelAppearanceCase {
    readonly name: string;
    readonly appearance: IRtExpansionPanel.Appearance;
}

/** Случай раскрытия: имя для подписи ячейки, раскрытие и шеврон. */
interface IExpansionPanelOpeningCase {
    readonly name: string;
    readonly expanded: boolean;
    readonly hideToggle: boolean;
}

/** Случай длины: имя для подписи ячейки, заголовок и тело. */
interface IExpansionPanelLengthCase {
    readonly name: string;
    readonly title: string;
    readonly text: string;
}

/** Случай состояния: состояние указателя и фокуса, и недоступность — отдельной ячейкой. */
interface IExpansionPanelStateCase {
    readonly name: string;
    readonly state: string | null;
    readonly disabled: boolean;
}

const TITLE: string = 'Личные данные';
const TEXT: string = 'Имя, телефон и адрес доставки. Их видит только курьер, который везёт заказ.';

/**
 * Матрицы состояний `rt-expansion-panel` для витрины.
 *
 * Оси панели — вид (карточка и простая), раскрытие с шевроном и без него, длина заголовка и тела.
 * Раскрытие ставится входом: матрица показывает положения, движение раскрытия видно в `Playground`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-expansion-panel-matrix',
    templateUrl: './test-expansion-panel-matrix.component.html',
    styleUrl: './test-expansion-panel-matrix.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        RtExpansionPanelContentDirective,
        RtTooltipDirective,

        // components
        RtExpansionPanelComponent,
        RtIconComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtExpansionPanelMatrixComponent {
    public part: TExpansionPanelMatrixPart = 'appearance';

    public readonly title: string = TITLE;
    public readonly text: string = TEXT;

    public readonly appearances: readonly IExpansionPanelAppearanceCase[] = [
        { name: 'карточка — умолчание', appearance: 'card' },
        { name: 'простая', appearance: 'plain' },
    ];

    public readonly openings: readonly IExpansionPanelOpeningCase[] = [
        { name: 'свёрнута — умолчание', expanded: false, hideToggle: false },
        { name: 'раскрыта', expanded: true, hideToggle: false },
        { name: 'без шеврона', expanded: false, hideToggle: true },
    ];

    public readonly lengths: readonly IExpansionPanelLengthCase[] = [
        { name: 'короткий заголовок', title: TITLE, text: TEXT },
        {
            name: 'заголовок режется',
            title: 'Личные данные, адрес доставки, способ оплаты и согласие на рассылку новостей магазина',
            text: TEXT,
        },
        {
            name: 'длинное тело',
            title: TITLE,
            text:
                'Имя, телефон и адрес доставки. Их видит только курьер, который везёт заказ. Адрес можно ' +
                'поменять до передачи заказа в доставку; после этого — только через поддержку, и курьер ' +
                'получит новый адрес вместе с сообщением.',
        },
    ];

    public readonly states: readonly IExpansionPanelStateCase[] = [
        ...STORY_STATES.map((state: IStoryState): IExpansionPanelStateCase => ({ name: state.name, state: state.state, disabled: false })),
        { name: 'недоступна', state: null, disabled: true },
    ];

    /** Одна ячейка ряда: ряд задаёт ей ширину и подпись. */
    public readonly single: readonly IExpansionPanelOpeningCase[] = [{ name: 'раскрыта', expanded: true, hideToggle: false }];

    public readonly appearanceLabel: (value: IExpansionPanelAppearanceCase) => string = (value: IExpansionPanelAppearanceCase): string =>
        value.name;
    public readonly openingLabel: (value: IExpansionPanelOpeningCase) => string = (value: IExpansionPanelOpeningCase): string => value.name;
    public readonly lengthLabel: (value: IExpansionPanelLengthCase) => string = (value: IExpansionPanelLengthCase): string => value.name;
    public readonly stateLabel: (value: IExpansionPanelStateCase) => string = (value: IExpansionPanelStateCase): string => value.name;
}
