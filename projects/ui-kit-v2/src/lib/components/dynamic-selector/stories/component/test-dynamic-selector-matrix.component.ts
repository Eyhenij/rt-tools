import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtDynamicInputComponent } from '../../dynamic-input/rt-dynamic-input.component';
import { RtDynamicSelectorPopupComponent } from '../../popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorComponent } from '../../rt-dynamic-selector.component';
import { RtDynamicSelectorRowControlsDirective, RtDynamicSelectorRowTitleDirective } from '../../rt-dynamic-selector.directives';
import { IRtDynamicSelector } from '../../rt-dynamic-selector.model';
import { TRtRadius } from '../../../radius/rt-radius.model';
import { IButton } from '../../../button/rt-button.model';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IStoryPerson, STORY_PEOPLE } from './test-dynamic-selector.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDynamicSelectorMatrixPart =
    | 'rows'
    | 'radius'
    | 'templates'
    | 'invitation'
    | 'states'
    | 'popup'
    | 'input'
    | 'switches'
    | 'initial-query'
    | 'look'
    | 'presets'
    | 'themes';

/** Вид, который задаёт приложение: значок и вид приглашения, значок очистки. */
interface ILookCase {
    readonly name: string;
    readonly invitation: boolean;
    readonly invitationButtonIcon: IRtIcon.Name | null;
    readonly invitationButtonAppearance: IButton.Appearance;
    readonly clearIcon: IRtIcon.Name;
    readonly control: FormControl<number[] | null>;
    /** Подпись записи функцией; не задана — поле `name`. */
    readonly displayWith?: (person: IStoryPerson) => string;
}

/** Переключатели списка: корзина, панель сброса и очистки, правки в шаблоне строки. */
interface ISwitchesCase {
    readonly name: string;
    readonly removeShown: boolean;
    readonly listActionsShown: boolean;
    readonly extraChanged: boolean;
    readonly control: FormControl<number[] | null>;
}

/** Случай списка выбранного: что показано строками и что с ними можно сделать. */
interface IRowsCase {
    readonly name: string;
    readonly draggable: boolean;
    readonly readonlyKeys: readonly number[];
    readonly control: FormControl<number[] | null>;
}

/** Случай скругления кнопок-иконок списка. */
interface IRadiusCase {
    readonly name: string;
    readonly buttonRadius: TRtRadius | null;
    readonly control: FormControl<number[] | null>;
}

/** Случай окна выбора: окно поставлено прямо в разметку, в оверлее оно было бы одно. */
interface IPopupCase {
    readonly name: string;
    readonly entities: readonly IStoryPerson[];
    readonly mode: IRtDynamicSelector.Mode;
    readonly multiToggleShown: boolean;
    readonly loading: boolean;
    readonly pinnedKeys: readonly number[];
    /** Перенос подписей пунктов; не задан — переносятся, как по умолчанию. */
    readonly titleWrap?: boolean;
    /** Начальный запрос окна; не задан — окно без запроса. */
    readonly searchTerm?: string;
    /** Подсветка совпавших с поиском символов; не задана — выключена, как по умолчанию. */
    readonly highlightSearch?: boolean;
    /** Своя подпись кнопки применения; не задана — подпись кита. */
    readonly applyLabel?: string;
    /** Регистр подписи кнопки применения; не задан — как есть. */
    readonly applyLabelCase?: IRtDynamicSelector.LabelCase;
    /** Свойства окна на нём самом; не заданы — умолчания кита. */
    readonly popupStyle?: Readonly<Record<string, string>>;
}

/** Случай поля строк. */
interface IInputCase {
    readonly name: string;
    readonly editable: boolean;
    readonly draggable: boolean;
    readonly readonlyKeys: readonly string[];
    readonly control: FormControl<string[] | null>;
}

/** Адреса поля строк — придуманные, в зарезервированном для примеров домене. */
const NORTH: string = 'north@example.test';
const SOUTH: string = 'south@example.test';

