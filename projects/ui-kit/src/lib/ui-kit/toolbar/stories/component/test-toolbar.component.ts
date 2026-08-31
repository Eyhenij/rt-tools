import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    RtuiToolbarCenterDirective,
    RtuiToolbarComponent,
    RtuiToolbarLeftDirective,
    RtuiToolbarRightDirective,
} from '../../toolbar.component';

/**
 * Обёртка показа панели инструментов.
 *
 * Слоты панель берёт шаблонами, а не проекцией содержимого, — подать их снаружи истории нечем:
 * шаблон объявляется в разметке того, кто им владеет. Поэтому ручками истории служат признаки
 * «подан ли слот», а само содержимое слотов живёт здесь.
 *
 * Длинное содержимое под панелью — не украшение: закрепление неотличимо от обычной панели, пока
 * странице некуда прокручиваться.
 */
@Component({
    selector: 'app-toolbar',
    templateUrl: './test-toolbar.component.html',
    styleUrls: ['./test-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButton,
        MatIcon,
        MatIconButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiToolbarLeftDirective,
        RtuiToolbarCenterDirective,
        RtuiToolbarRightDirective,

        // components
        RtuiToolbarComponent,
    ],
})
export class TestToolbarComponent {
    public hasLeft: boolean = true;
    public hasCenter: boolean = true;
    public hasRight: boolean = true;
    public sticky: boolean = false;
    /** Содержимое под панелью выше окна: без него прокручивать нечего. */
    public longPage: boolean = false;
    public title: string = 'Записи';

    public readonly rows: number[] = Array.from({ length: 40 }, (_: unknown, index: number) => index + 1);
}
