import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtAsideFooterComponent } from '../../../aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../../aside/header/rt-aside-header.component';
import { RtAsideComponent } from '../../../aside/rt-aside.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { IRtServiceLogo } from '../../../service-logo/rt-service-logo.model';
import { RtServiceBlockComponent } from '../../rt-service-block.component';

/** Поле панели: подпись, значение и подсказка под ним — так, как их рисует кадр. */
export interface IServiceBlockPanelField {
    readonly label: string;
    readonly value: string;
    readonly hint: string;
    readonly required: boolean;
}

/** Знак службы из кадра: в пакет он не уезжает, история его рисует ради сверки с макетом. */
const STRIPE_MARK: string =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M24.6347 12.2C21.7387 11.1253 20.16 10.2987 20.16 8.988C20.16 7.88 21.0707 7.248 22.6947 7.248C25.664 7.248 28.7147 8.392 30.8147 9.42267L32.0013 2.09733C30.336 1.3 26.9293 0 22.22 0C18.8893 0 16.1187 0.872 14.1387 2.496C12.08 4.196 11.0093 6.656 11.0093 9.624C11.0093 15.0093 14.2987 17.304 19.644 19.2493C23.0907 20.476 24.2373 21.348 24.2373 22.6933C24.2373 24 23.1173 24.7533 21.0987 24.7533C18.5987 24.7533 14.4787 23.5253 11.7787 21.9413L10.5787 29.348C12.9 30.6533 17.18 32 21.6187 32C25.14 32 28.076 31.168 30.056 29.5827C32.2747 27.8427 33.4227 25.268 33.4227 21.94C33.4227 16.436 30.0573 14.1387 24.6307 12.2H24.6347Z" fill="#635BFF"/>' +
            '</svg>'
    );

/**
 * Демонстрационная обёртка для витрины: панель подключения службы целиком, как кадр
 * «Оператор — панель Stripe · 1440» в макетах потребителя. Шапка, блок службы, четыре поля и
 * подвал собраны из компонентов кита, ширина панели — ширина кадра. История нужна для наложения
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
        // modules
        FormsModule,

        // standalone components / directives
        BlockDirective,
        ElemDirective,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtFieldComponent,
        RtInputComponent,
        RtServiceBlockComponent,
    ],
})
export class TestRtServiceBlockPanelComponent {
    public readonly logos: readonly IRtServiceLogo.Item[] = [{ src: STRIPE_MARK, label: 'Stripe' }];

    public readonly fields: readonly IServiceBlockPanelField[] = [
        {
            label: 'Секретный ключ',
            value: 'sk_live_51Px…a41c',
            hint: 'Stripe → Разработчики → Ключи API, «Секретный ключ». Начинается с sk_.',
            required: true,
        },
        {
            label: 'Ключ подписи вебхука',
            value: 'whsec_…9f02',
            hint: 'Stripe → Разработчики → Вебхуки, «Секрет подписи». Начинается с whsec_.',
            required: true,
        },
        {
            label: 'Открытый ключ',
            value: 'pk_live_51Px…7c2e',
            hint: 'Stripe → Разработчики → Ключи API, «Публикуемый ключ». Начинается с pk_.',
            required: true,
        },
        {
            label: 'Адрес извещений для кабинета Stripe',
            value: 'https://rent-ops.com/payments/stripe/platform',
            hint: 'Впишите его в Stripe: Разработчики → Вебхуки → Добавить адрес.',
            required: false,
        },
    ];
}
