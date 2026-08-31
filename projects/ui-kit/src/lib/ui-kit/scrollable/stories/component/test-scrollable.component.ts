import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../scrollable-container.component';

/**
 * Обёртка показа прокручиваемого контейнера.
 *
 * Части подаются шаблонами, и снаружи истории их не подать: шаблон объявляется в разметке того,
 * кто им владеет. Ручками поэтому служат признаки подачи, а содержимое живёт здесь.
 *
 * Высота хоста задана обёрткой намеренно: компонент объявлен на всю высоту родителя, а у
 * истории родитель растёт по содержимому — без заданной высоты прокручиваться нечему, и тело
 * уезжает вниз вместе со страницей.
 */
@Component({
    selector: 'app-scrollable',
    templateUrl: './test-scrollable.component.html',
    styleUrls: ['./test-scrollable.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,

        // components
        RtuiScrollableContainerComponent,
    ],
})
export class TestScrollableComponent {
    public hasHeader: boolean = true;
    public hasContent: boolean = true;
    public hasFooter: boolean = true;
    /** Сколько строк в теле: короткое содержимое полосы прокрутки не заводит, длинное заводит. */
    public rowCount: number = 40;
    public title: string = 'Прокручиваемый контейнер';

    public get rows(): number[] {
        return Array.from({ length: this.rowCount }, (_: unknown, index: number) => index + 1);
    }
}
