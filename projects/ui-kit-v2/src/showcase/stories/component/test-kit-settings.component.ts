import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { StoryPresetsComponent } from '../../story-presets.component';

/**
 * Демонстрационная обёртка для витрины: умолчания, заданные киту одной раздачей на старте.
 *
 * История поднята с настройками `{ button: { size: 'lg', appearance: 'outlined' } }` — их
 * объявляет декоратор самой истории. Обе кнопки нарисованы одним и тем же китом в одном и том
 * же месте, и разница между ними ровно одна: первая о своём виде молчит и берёт умолчание из
 * настроек, вторая говорит и перебивает их.
 *
 * Пара наборов оформления обязательна: настройки задают вид и размер кнопки, а набор
 * переписывает назначения, которыми кнопка красится, — без пары половина этого не видна.
 *
 * Чего показ не показывает: перебор всех полей настроек. Каждое действует тем же способом, что
 * показанное, — ряд из четырёх одинаковых по смыслу ячеек ничего не добавил бы. И подмену
 * настроек на живой странице: настройки читаются один раз, когда узел создан, и кадру нечего
 * было бы сличать.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-kit-settings',
    template: `
        <app-story-presets caption="Умолчание из настроек и слово разметки — в обоих наборах">
            <ng-template>
                <div class="app-kit-settings__cases">
                    <div class="app-kit-settings__case">
                        <button rtButton label="Сохранить"></button>
                        <span class="app-kit-settings__label">Разметка молчит: вид и размер из настроек</span>
                    </div>

                    <div class="app-kit-settings__case">
                        <button rtButton label="Сохранить" size="md" appearance="filled"></button>
                        <span class="app-kit-settings__label">Разметка сказала своё: настройки перебиты</span>
                    </div>
                </div>
            </ng-template>
        </app-story-presets>
    `,
    styles: [
        `
            .app-kit-settings__cases {
                display: flex;
                flex-direction: column;
                gap: var(--rt-space-16);
                align-items: flex-start;
            }

            .app-kit-settings__case {
                display: flex;
                flex-direction: column;
                gap: var(--rt-space-8);
                align-items: flex-start;
            }

            .app-kit-settings__label {
                color: var(--rt-color-text-muted);
                font-size: var(--rt-text-2xs);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtButtonDirective,
        StoryPresetsComponent,
    ],
})
export class TestRtKitSettingsComponent {}
