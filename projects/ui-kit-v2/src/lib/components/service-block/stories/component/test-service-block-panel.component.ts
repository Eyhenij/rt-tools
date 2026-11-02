import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtAsideFooterComponent } from '../../../aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../../aside/header/rt-aside-header.component';
import { RtAsideComponent } from '../../../aside/rt-aside.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtCopyCellComponent } from '../../../table/copy-cell/rt-copy-cell.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtMessageComponent } from '../../../message/rt-message.component';
import { IRtServiceLogo } from '../../../service-logo/rt-service-logo.model';
import { RtServiceBlockComponent } from '../../rt-service-block.component';

/** Поле панели: подпись, подсказка внутри поля и строка под ним — так, как их рисует эталон. */
export interface IServiceBlockPanelField {
    readonly label: string;
    readonly placeholder: string;
    readonly hint: string;
}

/**
 * Демонстрационная обёртка для витрины: панель подключения службы целиком, как эталон кита
 * «Stripe · 540» на странице «Панель подключения службы». Шапка, блок службы, три поля, адрес
 * извещений и подвал собраны из компонентов кита, ширина панели — ширина эталона. История нужна для наложения
 * на кадр: промежуток под блоком службы виден только рядом с полями под ним.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-service-block-panel',
    templateUrl: './test-service-block-panel.component.html',
    styleUrl: './test-service-block-panel.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtCopyCellComponent,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
        RtServiceBlockComponent,
    ],
})
export class TestRtServiceBlockPanelComponent {
    /**
     * Знак — значок карты из кита, а не знак самой службы: чужих товарных знаков витрина не рисует.
     */
    public readonly logos: readonly IRtServiceLogo.Item[] = [{ icon: 'credit-card', label: 'Stripe' }];

    public readonly fields: readonly IServiceBlockPanelField[] = [
        {
            label: 'Секретный ключ',
            placeholder: 'demo_secret_9f3b2c7a1e5d4086b2c9e7f1a3d5b8c0e2f4a6b8c0d2e4f6a8',
            hint: 'Лежит в кабинете Stripe: Разработчикам → Ключи API',
        },
        {
            label: 'Ключ подписи вебхука',
            placeholder: 'demo_signing_4c8e2a6f0b3d7915e8a2c4f6b0d3e7',
            hint: 'Появится в Stripe, когда добавите адрес извещений ниже',
        },
        {
            label: 'Публикуемый ключ',
            placeholder: 'demo_public_7b1d5f9a3c6e0824d7b1f5a9c3e6d0b4f8a2c6e0d4b8f2a6',
            hint: 'Лежит рядом с секретным: Разработчикам → Ключи API',
        },
    ];
}
