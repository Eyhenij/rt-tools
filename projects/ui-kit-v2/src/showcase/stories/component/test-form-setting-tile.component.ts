import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtToggleSwitchComponent } from '../../../lib/components/toggle-switch/rt-toggle-switch.component';

/** Одна плитка показа: включена ли настройка и стоит ли на плитке наведение. */
interface ISettingTileCell {
    readonly qa: string;
    readonly on: boolean;
    readonly state: string | null;
}

/**
 * Демонстрационная обёртка для витрины: плитка настройки словаря формы — запись-`<label>` в общей
 * рамке, с названием, выключателем и пояснением. Четыре плитки повторяют четыре кадра макета:
 * включена и выключена, в покое и при наведении. Наведение рисует аддон состояний по признаку
 * `data-story-state`.
 *
 * Название написано `span`, а не `label`: внутри `<label>` второй `<label>` запрещён. Каждая
 * плитка стоит в своей рамке, как стоит плитка настройки у потребителя.
 *
 * Ширина колонки — ширина кадра макета, 492, чтобы плитку можно было наложить на кадр. В узком
 * виде колонка занимает окно телефона, а название длинное: видно, что выключатель остаётся
 * справа, а название переносится.
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

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtToggleSwitchComponent,
    ],
})
export class TestRtFormSettingTileComponent {
    protected readonly cells: readonly ISettingTileCell[] = [
        { qa: 'setting-tile-on', on: true, state: null },
        { qa: 'setting-tile-off', on: false, state: null },
        { qa: 'setting-tile-on-hover', on: true, state: 'hover' },
        { qa: 'setting-tile-off-hover', on: false, state: 'hover' },
    ];

    /** Узкий вид: колонка во всю ширину окна и длинное название. */
    public readonly narrow: InputSignal<boolean> = input<boolean>(false);
}
