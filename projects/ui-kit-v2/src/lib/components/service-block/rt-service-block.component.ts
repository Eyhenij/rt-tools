import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtServiceLogo, RtServiceLogoComponent } from '@rt-tools/ui-kit-v2/service-logo';

const BEM_BLOCK: string = 'rt-service-block';

/**
 * Блок службы — первый блок тела панели настройки подключения: знак службы размера `md`, справа
 * имя службы и строка-описание, под блоком черта. Одна разметка на интеграции, способы оплаты и
 * мессенджеры. Своих текстов блок не несёт: имя, описание и подписи знаков даёт приложение.
 */
@Component({
    selector: 'rt-service-block',
    templateUrl: './rt-service-block.component.html',
    styleUrl: './rt-service-block.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtServiceLogoComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtServiceBlockComponent {
    /** Знаки службы — те же, что принимает `rt-service-logo`; несколько ложатся внахлёст. */
    public readonly logos: InputSignal<readonly IRtServiceLogo.Item[]> = input.required<readonly IRtServiceLogo.Item[]>();

    /** Имя службы — жирная строка справа от знака. */
    public readonly name: InputSignal<string> = input.required<string>();

    /** Строка-описание под именем. Пустая строка не рисуется. */
    public readonly description: InputSignal<string> = input<string>('');
}
