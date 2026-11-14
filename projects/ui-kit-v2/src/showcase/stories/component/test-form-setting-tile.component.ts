import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtCollapsibleTextComponent } from '../../../lib/components/collapsible-text/rt-collapsible-text.component';
import { RtToggleSwitchComponent } from '../../../lib/components/toggle-switch/rt-toggle-switch.component';
import { StoryThemesComponent } from '../../story-themes.component';

/** Что показывает обёртка: сетку состояний, её же в двух темах, шаги скругления или узкое окно. */
export type TSettingTilePart = 'states' | 'themes' | 'radius' | 'narrow';

/** Длина пояснения: короткое в одну строку, длинное свёрнутое до двух строк или раскрытое. */
type TSettingTileText = 'short' | 'long' | 'expanded';

/** Состояние плитки, которое рисует аддон состояний или сам выключатель. */
type TSettingTileState = 'default' | 'hover' | 'focus' | 'disabled';

/** Одна плитка показа. */
interface ISettingTileCell {
    readonly qa: string;
    readonly on: boolean;
    readonly text: TSettingTileText;
    readonly state: TSettingTileState;
}

/** Шаг скругления общей рамки с подписью. */
interface IRadiusStep {
    readonly label: string;
    readonly step: string | null;
}

const LONG_TEXT: readonly string[] = [
    'Записывает действия посетителей на страницах сайта: движения мыши, прокрутку, нажатия и ввод в поля. Записи хранятся в счётчике Метрики 15 дней и видны в разделе «Вебвизор». Поля паролей и банковских карт не записываются.',
];

const STATES: readonly TSettingTileState[] = ['default', 'hover', 'focus', 'disabled'];

function cell(on: boolean, text: TSettingTileText, state: TSettingTileState): ISettingTileCell {
    return { qa: `setting-tile-${text}-${on ? 'on' : 'off'}-${state}`, on, text, state };
}

/**
 * Демонстрационная обёртка для витрины: плитка настройки словаря формы — запись-`<label>` в общей
 * рамке, с названием, выключателем и пояснением. Сетка повторяет набор `Setting Tile` макета:
 * строки — короткое, длинное и раскрытое пояснение при включённом и выключенном выключателе,
 * столбцы — покой, наведение, фокус клавиатуры и отключённая плитка. Наведение и фокус рисует
 * аддон состояний по признаку `data-story-state`; раскрытое пояснение раскрывает шаг `play`
 * истории — у сворачиваемого текста нет входа раскрытия.
 *
 * Длинное пояснение — `rt-collapsible-text` в приглушённом тоне, свёрнутое до двух строк, как в
 * макете. Название написано `span`, а не `label`: внутри `<label>` второй `<label>` запрещён.
 *
 * Ширина плитки — ширина кадра макета, 492, промежутки сетки — промежутки набора, чтобы сетку
 * можно было наложить на кадр целиком.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-form-setting-tile',
    templateUrl: './test-form-setting-tile.component.html',
    styleUrl: './test-form-setting-tile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        FormsModule,
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtCollapsibleTextComponent,
        RtToggleSwitchComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFormSettingTileComponent {
    protected readonly longText: readonly string[] = LONG_TEXT;

    protected readonly grid: readonly ISettingTileCell[] = (['short', 'long', 'expanded'] as const).flatMap(
        (text: TSettingTileText): ISettingTileCell[] =>
            [true, false].flatMap((on: boolean): ISettingTileCell[] =>
                STATES.map((state: TSettingTileState): ISettingTileCell => cell(on, text, state))
            )
    );

    protected readonly radiusSteps: readonly IRadiusStep[] = [
        { label: 'Default', step: null },
        ...['none', 'xs', 'sm', 'ms', 'md', 'lg', 'xl', '2xl', 'full'].map((step: string): IRadiusStep => ({ label: step, step })),
    ];

    protected readonly radiusCells: readonly ISettingTileCell[] = [cell(true, 'short', 'default'), cell(true, 'long', 'default')];

    /** Узкое окно: те же плитки, что в рамке «Узкая ширина» макета, в две колонки по 343. */
    protected readonly narrowColumns: readonly (readonly ISettingTileCell[])[] = [
        [cell(true, 'short', 'default'), cell(true, 'short', 'hover'), cell(true, 'long', 'default')],
        [cell(true, 'expanded', 'default'), cell(true, 'short', 'focus'), cell(true, 'short', 'disabled')],
    ];

    /** Что показать. */
    public readonly part: InputSignal<TSettingTilePart> = input<TSettingTilePart>('states');
}