function chosen(keys: number[]): FormControl<number[] | null> {
    return new FormControl<number[] | null>(keys);
}

function disabled(keys: number[]): FormControl<number[] | null> {
    return new FormControl<number[] | null>({ value: keys, disabled: true });
}

function texts(values: string[]): FormControl<string[] | null> {
    return new FormControl<string[] | null>(values);
}

/**
 * Матрицы состояний `rt-dynamic-selector` для витрины.
 *
 * Оси не перемножены: перетаскивание, строки только для чтения и отключение меняют разные части
 * строки и вместе ничего нового не показывают. Окно выбора стоит в разметке, а не в оверлее:
 * открытое окно в истории было бы ровно одно, а случаев у него шесть.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-selector-matrix',
    templateUrl: './test-dynamic-selector-matrix.component.html',
    styleUrl: './test-dynamic-selector-matrix.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDynamicInputComponent,
        RtFieldComponent,
        RtDynamicSelectorRowControlsDirective,
        RtDynamicSelectorRowTitleDirective,
        RtIconButtonComponent,
        RtDynamicSelectorComponent,
        RtDynamicSelectorPopupComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDynamicSelectorMatrixComponent {
    public part: TDynamicSelectorMatrixPart = 'rows';

    /** Ширина ячейки поля: строка с тремя кнопками и именем в две части помещается целиком. */
    public readonly fieldWidth: string = '22rem';
    /** Ширина окна выбора — его собственная, 20rem, как у первого кита. */
    public readonly popupWidth: string = '20rem';
    public readonly people: readonly IStoryPerson[] = STORY_PEOPLE;

    public readonly rowsCases: readonly IRowsCase[] = [
        { name: 'строки', draggable: false, readonlyKeys: [], control: chosen([1, 2, 3]) },
        { name: 'перетаскивание', draggable: true, readonlyKeys: [], control: chosen([1, 2, 3]) },
        { name: 'только для чтения', draggable: true, readonlyKeys: [1, 3], control: chosen([1, 2, 3]) },
        { name: 'пусто', draggable: false, readonlyKeys: [], control: chosen([]) },
    ];

    /** Шаги скругления кнопок: круг по умолчанию, шаг кнопки-иконки и квадрат без скругления. */
    public readonly radiusCases: readonly IRadiusCase[] = [
        { name: 'full — по умолчанию', buttonRadius: 'full', control: chosen([1, 2]) },
        { name: 'md', buttonRadius: 'md', control: chosen([1, 2]) },
        { name: 'none', buttonRadius: 'none', control: chosen([1, 2]) },
    ];

    public readonly invitationCases: readonly {
        readonly name: string;
        readonly entities: readonly IStoryPerson[];
        readonly invitation: boolean;
        readonly control: FormControl<number[] | null>;
    }[] = [
        { name: 'приглашение', entities: STORY_PEOPLE, invitation: true, control: chosen([]) },
        { name: 'приглашение со строками', entities: STORY_PEOPLE, invitation: true, control: chosen([4]) },
        { name: 'нечего выбрать', entities: [], invitation: false, control: chosen([]) },
    ];

    public readonly lookCases: readonly ILookCase[] = [
        {
            name: 'приглашение: значок, заливка',
            invitation: true,
            invitationButtonIcon: 'ico-plus',
            invitationButtonAppearance: 'filled',
            clearIcon: 'close',
            control: chosen([]),
        },
        {
            name: 'приглашение: значок, текст',
            invitation: true,
            invitationButtonIcon: 'ico-plus',
            invitationButtonAppearance: 'text',
            clearIcon: 'close',
            control: chosen([]),
        },
        {
            name: 'очистка корзиной с крестом',
            invitation: false,
            invitationButtonIcon: null,
            invitationButtonAppearance: 'outlined',
            clearIcon: 'trash-x',
            control: chosen([1, 2]),
        },
        {
            name: 'своя подпись записи: фамилия первой',
            invitation: false,
            invitationButtonIcon: null,
            invitationButtonAppearance: 'outlined',
            clearIcon: 'close',
            control: chosen([1, 2]),
            displayWith: (person: IStoryPerson): string => person.name.split(' ').reverse().join(' '),
        },
    ];

    /** Окно: поле поиска «fill» и своя подпись пустого результата; второе — со своими свойствами. */
    /** Свойства окна на его предке: так приложение задаёт их на панели оверлея или своём контейнере. */
    public readonly tunedPopupStyle: Readonly<Record<string, string>> = {
        '--rt-dynamic-selector-popup-bg': 'var(--rt-color-bg-subtle)',
        '--rt-dynamic-selector-popup-padding': 'var(--rt-space-lg)',
        '--rt-dynamic-selector-popup-foot-border-width': '0',
        '--rt-dynamic-selector-popup-button-height': 'var(--rt-control-height-sm)',
        '--rt-dynamic-selector-popup-button-font-size': 'var(--rt-text-sm)',
        '--rt-dynamic-selector-popup-option-line-height': 'var(--rt-size-5)',
        '--rt-dynamic-selector-popup-option-min-height': 'var(--rt-size-12)',
        '--rt-dynamic-selector-popup-empty-gap': 'var(--rt-space-xs)',
        '--rt-dynamic-selector-popup-foot-padding': 'var(--rt-space-md) var(--rt-space-lg) 0 var(--rt-space-sm)',
    };

    public readonly lookPopupCases: readonly {
        readonly name: string;
        readonly entities: readonly IStoryPerson[];
        readonly tuned: boolean;
    }[] = [
        { name: 'поиск fill, своя подпись', entities: [], tuned: false },
        { name: 'свои свойства окна', entities: STORY_PEOPLE.slice(0, 3), tuned: true },
        { name: 'свои свойства пустого результата', entities: [], tuned: true },
    ];

    /** Записи с длинными названиями: на них видно, переносится название строки или режется. */
    public readonly longPeople: readonly IStoryPerson[] = [
        { id: 1, name: 'Анна Сергеевна Константинопольская-Преображенская' },
        { id: 2, name: 'Борис Игнатьевич Воскресенский' },
    ];

    /** Название строки: переносится по умолчанию, а без переноса режется многоточием. */
    public readonly titleCases: readonly {
        readonly name: string;
        readonly wrap: boolean;
        readonly control: FormControl<number[] | null>;
    }[] = [
        { name: 'название переносится', wrap: true, control: chosen([1, 2]) },
        { name: 'название одной строкой', wrap: false, control: chosen([1, 2]) },
    ];

    /** Поле строк: приглашение с именем Material, подпись поля кита и подпись поля новой строки. */
    public readonly lookInputCases: readonly {
        readonly name: string;
        readonly label: string | null;
        readonly fieldLabel: string | null;
        readonly control: FormControl<string[] | null>;
    }[] = [
        { name: 'приглашение: имя Material', label: null, fieldLabel: null, control: new FormControl<string[] | null>([]) },
        {
            name: 'подпись поля кита',
            label: 'Почта для копий',
            fieldLabel: null,
            control: new FormControl<string[] | null>(['anna@example.com']),
        },
        {
            name: 'подпись поля новой строки',
            label: null,
            fieldLabel: 'Адрес для копии',
            control: new FormControl<string[] | null>(['anna@example.com']),
        },
    ];

    public readonly stateCases: readonly IRowsCase[] = [
        { name: 'отключено', draggable: true, readonlyKeys: [], control: disabled([1, 2]) },
        { name: 'только чтение, всё закреплено', draggable: false, readonlyKeys: [1, 2], control: chosen([1, 2]) },
    ];

    public readonly popupCases: readonly IPopupCase[] = [
        { name: 'несколько', entities: STORY_PEOPLE.slice(0, 5), mode: 'multi', multiToggleShown: false, loading: false, pinnedKeys: [] },
        {
            name: 'переключатель «несколько»',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'multi',
            multiToggleShown: true,
            loading: false,
            pinnedKeys: [],
        },
        {
            name: 'закреплённые',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [1, 2],
        },
        {
            name: 'одна запись',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
        },
        { name: 'загрузка', entities: [], mode: 'multi', multiToggleShown: false, loading: true, pinnedKeys: [] },
        { name: 'ничего не найдено', entities: [], mode: 'multi', multiToggleShown: false, loading: false, pinnedKeys: [] },
        {
            name: 'длинные подписи с переносом',
            entities: this.longPeople,
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
        },
        {
            name: 'длинные подписи одной строкой',
            entities: this.longPeople,
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            titleWrap: false,
        },
        {
            name: 'короткие подписи одной строкой',
            entities: STORY_PEOPLE.slice(0, 3),
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            titleWrap: false,
        },
        {
            name: 'одна запись, одной строкой',
            entities: this.longPeople,
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            titleWrap: false,
        },
        {
            name: 'подсветка поиска',
            entities: this.longPeople,
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            searchTerm: 'ск',
            highlightSearch: true,
        },
        {
            name: 'подсветка поиска одной строкой',
            entities: this.longPeople,
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            titleWrap: false,
            searchTerm: 'ск',
            highlightSearch: true,
        },
        {
            name: 'подсветка поиска фоном со скруглением',
            entities: this.longPeople,
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            searchTerm: 'ск',
            highlightSearch: true,
            popupStyle: {
                '--rt-dynamic-selector-popup-highlight-bg': 'var(--rt-color-state-warning-bg)',
                '--rt-dynamic-selector-popup-highlight-color': 'var(--rt-color-state-warning-text)',
                '--rt-dynamic-selector-popup-highlight-radius': 'var(--rt-radius-xs)',
            },
        },
        {
            name: 'своя подпись кнопки, каждое слово с заглавной',
            entities: STORY_PEOPLE.slice(0, 3),
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            applyLabel: 'отправить выбор',
            applyLabelCase: 'title',
        },
        {
            name: 'подпись кита заглавными',
            entities: STORY_PEOPLE.slice(0, 3),
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
            applyLabelCase: 'upper',
        },
    ];

    /** Прежний список стоит первым — рядом видно, что убирает каждый переключатель. */
    public readonly switchesCases: readonly ISwitchesCase[] = [
        { name: 'как прежде', removeShown: true, listActionsShown: true, extraChanged: false, control: chosen([1, 2]) },
        { name: 'без корзины', removeShown: false, listActionsShown: true, extraChanged: false, control: chosen([1, 2]) },
        { name: 'без сброса и очистки', removeShown: true, listActionsShown: false, extraChanged: false, control: chosen([1, 2]) },
        { name: 'правки в строках', removeShown: true, listActionsShown: true, extraChanged: true, control: chosen([1, 2]) },
    ];

    /** Начальный запрос: окно открыто с текстом в поиске и предлагает только совпадения. */
    public readonly initialQueryEntities: readonly IStoryPerson[] = STORY_PEOPLE;

    public readonly inputCases: readonly IInputCase[] = [
        {
            name: 'строки',
            editable: false,
            draggable: false,
            readonlyKeys: [],
            control: texts([NORTH, SOUTH]),
        },
        {
            name: 'правка',
            editable: true,
            draggable: false,
            readonlyKeys: [],
            control: texts([NORTH, SOUTH]),
        },
        {
            name: 'перетаскивание и закреплённая',
            editable: false,
            draggable: true,
            readonlyKeys: [NORTH],
            control: texts([NORTH, SOUTH]),
        },
    ];

    public readonly themeReadonly: readonly number[] = [1];
    public readonly themePinned: readonly number[] = [1];
    public readonly themeControl: FormControl<number[] | null> = chosen([1, 2]);
    public readonly presetsControl: FormControl<number[] | null> = chosen([1, 2]);
    public readonly templatesControl: FormControl<number[] | null> = chosen([4, 5]);

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
